import connectDB from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import { SignJWT } from "jose";
import { catchError, generateOTP, response } from "@/lib/helpherfunction";
import UserModel from "@/models/user.model";
import OTPModel from "@/models/Otp.model";
import { sendMail } from "@/lib/sendMail";
import { otpEmail } from "@/email/otpEmail";

export async function POST(request: Request) {
  try {
    await connectDB();

    const payload = await request.json();
    const validateData = zSchema
      .pick({ email: true, password: true })
      .safeParse(payload);

    if (!validateData.success) {
      const errors = validateData.error.errors.map((err) => err.message);
      return response(false, 400, "Invalid input", { errors });
    }

    const emailInput = validateData.data.email.trim().toLowerCase();
    const passwordInput = validateData.data.password.trim();

    // 🔍 Find user
    const user = await UserModel.findOne({ email: emailInput }).select("+password");
    if (!user) {
      console.log("❌ No user found with email:", emailInput);
      return response(false, 404, "Email not found");
    }

    // 🔑 Compare password
    const isMatch = await user.comparePassword(passwordInput);
    if (!isMatch) {
      console.log("❌ Incorrect password for:", emailInput);
      return response(false, 401, "Incorrect password");
    }

    // 🧹 Remove old OTPs
    await OTPModel.deleteMany({ email: emailInput });

    // 🔢 Generate and save OTP
    const otp = generateOTP();
    const newOtpData = new OTPModel({ email: emailInput, otp });
    await newOtpData.save();

    // 📧 Send OTP mail
    const otpEmailStatus = await sendMail("Login OTP", emailInput, otpEmail(otp));
    if (!otpEmailStatus.success) {
      return response(false, 400, "Failed to send OTP");
    }

    // 🔐 Generate 10 min temp token
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) return response(false, 500, "Server misconfiguration");

    const secret = new TextEncoder().encode(secretKey);
    const token = await new SignJWT({ email: emailInput, otpSent: true })
      .setIssuedAt()
      .setExpirationTime("10m")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    console.log("✅ OTP sent successfully for:", emailInput);
    return response(true, 200, "OTP sent successfully", { token });
  } catch (error) {
    console.error("⚠️ Login API error:", error);
    return catchError(error, "Login failed");
  }
}
