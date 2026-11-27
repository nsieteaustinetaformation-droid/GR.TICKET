import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "elevated" | "interactive";
  isGoldBordered?: boolean;
}

export function Card({
  variant = "surface",
  isGoldBordered = false,
  className,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    surface: "bg-white border-slate-200",
    elevated: "bg-white border-slate-200 shadow-lg shadow-slate-200/60",
    interactive:
      "bg-white border-slate-200 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100 transition-all duration-200 cursor-pointer",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 sm:p-6 text-slate-900 transition-colors",
        variantStyles[variant],
        isGoldBordered && "border-violet-500 shadow-lg shadow-violet-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-bold tracking-tight text-slate-900", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-slate-500 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props}>{children}</div>;
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-slate-200 mt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
