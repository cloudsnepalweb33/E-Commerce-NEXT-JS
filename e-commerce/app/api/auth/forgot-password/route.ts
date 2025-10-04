import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import UserModel from "@/models/user.model";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    // user खोज्ने
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User फेला परेन" }, { status: 404 });
    }

    // 🔑 raw token बनाउने
    const rawToken = crypto.randomBytes(32).toString("hex");

    // token लाई sha256 मा hash गर्ने
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // user मा save गर्ने
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 घण्टासम्म valid
    await user.save();

    // client लाई पठाउने link
    const resetUrl = `${process.env.FRONTEND_URL}/auth/forgot-password/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    // Mail पठाउने config
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Password Reset",
      html: `<p>तपाईंको पासवर्ड reset गर्न <a href="${resetUrl}">यो link</a> क्लिक गर्नुहोस् । यो link १ घण्टासम्म मात्र valid हुन्छ ।</p>`,
    });

    return NextResponse.json({ success: true, message: "Reset email पठाइयो" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || "केही समस्या भयो" }, { status: 500 });
  }
}
