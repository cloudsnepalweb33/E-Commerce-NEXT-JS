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
  if (error.code === 11000 && error.keyPattern) {
    const keys = Object.keys(error.keyPattern).join(", ");
    error.message = `Duplicate field(s): ${keys}. These field values must be unique.`;
  }

  let errorData: Record<string, unknown>;

  if (process.env.NODE_ENV === "development") {
    errorData = {
      message: error.message,
      error,
    };
  } else {
    errorData = {
      message: customMessage || "Internal server error.",
    };
  }

  const statusCode = typeof error.code === "number" ? error.code : 500;

  return response(false, statusCode, error.message, errorData);
};

export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);
  return otp;
};
