import { NextResponse } from "next/server";
import { forgotPassword } from "@/lib/forgotPassword";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );

    const result = await forgotPassword(email);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
