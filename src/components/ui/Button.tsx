import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-500 focus-visible:outline-offset-2";

    const sizeStyles = {
      sm: "h-9 px-3 text-xs min-w-[36px]",
      md: "h-11 px-5 text-sm min-touch-target",
      lg: "h-13 px-6 text-base font-semibold min-touch-target",
      icon: "h-11 w-11 p-0 min-touch-target",
    };

    const variantStyles = {
      primary: "bg-violet-600 text-white shadow-sm hover:bg-violet-700 active:translate-y-[1px]",
      secondary:
        "bg-white text-slate-800 border border-slate-200 hover:border-violet-300 hover:bg-violet-50 active:translate-y-[1px]",
      outline:
        "bg-transparent text-violet-700 border border-violet-600 hover:bg-violet-50 active:translate-y-[1px]",
      danger:
        "bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-600 hover:text-white active:translate-y-[1px]",
      ghost:
        "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:translate-y-[1px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
