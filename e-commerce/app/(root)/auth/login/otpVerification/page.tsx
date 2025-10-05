"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OtpVerificationForm from "@/components/Application/otpVerification/otpVerification";
import { showToast } from "@/lib/showTost";
import { USER_DASHBOARD } from "@/routes/WebsiteRoute";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoutes";

export default function OtpVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [checkingStorage, setCheckingStorage] = useState(true);

  // Load email & token from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("otpEmail");
    const storedToken = localStorage.getItem("tempToken");

    if (!storedEmail || !storedToken) {
      router.push("/login");
      return;
    }

    setEmail(storedEmail);
    setTempToken(storedToken);
    setCheckingStorage(false);
  }, [router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Submit OTP
  const handleSubmit = async (values: { otp: string }) => {
    if (!email || !tempToken) return;

    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/auth/login/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ email, otp: values.otp }),
      });

      const data = await res.json();

      // 🔹 Console logs for debugging
      console.log("✅ OTP verify full response:", data);

      if (!res.ok || !data.success) {
        showToast("error", data.message || "OTP गलत छ वा expire भइसकेको छ");
        return;
      }

      // Save permanent auth token
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        console.log("Saved authToken in localStorage:", data.token);
      }

      // Extract role safely
      const role =
        data?.data?.role ||
        data?.data?.user?.role ||
        data?.role ||
        "user"; // fallback

      console.log("Final role used for redirect:", role);

      showToast("success", data.message || "OTP verified successfully!");

      // Redirect based on callback or role
      setTimeout(() => {
        if (searchParams.has("callback")) {
          console.log("Redirecting to callback:", searchParams.get("callback"));
          router.push(searchParams.get("callback")!);
        } else if (role.toLowerCase() === "admin") {
          console.log("Redirecting to admin dashboard:", ADMIN_DASHBOARD);
          router.push(ADMIN_DASHBOARD);
        } else {
          console.log("Redirecting to user dashboard:", USER_DASHBOARD);
          router.push(USER_DASHBOARD);
        }
      }, 150);

      // Cleanup
      localStorage.removeItem("otpEmail");
      localStorage.removeItem("tempToken");
      console.log("Cleaned otpEmail and tempToken from localStorage");

    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      showToast("error", "Network error. कृपया पुन: प्रयास गर्नुहोस्।");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email || resendTimer > 0) return;

    setResendLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/auth/login/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("Resend OTP response:", data);

      if (data.success) {
        showToast("success", data.message || "OTP पुन: पठाइयो!");
        setResendTimer(30);
      } else {
        showToast("error", data.message || "OTP पठाउन असफल भयो।");
      }
    } catch (err) {
      console.error("❌ Error resending OTP:", err);
      showToast("error", "Network error. पुन: प्रयास गर्नुहोस्।");
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

        <OtpVerificationForm
          email={email!}
          onSubmit={handleSubmit}
          loading={loading}
        />

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
