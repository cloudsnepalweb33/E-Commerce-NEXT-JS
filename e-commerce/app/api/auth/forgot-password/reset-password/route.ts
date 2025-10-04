import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import UserModel from "@/models/user.model";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { token, email, newPassword } = await req.json();

    // Step 1: Check required fields
    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 2: Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Step 3: Check if reset token exists
    if (!user.resetPasswordToken || !user.resetPasswordExpire) {
      return NextResponse.json(
        { success: false, message: "Reset token not set" },
        { status: 400 }
      );
    }

    // Step 4: Check token validity and expiry
    const expireTime = new Date(user.resetPasswordExpire).getTime();
    const isValid = await bcrypt.compare(token, user.resetPasswordToken);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid reset token" },
        { status: 400 }
      );
    }

    if (Date.now() > expireTime) {
      return NextResponse.json(
        { success: false, message: "Reset token expired" },
        { status: 400 }
      );
    }

    // Step 5: Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
