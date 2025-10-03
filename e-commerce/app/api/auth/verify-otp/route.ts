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

    const otpData = await OTPModel.findOne({ email, otp });
    if (!otpData) return response(false, 400, "Invalid or expired OTP");

    await OTPModel.deleteMany({ email });

    await UserModel.updateOne({ email }, { $set: { lastLogin: new Date() } });

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) return response(false, 500, "SECRET_KEY missing");

    const secret = new TextEncoder().encode(secretKey);
    const token = await new SignJWT({ email })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    return response(true, 200, "OTP verified successfully", { token });
  } catch (error) {
    return catchError(error, "OTP verification failed");
  }
}
