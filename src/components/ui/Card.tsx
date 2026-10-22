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
    surface: "bg-[var(--bg-surface)] border-[var(--border-app)]",
    elevated: "bg-[var(--bg-surface-elevated)] border-[var(--border-app)] shadow-lg",
    interactive:
      "bg-[var(--bg-surface)] border-[var(--border-app)] hover:border-[var(--gold-primary)] hover:shadow-[var(--shadow-gold)] transition-all duration-200 cursor-pointer",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 sm:p-6 text-[var(--text-primary)] transition-colors",
        variantStyles[variant],
        isGoldBordered && "border-[var(--gold-primary)] shadow-[var(--shadow-gold)]",
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
      className={cn(
        "text-lg font-bold tracking-tight text-[var(--text-primary)]",
        className
      )}
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
      className={cn("text-xs text-[var(--text-secondary)] leading-relaxed", className)}
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
      className={cn("flex items-center pt-4 border-t border-[var(--border-app)] mt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
