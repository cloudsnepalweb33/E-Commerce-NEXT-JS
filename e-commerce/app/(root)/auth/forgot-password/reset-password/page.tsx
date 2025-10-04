"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/showTost";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";

const ResetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const form = useForm<ResetPasswordType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordType) => {
    if (!token || !email) return showToast("Invalid reset link", "error");

    try {
      const res = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword: values.newPassword }),
      });

      const data = await res.json();
      showToast(data.message, data.success ? "success" : "error");

      if (data.success) router.push(WEBSITE_LOGIN);
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-md mx-auto mt-10 space-y-4 p-6 bg-white rounded-md shadow-md"
      >
        <FormItem>
          <FormLabel>New Password</FormLabel>
          <FormControl>
            <Input type="password" {...form.register("newPassword")} />
          </FormControl>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>Confirm Password</FormLabel>
          <FormControl>
            <Input type="password" {...form.register("confirmPassword")} />
          </FormControl>
          <FormMessage />
        </FormItem>

        <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
          Reset Password
        </Button>
      </form>
    </Form>
  );
}
