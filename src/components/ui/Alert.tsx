import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type AlertVariant = "success" | "alert" | "error" | "info";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  action?: React.ReactNode;
}

export function Alert({
  variant = "info",
  title,
  description,
  icon,
  onClose,
  action,
  className,
  ...props
}: AlertProps) {
  const defaultIcons: Record<AlertVariant, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--state-success)] shrink-0 mt-0.5" />,
    alert: <AlertTriangle className="w-5 h-5 text-[var(--state-alert)] shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--state-error)] shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-[var(--state-info)] shrink-0 mt-0.5" />,
  };

  const borderStyles: Record<AlertVariant, string> = {
    success: "border-[var(--state-success)] bg-[var(--state-success-bg)]",
    alert: "border-[var(--state-alert)] bg-[var(--state-alert-bg)]",
    error: "border-[var(--state-error)] bg-[var(--state-error-bg)]",
    info: "border-[var(--state-info)] bg-[var(--state-info-bg)]",
  };

  const titleColors: Record<AlertVariant, string> = {
    success: "text-[var(--state-success)]",
    alert: "text-[var(--state-alert)]",
    error: "text-[var(--state-error)]",
    info: "text-[var(--state-info)]",
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-150",
        borderStyles[variant],
        className
      )}
      {...props}
    >
      {icon ?? defaultIcons[variant]}

      <div className="flex-1 text-sm">
        <h4 className={cn("font-bold text-sm tracking-wide flex items-center gap-2", titleColors[variant])}>
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-xs text-[var(--text-primary)] leading-relaxed opacity-90">
            {description}
          </p>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'alerte"
          className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] min-touch-target flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
