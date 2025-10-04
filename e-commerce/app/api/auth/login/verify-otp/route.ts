import connectDB from "@/lib/databaseConnection";
import { response, catchError } from "@/lib/helpherfunction";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/user.model";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, otp } = await request.json();
    if (!email || !otp) return response(false, 400, "Email and OTP required");

    const normalizedEmail = email.trim().toLowerCase();

    // ✅ Check OTP validity
    const otpData = await OTPModel.findOne({
      email: normalizedEmail,
      otp,
      expiresAt: { $gt: Date.now() },
    });

    if (!otpData) return response(false, 400, "OTP गलत छ वा expire भइसकेको छ");

    // OTP valid -> remove all OTPs for that email
    await OTPModel.deleteMany({ email: normalizedEmail });

    // ✅ Generate temporary token (valid 15 minutes)
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) return response(false, 500, "SECRET_KEY missing");

    const secret = new TextEncoder().encode(secretKey);
    const tempToken = await new SignJWT({ email: normalizedEmail })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m") // 15 minutes validity
      .sign(secret);

    // Optional: mark user email verified
    await UserModel.updateOne({ email: normalizedEmail }, { isEmailVerified: true });

    return response(true, 200, "OTP verified successfully", { tempToken });
  } catch (error) {
    console.error("🔥 OTP verification error:", error);
    return catchError(error, "OTP verification failed");
  }
}
