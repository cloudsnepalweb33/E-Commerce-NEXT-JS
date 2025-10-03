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
    // 1️⃣ Connect to database
    await connectDB();

    // 2️⃣ Parse request body
    const payload = await request.json();
    const validateData = zSchema.pick({ email: true, password: true }).safeParse(payload);

    if (!validateData.success) {
      const errors = validateData.error.errors.map(err => err.message);
      return response(false, 400, "Invalid input", { errors });
    }

    const emailInput = validateData.data.email.trim().toLowerCase();
    const passwordInput = validateData.data.password.trim();

    console.log("👤 Login attempt for:", emailInput);

    // 3️⃣ Find user
    const user = await UserModel.findOne({ email: emailInput }).select("+password");
    if (!user) {
      console.log("❌ No user found with email:", emailInput);
      return response(false, 401, "ईमेल वा पासवर्ड मिलेन");
    }

    // 4️⃣ Compare password
    const isMatch = await user.comparePassword(passwordInput);
    console.log("🔑 Password match:", isMatch);
    if (!isMatch) return response(false, 401, "पासवर्ड मिलेन");

    // 5️⃣ Remove old OTPs
    await OTPModel.deleteMany({ email: emailInput });

    // 6️⃣ Generate new OTP and save
    const otp = generateOTP();
    const newOtpData = new OTPModel({ email: emailInput, otp });
    await newOtpData.save();

    // 7️⃣ Send OTP via email
    const otpEmailStatus = await sendMail("Login OTP", emailInput, otpEmail(otp));
    if (!otpEmailStatus.success) {
      console.log("❌ OTP sending failed for:", emailInput);
      return response(false, 400, "OTP पठाउन असफल");
    }

    // 8️⃣ Generate temporary token (10 min)
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) return response(false, 500, "Server misconfiguration: SECRET_KEY छैन");

    const secret = new TextEncoder().encode(secretKey);
    const token = await new SignJWT({ email: emailInput, otpSent: true })
      .setIssuedAt()
      .setExpirationTime("10m")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    console.log("✅ OTP sent successfully for:", emailInput);

    // 9️⃣ Return success response
    return response(true, 200, "OTP सफलतापूर्वक पठाइयो", { token });

  } catch (error) {
    console.error("⚠️ Login API error:", error);
    return catchError(error, "Login असफल भयो");
  }
}
