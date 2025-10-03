"use client";

import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { showToast } from "@/lib/showTost";
import z from "zod/v3";
import { useRouter } from "next/navigation"; // Router import
import { WEBSITE_RESET_OTP_VERIFICATION } from "@/routes/WebsiteRoute";

const resetPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Router instance

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    console.log("Form Submitted:", values); // clg
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/reset-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      console.log("Fetch response status:", res.status); // clg

      const data = await res.json();
      console.log("Response data:", data); // clg

      if (!res.ok) throw new Error(data.message || "Network error");

      showToast("success", data.message);
      form.reset();

      console.log("Redirecting to OTP verification page with email:", values.email); // clg
      router.push(WEBSITE_RESET_OTP_VERIFICATION);
    } catch (err: any) {
      console.error("Error caught:", err);
      showToast("error", err.message || "Network error. Try again.");
    } finally {
      setLoading(false);
      console.log("Loading finished"); // clg
    }
  };

  return (
    <Card className="w-[430px] mx-auto mt-10">
      <CardContent>
        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold">Reset Password</h1>
          <p>Enter your registered email to receive OTP for password reset.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormItem className="mb-3">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@gmail.com" {...form.register("email")} />
              </FormControl>
              <FormMessage>{form.formState.errors.email?.message}</FormMessage>
            </FormItem>

            <ButtonLoading type="submit" text="Verify Email" loading={loading} className="w-full" />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
