import connectDB from "@/lib/databaseConnection";
import UserModel from "@/models/user.model";
import OTPModel from "@/models/Otp.model";
import { response, catchError } from "@/lib/helpherfunction";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await request.json();
    const emailNormalized = email.trim().toLowerCase();

    // Check OTP
    const otpRecord = await OTPModel.findOne({ email: emailNormalized, otp });
    if (!otpRecord) return response(false, 400, "Invalid OTP");

    // Update password
    const user = await UserModel.findOne({ email: emailNormalized });
    if (!user) return response(false, 404, "User not found");

    user.password = newPassword;
    await user.save();

    // Delete used OTP
    await OTPModel.deleteMany({ email: emailNormalized });

    return response(true, 200, "Password reset सफल भयो। अब login गर्न सक्नुहुन्छ।");

  } catch (err) {
    return catchError(err, "Password reset असफल भयो");
  }
}
