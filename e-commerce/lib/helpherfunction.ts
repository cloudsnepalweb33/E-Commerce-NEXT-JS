import { NextResponse } from "next/server";

// Standard API response
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

// Custom error type for MongoDB and general errors
interface CustomError extends Error {
  code?: number | string;
  keyPattern?: Record<string, unknown>;
}

// Error handling function
export const catchError = (error: CustomError, customMessage?: string) => {
  // Handle duplicate key errors (MongoDB code 11000)
  if (error.code === 11000 && error.keyPattern) {
    const keys = Object.keys(error.keyPattern).join(", ");
    error.message = `Duplicate field(s): ${keys}. These field values must be unique.`;
  }

  let errorData: Record<string, unknown>;

  if (process.env.NODE_ENV === "development") {
    // Show full error in development
    errorData = {
      message: error.message,
      error,
    };
  } else {
    // Hide sensitive error info in production
    errorData = {
      message: customMessage || "Internal server error.",
    };
  }

  // Ensure status code is number
  const statusCode = typeof error.code === "number" ? error.code : 500;

  return response(false, statusCode, error.message, errorData);
};
