import { NextResponse } from "next/server";
import connectDB from "@/lib/databaseConnection";
import UserModel from "@/models/user.model";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, email, newPassword } = await req.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json({ success: false, message: "सबै field चाहिन्छ" }, { status: 400 });
    }

    // token लाई hash गरेर compare गर्ने
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // user खोज्ने (select false भएका field पनि ल्याउने)
    const user = await UserModel.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire +password");

    if (!user) {
      return NextResponse.json({ success: false, message: "Token invalid वा expire भइसकेको छ" }, { status: 400 });
    }

    // पासवर्ड hash गर्ने
    user.password = await bcrypt.hash(newPassword, 10);

    // reset token हटाउने
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset सफल भयो" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || "केही समस्या भयो" }, { status: 500 });
  }
}
