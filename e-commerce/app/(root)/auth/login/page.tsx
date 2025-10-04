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

interface LoginResponse {
  success: boolean;
  message: string;
  data?: { token: string };
}

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isTypingPassword, setIsPassword] = useState(true);

  // Form schema
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data: LoginResponse = await res
        .json()
        .catch(() => ({ message: "Server error" }));

      if (!res.ok) throw new Error(data.message || "Network error");

      showToast("success", data.message);
      localStorage.setItem("otpEmail", values.email);
      localStorage.setItem("tempToken", data.data!.token);
      form.reset();

      router.push(WEBSITE_OTP);
    } catch (err: any) {
      console.error(err);
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

        <div>
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
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
                        {...field}
                      />
                    </FormControl>
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
                        <Input
                          type={isTypingPassword ? "password" : "text"}
                          placeholder="********"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setIsPassword(!isTypingPassword)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        >
                          {isTypingPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <div className="flex justify-end mb-2">
                <Link
                  href={WEBSITE_RESET_PASSWORD}
                  className="text-sm text-primary underline"
                >
                  Forgot Password?
                </Link>
              </div> */}

              <div className="mt-4">
                <ButtonLoading
                  type="submit"
                  text="Login"
                  loading={loading}
                  className="w-full"
                />
              </div>

              <div className="text-center mt-3">
                <div className="flex justify-center gap-2">
                  <p>Don't have an account?</p>
                  <Link
                    href={WEBSITE_REGISTER}
                    className="text-primary underline"
                  >
                    Create account!
                  </Link>
                </div>
                <div className="flex justify-end mb-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default Login;
