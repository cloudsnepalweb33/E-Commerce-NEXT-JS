"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Logo from "@/public/assets/images/logo-black.png";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { zSchema } from "@/lib/zodSchema";
import { useForm } from "react-hook-form";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import ButtonLoading from "@/components/Application/ButtonLoading";
import Link from "next/link";
import { WEBSITE_REGISTER } from "@/routes/WebsiteRoute";
import { showToast } from "@/lib/showTost";

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isTypingPassword, setIsPassword] = useState(true);

  const formSchema = zSchema.pick({ email: true }).extend({
    password: z.string().min(3, "Password field is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLoginSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data: LoginResponse = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        showToast("success", data.message || "Login successful!");
        window.location.href = "/dashboard";
      } else {
        showToast("error", data.message || "Login failed");
      }
    } catch (err) {
      showToast("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[430px]">
      <CardContent>
        <div className="flex justify-center">
          <Image src={Logo} alt="Logo" width={150} height={50} className="max-w-[150px]" />
        </div>
        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold">Login Into Account</h1>
          <p>Login into your account by filling out the form below.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLoginSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="example@gmail.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={isTypingPassword ? "password" : "text"} placeholder="********" {...field} />
                      <button type="button" onClick={() => setIsPassword(!isTypingPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                        {isTypingPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-4">
              <ButtonLoading type="submit" text="Login" loading={loading} className="w-full cursor-pointer" />
            </div>
            <div className="text-center mt-3">
              <div className="flex justify-center gap-2">
                <p>Don't have account?</p>
                <Link href={WEBSITE_REGISTER} className="text-primary underline">Create account!</Link>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Login;
