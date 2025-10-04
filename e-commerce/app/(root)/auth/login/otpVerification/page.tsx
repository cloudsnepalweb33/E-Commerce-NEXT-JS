"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OtpVerificationForm from "@/components/Application/otpVerification/otpVerification";
import { showToast } from "@/lib/showTost";

export default function OtpVerificationPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [checkingStorage, setCheckingStorage] = useState(true); // prevent flicker

  // Load email and tempToken from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("otpEmail");
    const storedToken = localStorage.getItem("tempToken");

    if (!storedEmail || !storedToken) {
      router.push("/login"); // redirect if missing
      return;
    }

    setEmail(storedEmail);
    setTempToken(storedToken);
    setCheckingStorage(false); // done checking
  }, [router]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (values: { otp: string }) => {
    if (!email || !tempToken) return; 

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ email, otp: values.otp }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();

      if (data.success) {
        if (data.token) localStorage.setItem("authToken", data.token);
        showToast("success", data.message || "OTP verified successfully!");
        router.push("/dashboard");
      } else {
        showToast("error", data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      showToast("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email || resendTimer > 0) return;

    setResendLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to resend OTP");

      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "OTP resent successfully!");
        setResendTimer(30);
      } else {
        showToast("error", data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      showToast("error", "Network error. Try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  if (checkingStorage) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">OTP Verification</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter the OTP sent to <span className="font-medium">{email}</span>
        </p>

        <OtpVerificationForm email={email!} onSubmit={handleSubmit} loading={loading} />

        <div className="mt-4 text-center">
          <button
            className={`text-sm font-medium text-blue-600 hover:underline disabled:text-gray-400`}
            onClick={handleResend}
            disabled={resendTimer > 0 || resendLoading}
          >
            {resendLoading
              ? "Resending..."
              : resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
