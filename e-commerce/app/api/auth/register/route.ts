import connectDB from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import { catchError, generateOTP, response } from "@/lib/helpherfunction";
import UserModel from "@/models/user.model";
import OTPModel from "@/models/Otp.model";
import { sendMail } from "@/lib/sendMail";
import { otpEmail } from "@/email/otpEmail";

export async function POST(request: Request) {
  try {
    await connectDB();

    const payload = await request.json();
    console.log("📩 Register payload:", payload);

    const validateData = zSchema.pick({ name: true, email: true, password: true }).safeParse(payload);
    if (!validateData.success) {
      console.log("❌ Validation error:", validateData.error.errors);
      const errors = validateData.error.errors.map(err => err.message);
      return response(false, 400, "Invalid input", { errors });
    }

    let { name, email, password } = validateData.data;
    email = email.toLowerCase().trim();

    const existingUser = await UserModel.exists({ email });
    if (existingUser) {
      console.log("⚠️ User already exists:", email);
      return response(false, 409, "User already registered");
    }

    const newUser = new UserModel({ name, email, password });
    await newUser.save();
    console.log("✅ User registered:", email);

    await OTPModel.deleteMany({ email });

    const otp = generateOTP();
    const newOtpData = new OTPModel({ email, otp });
    await newOtpData.save();

    const mailStatus = await sendMail("Your registration OTP", email, otpEmail(otp));
    if (!mailStatus.success) return response(false, 500, "Failed to send OTP");

    return response(true, 200, "Registration successful, OTP sent", { userId: newUser._id.toString() });
  } catch (error) {
    return catchError(error, "Registration failed");
  }
}
