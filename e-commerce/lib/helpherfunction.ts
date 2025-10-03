import { NextResponse } from "next/server";

export const response = (
  success: boolean,
  statusCode: number,
  message: string,
  data: Record<string, unknown> = {}
) => {
  return NextResponse.json({
    success,
    statusCode,
    message,
    data,
  });
};

interface CustomError extends Error {
  code?: number | string;
  keyPattern?: Record<string, unknown>;
}

export const catchError = (error: CustomError, customMessage?: string) => {
  console.error("❌ Error caught:", error);

  let message = error.message;

  if (error.code === 11000 && error.keyPattern) {
    const keys = Object.keys(error.keyPattern).join(", ");
    message = `Duplicate field(s): ${keys}. These field values must be unique.`;
  }

  const statusCode = typeof error.code === "number" ? error.code : 500;

  const errorData: Record<string, unknown> =
    process.env.NODE_ENV === "development"
      ? { message, stack: error.stack }
      : { message: customMessage || "Internal server error." };

  return response(false, statusCode, message, errorData);
};

// OTP generator
export const generateOTP = (length = 6): string => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  const otp = Math.floor(Math.random() * (max - min + 1) + min).toString();
  console.log("🔑 Generated OTP:", otp);
  return otp;
};
