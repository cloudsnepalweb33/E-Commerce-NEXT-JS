"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { showToast } from "@/lib/showTost";

const confirmPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
    email: z.string().email(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export default function ConfirmPassword() {
  const router = useRouter();
  const form = useForm<z.infer<typeof confirmPasswordSchema>>({
    resolver: zodResolver(confirmPasswordSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const { setValue, handleSubmit, register, formState } = form;

  // URL बाट email set गर्ने
  useEffect(() => {
    const email = new URLSearchParams(window.location.search).get("email");
    if (!email) {
      showToast("error", "Email missing. OTP verify गरेर आएका URL बाट page खोल्नुहोस्।");
      router.push("/auth/reset-password");
    } else {
      setValue("email", email);
    }
  }, [router, setValue]);

  const onSubmit = async (values: z.infer<typeof confirmPasswordSchema>) => {
    console.log("🟢 Form values before submit:", values);
    if (!values.email) return;

    try {
      const payload = {
        email: values.email,
        password: values.password,
      };

      console.log("📤 Sending payload:", payload);

      const res = await fetch("/api/auth/reset-password/set-new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Server response:", data);

      if (!res.ok) throw new Error(data.message || "Network error");

      showToast("success", data.message);
      router.push("/login");
    } catch (err: any) {
      console.error("Set new password error:", err);
      showToast("error", err.message || "Network error. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-5">Set New Password</h1>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem className="mb-3">
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="New Password" {...register("password")} />
            </FormControl>
            <FormMessage>{formState.errors.password?.message}</FormMessage>
          </FormItem>

          <FormItem className="mb-3">
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Confirm Password" {...register("confirmPassword")} />
            </FormControl>
            <FormMessage>{formState.errors.confirmPassword?.message}</FormMessage>
          </FormItem>

          {/* Hidden email input */}
          <input type="hidden" {...register("email")} />

          <ButtonLoading
            type="submit"
            text="Reset Password"
            loading={formState.isSubmitting}
            className="w-full"
          />
        </form>
      </FormProvider>
    </div>
  );
}
