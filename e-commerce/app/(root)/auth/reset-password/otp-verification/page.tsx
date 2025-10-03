"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { showToast } from "@/lib/showTost";
import { useRouter } from "next/navigation";
import { WEBSITE_CONFIRM_PASSWORD } from "@/routes/WebsiteRoute";

// OTP Schema
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function OtpVerificationPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 👉 यहाँ तपाईँको user email राख्नुहोस्
  // Dynamic बनाउने हो भने localStorage, session वा URL query बाट लिन सकिन्छ
  const email = "khemsangrai115@gmail.com";

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const handleSubmit = async (values: z.infer<typeof otpSchema>) => {
    console.log("Submitting OTP:", values);
    setLoading(true);
    try {
      const res = await fetch(
        "/api/auth/reset-password/reset-password-verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp: values.otp,
            email: email, // ✅ FIX: Email पनि पठाइयो
          }),
        }
      );

      const text = await res.text();
      console.log("Raw response text:", text);

      const data = JSON.parse(text);
      console.log("Server response:", data);

      if (!res.ok) throw new Error(data.message || "Network error");

      showToast("success", data.message);
      console.log("OTP verified! Redirecting...");
      router.push(WEBSITE_CONFIRM_PASSWORD);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      showToast("error", err.message || "Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-extrabold mb-5 text-center">
        OTP Verification
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormItem className="mb-3">
            <FormLabel>OTP</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter 6-digit OTP"
                {...form.register("otp")}
              />
            </FormControl>
            <FormMessage>
              {form.formState.errors.otp?.message}
            </FormMessage>
          </FormItem>

          <ButtonLoading
            type="submit"
            text="Verify OTP"
            loading={loading}
            className="w-full"
          />
        </form>
      </Form>
    </div>
  );
}
