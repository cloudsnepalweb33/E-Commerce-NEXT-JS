import connectDB from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import { SignJWT } from "jose";
import { catchError, generateOTP, response } from "@/lib/helpherfunction";
import bcrypt from "bcrypt";
import UserModel from "@/models/user.model";
import OTPModel from "@/models/Otp.model";
import { sendMail } from "@/lib/sendMail";
import { otpEmail } from "@/email/otpEmail";

export async function POST(request: Request) {
  try {
    await connectDB();

    const validationSchema = zSchema.pick({ email: true, password: true });
    const payload = await request.json();
    const validateData = validationSchema.safeParse(payload);

    if (!validateData.success) {
      const errors = validateData.error.errors.map(err => err.message);
      return response(false, 400, "Invalid input", { errors });
    }

    const { email, password } = validateData.data;

    const user = await UserModel.findOne({ deletedAt: null, email }).select("+password");
    if (!user) return response(false, 401, "Invalid email or password");
    if (!user.isVerified) return response(false, 403, "Please verify your email before login");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return response(false, 401, "Invalid email or password");

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) return response(false, 500, "Server misconfiguration: SECRET_KEY is missing");

    const secret = new TextEncoder().encode(secretKey);

    const token = await new SignJWT({
      userId: user._id.toString(),
      isAdmin: user.isAdmin || false,
    })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    await OTPModel.deleteMany({ email });

    const otp = generateOTP();
    const newOtpData = new OTPModel({ email, otp });
    await newOtpData.save();

    const otpEmailStatus = await sendMail(
      "Your login verification code",
      email,
      otpEmail(otp)
    );

    if (!otpEmailStatus.success) return response(false, 400, "Failed to send OTP");

    return response(true, 200, "OTP sent successfully", { token });
  } catch (error) {
    return catchError(error, "Login failed");
  }
}
