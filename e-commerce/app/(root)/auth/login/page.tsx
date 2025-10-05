"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Logo from "@/public/assets/images/logo-black.png";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { zSchema } from "@/lib/zodSchema";
import { useForm } from "react-hook-form";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ButtonLoading from "@/components/Application/ButtonLoading";
import Link from "next/link";
import {
  WEBSITE_REGISTER,
  WEBSITE_OTP,
  WEBSITE_FORGOT_PASSWORD,
} from "@/routes/WebsiteRoute";
import { showToast } from "@/lib/showTost";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { login } from "@/store/reducer/authReducer";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: { token: string };
}

const Login: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

      const data: LoginResponse = await res
        .json()
        .catch(() => ({ success: false, message: "Server error" }));

      if (!data.success) {
        showToast("error", data.message || "Invalid credentials!");
        return;
      }

      if (!data.data?.token) {
        showToast("error", "No token returned from server");
        return;
      }

      // store temporary data for OTP verification
      localStorage.setItem("otpEmail", values.email);
      localStorage.setItem("tempToken", data.data.token);

      showToast("success", data.message || "OTP sent successfully!");
      form.reset();

      router.push(WEBSITE_OTP);
    } catch (err: any) {
      console.error("Login error:", err);
      showToast("error", err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[430px]">
      <CardContent>
        <div className="flex justify-center mb-5">
          <Image src={Logo} alt="Logo" width={150} height={50} />
        </div>

        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold">Login Into Account</h1>
          <p>Login into your account by filling out the form below.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLoginSubmit)}>
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="********"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                      >
                        {isPasswordVisible ? <FaRegEye /> : <FaRegEyeSlash />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="mt-6">
              <ButtonLoading type="submit" text="Login" loading={loading} className="w-full" />
            </div>

            {/* Bottom Links */}
            <div className="text-center mt-3">
              <div className="flex justify-center gap-2">
                <p>Don't have an account?</p>
                <Link href={WEBSITE_REGISTER} className="text-primary underline">
                  Create account!
                </Link>
              </div>
              <div className="flex justify-center mb-2 mt-4">
                <button
                  type="button"
                  className="text-sm text-primary underline"
                  onClick={() => router.push(WEBSITE_FORGOT_PASSWORD)}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Login;
