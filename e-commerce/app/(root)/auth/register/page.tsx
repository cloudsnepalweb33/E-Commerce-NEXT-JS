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
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showTost";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [isTypingPassword, setIsPassword] = useState(true);

  const formSchema = zSchema.pick({ email: true, password: true, name: true })
    .extend({ confirmPassword: z.string() })
    .refine(data => data.password === data.confirmPassword, {
      message: "Password and confirm password must be same.",
      path: ["confirmPassword"]
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", name: "", confirmPassword: "" }
  });

  const handleRegisterSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const { data: registerResponse } = await axios.post("/api/auth/register", values);
      if (registerResponse.success) {
        showToast("success", registerResponse.message || "Account created! Please verify your email.");
        form.reset();
      } else {
        showToast("error", registerResponse.message || "Registration failed");
      }
    } catch (error: any) {
      showToast("error", error?.response?.data?.message || error.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[430px]">
        <CardContent>
          <div className="flex justify-center">
            <Image src={Logo} alt="Logo" width={150} height={50} className="max-w-[150px]" />
          </div>
          <div className="text-center mb-5">
            <h1 className="text-2xl font-extrabold">Create Account!</h1>
            <p>Create new account by filling out the form below.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegisterSubmit)}>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input type="text" placeholder="John Broke" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="example@gmail.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={isTypingPassword ? "password" : "text"} placeholder="********" {...field} />
                      
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem className="mb-3">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={isTypingPassword ? "password" : "text"} placeholder="********" {...field} />
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
              )} />

              <div className="mt-4">
                <ButtonLoading type="submit" text="Create Account" loading={loading} className="w-full cursor-pointer" />
              </div>

              <div className="text-center mt-3">
                <div className="flex justify-center gap-2">
                  <p>Already have account?</p>
                  <Link href={WEBSITE_LOGIN} className="text-primary underline">Login</Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
