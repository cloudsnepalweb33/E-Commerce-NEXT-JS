// src/app/api/auth/register/route.ts
import connectDB from "@/lib/databaseConnection";
import { zSchema } from "@/lib/zodSchema";
import { SignJWT } from "jose";
import { catchError, response } from "@/lib/helpherfunction";
import bcrypt from "bcrypt";
import UserModel from "@/models/user.model";
import { sendMail } from "@/lib/sendMail";
import { emailVerificationLink } from "@/email/emailVerification";

export async function POST(request: Request) {
  try {
    // 1. Connect to database
    await connectDB();

    // 2. Validate incoming data
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

    // 3. Check if user already exists
    const checkUser = await UserModel.exists({ email });
    if (checkUser) {
      return response(false, 409, "User already registered");
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create new user
    const NewRegistration = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await NewRegistration.save();

    // 6. Check SECRET_KEY
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey || secretKey.length === 0) {
      return response(false, 500, "Server misconfiguration: SECRET_KEY is missing");
    }

    const secret = new TextEncoder().encode(secretKey);

    // 7. Generate JWT for email verification
    const token = await new SignJWT({ userId: NewRegistration._id })
      .setIssuedAt()
      .setExpirationTime("1d")
      .setProtectedHeader({ alg: "HS256" })
      .sign(secret);

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email/${token}`;

    // 8. Send verification email
    await sendMail(
      "Email verification request from Developer Khemsang",
      email,
      emailVerificationLink(verificationUrl)
    );

    // 9. Return success response
    return response(true, 200, "Registration success, please verify your email address");
  } catch (error) {
    return catchError(error, "Registration failed");
  }
}
