import connectDB from "@/lib/databaseConnection";
import UserModel from "@/models/user.model";
import OTPModel from "@/models/Otp.model";
import { generateOTP, response, catchError } from "@/lib/helpherfunction";
import { sendMail } from "@/lib/sendMail";
import { otpEmail } from "@/email/otpEmail";

export async function POST(request: Request) {
  try {
    await connectDB();

    let body: { email?: string };
    try {
      body = await request.json();
    } catch (err) {
      return response(false, 400, "Invalid request body");
    }

    const email = body.email?.trim().toLowerCase();
    if (!email) return response(false, 400, "Email required");

    const user = await UserModel.findOne({ email });
    if (!user) return response(false, 404, "यो ईमेल address हाम्रो system मा छैन");

    await OTPModel.deleteMany({ email });

    const otp = generateOTP();
    const newOtp = new OTPModel({ email, otp });
    await newOtp.save();

    const mailStatus = await sendMail("Reset Password OTP", email, otpEmail(otp));
    if (!mailStatus.success) return response(false, 500, "OTP पठाउन असफल भयो");

    return response(true, 200, "OTP सफलतापूर्वक पठाइयो। कृपया email check गर्नुहोस्।");
  } catch (err) {
    console.error("Reset Password API error:", err);
    return catchError(err, "Reset Password request असफल भयो");
  }
}
