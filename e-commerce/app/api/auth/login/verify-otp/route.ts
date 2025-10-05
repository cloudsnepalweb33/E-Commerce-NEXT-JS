import connectDB from "@/lib/databaseConnection";
import { response, catchError } from "@/lib/helpherfunction";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/user.model";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, otp } = await request.json();
    if (!email || !otp) return response(false, 400, "Email र OTP आवश्यक छ");

    const normalizedEmail = email.trim().toLowerCase();

    // 🔎 OTP check
    const otpData = await OTPModel.findOne({
      email: normalizedEmail,
      otp,
      expiresAt: { $gt: Date.now() },
    });

    if (!otpData)
      return response(false, 400, "OTP गलत छ वा expire भइसकेको छ");

    // ✅ Remove all OTP entries
    await OTPModel.deleteMany({ email: normalizedEmail });

    // 🔍 Find user & verify
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) return response(false, 404, "User फेला परेन");

    // ✅ Mark email verified
    user.isEmailVerified = true;
    await user.save();

    // 🔑 Generate permanent JWT (7 days validity)
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) return response(false, 500, "SECRET_KEY missing");

    const secret = new TextEncoder().encode(secretKey);
    const authToken = await new SignJWT({
      id: user._id,
      email: user.email,
      role: user.role, // ✅ include role
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // ✅ Final response
    return response(true, 200, "OTP verified successfully", {
      token: authToken, // permanent auth token
      role: user.role, // ✅ include role
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("🔥 OTP verification error:", error);
    return catchError(error, "OTP verification failed");
  }
}
