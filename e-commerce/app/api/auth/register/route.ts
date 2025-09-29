import connectDB from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import { catchError, generateOTP, response } from "@/lib/helpherfunction";
import bcrypt from "bcrypt";
import UserModel from "@/models/user.model";
import OTPModel from "@/models/Otp.model";
import { sendMail } from "@/lib/sendMail";
import { otpEmail } from "@/email/otpEmail";

export async function POST(request: Request) {
  try {
    await connectDB();

    // Validate input
    const validationSchema = zSchema.pick({
      name: true,
      email: true,
      password: true,
    });
    const payload = await request.json();
    const validateData = validationSchema.safeParse(payload);

    if (!validateData.success) {
      const errors = validateData.error.errors.map(err => err.message);
      return response(false, 400, "Invalid or missing input field", { errors });
    }

    const { name, email, password } = validateData.data;

    // Check if user exists
    const checkUser = await UserModel.exists({ email });
    if (checkUser) {
      return response(false, 409, "User already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // Remove old OTPs (if any)
    await OTPModel.deleteMany({ email });

    // Generate & save new OTP
    const otp = generateOTP();
    const newOtpData = new OTPModel({ email, otp });
    await newOtpData.save();

    // Send OTP email
    const mailStatus = await sendMail(
      "Your registration verification code", // subject
      email,                                 // recipient
      otpEmail(otp)                           // html body
    );

    if (!mailStatus.success) {
      return response(false, 500, "Failed to send OTP email");
    }

    return response(
      true,
      200,
      "Registration successful, OTP sent to your email",
      { userId: newUser._id.toString() }
    );
  } catch (error) {
    return catchError(error, "Registration failed");
  }
}
