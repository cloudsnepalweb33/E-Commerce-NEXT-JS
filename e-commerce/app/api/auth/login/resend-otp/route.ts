import connectDB from "@/lib/databaseConnection";
import { generateOTP, response } from "@/lib/helpherfunction";
import { sendMail } from "@/lib/sendMail";
import OTPModel from "@/models/Otp.model";
import UserModel from "@/models/user.model";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email } = await request.json();
    if (!email) return response(false, "Email is required");

    const user = await UserModel.findOne({ email });
    if (!user) return response(false, "User not found");

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    // Save OTP in DB
    await OTPModel.findOneAndUpdate(
      { email },
      { otp: otpCode, expiresAt: otpExpire },
      { upsert: true, new: true }
    );

    // ✅ Fixed: sendMail params correct order
    const mailResult = await sendMail(
      "Your OTP Code",       // subject
      email,                 // recipient
      `Your OTP is ${otpCode}` // body
    );

    if (!mailResult.success) return response(false, mailResult.message || "Failed to send OTP");

    console.log("OTP sent successfully:", otpCode, "to", email);

    return response(true, "OTP resent successfully");
  } catch (err) {
    console.error(err);
    return response(false, "Failed to resend OTP");
  }
}
