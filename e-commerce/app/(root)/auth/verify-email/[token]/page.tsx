"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WEBSITE_HOME, WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import verifiedIMG from "@/public/assets/images/verified.gif";
import verificationFailedImg from "@/public/assets/images/verification-failed.gif";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Page = ({ params }: { params: { token: string } }) => {
  const { token } = params;
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await axios.post("/api/auth/verify-email", { token });
        setIsVerified(data.success);
      } catch (error) {
        setIsVerified(false);
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="max-w-md mx-auto mt-10 p-5 shadow-lg ">
      <CardContent>
        {isVerified === null ? (
          <p className="text-center text-gray-500">Verifying your email...</p>
        ) : isVerified ? (
          <div>
            <div className="flex justify-center items-center">
              <Image src={verifiedIMG} alt="Verified" height={100} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold my-5 text-green-500">
                Email verification success!
              </h1>
              <Button asChild>
                <Link href={WEBSITE_HOME}>Continue Shopping</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center items-center">
              <Image src={verificationFailedImg} alt="Verification Failed" height={100} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold my-5 text-red-500">
                Email verification failed!
              </h1>
              <Button asChild>
                <Link href={WEBSITE_LOGIN}>Back to Login</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Page;
