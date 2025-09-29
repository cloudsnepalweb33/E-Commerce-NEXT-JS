"use client";

import React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonLoadingProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  loading?: boolean;
  loadingText?: string;
}

const ButtonLoading = React.forwardRef<HTMLButtonElement, ButtonLoadingProps>(
  (
    {
      type = "button",
      className,
      text,
      loading = false,
      loadingText,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        type={type}
        disabled={loading}
        aria-busy={loading}
        {...props}
        className={cn("flex items-center gap-2", className)}
      >
        {loading && <Loader2Icon className="animate-spin w-4 h-4" />}
        {loading ? loadingText ?? "Please wait..." : text}
      </Button>
    );
  }
);

ButtonLoading.displayName = "ButtonLoading";

export default ButtonLoading;
