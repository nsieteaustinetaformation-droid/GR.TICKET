import React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  Clock,
  QrCode,
  Tag,
} from "lucide-react";

export type BadgeVariant =
  | "success"
  | "alert"
  | "error"
  | "info"
  | "gold"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md";
}

export function Badge({
  variant = "neutral",
  icon,
  children,
  size = "md",
  className,
  ...props
}: BadgeProps) {
  // Icônes par défaut obligatoires pour garantir l'accessibilité WCAG (jamais de couleur seule)
  const defaultIcons: Record<BadgeVariant, React.ReactNode> = {
    success: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
    alert: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
    error: <XCircle className="w-3.5 h-3.5 shrink-0" />,
    info: <Info className="w-3.5 h-3.5 shrink-0" />,
    gold: <Sparkles className="w-3.5 h-3.5 shrink-0" />,
    neutral: <Tag className="w-3.5 h-3.5 shrink-0" />,
  };

  const variantStyles: Record<BadgeVariant, string> = {
    success:
      "bg-[var(--state-success-bg)] text-[var(--state-success)] border border-[var(--state-success)]",
    alert:
      "bg-[var(--state-alert-bg)] text-[var(--state-alert)] border border-[var(--state-alert)]",
    error:
      "bg-[var(--state-error-bg)] text-[var(--state-error)] border border-[var(--state-error)]",
    info:
      "bg-[var(--state-info-bg)] text-[var(--state-info)] border border-[var(--state-info)]",
    gold:
      "bg-[var(--gold-subtle)] text-[var(--gold-primary)] border border-[var(--gold-primary)]",
    neutral:
      "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-app)]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1 font-medium",
    md: "px-2.5 py-1 text-xs gap-1.5 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full transition-colors font-mono tracking-wide",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon ?? defaultIcons[variant]}
      <span>{children}</span>
    </span>
  );
}
