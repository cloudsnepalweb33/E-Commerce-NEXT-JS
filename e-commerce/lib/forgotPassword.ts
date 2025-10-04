import crypto from "crypto";
import bcrypt from "bcrypt";
import UserModel from "@/models/user.model";
import connectDB from "./databaseConnection";
import nodemailer from "nodemailer";
import { WEBSITE_RESET_PASSWORD } from "@/routes/WebsiteRoute";

export async function forgotPassword(email: string) {
  try {
    await connectDB();
   console.log("DB connected");
    const user = await UserModel.findOne({ email });
    console.log("User found:", user)
    if (!user) return { success: false, message: "User not found" };

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(rawToken, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
const resetUrl = `${process.env.FRONTEND_URL}${WEBSITE_RESET_PASSWORD}?token=${rawToken}&email=${encodeURIComponent(email)}`;
console.log("Reset URL:", resetUrl);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link valid for 1 hour.</p>`,
    });

    return { success: true, message: "Password reset email sent" };
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }
}
