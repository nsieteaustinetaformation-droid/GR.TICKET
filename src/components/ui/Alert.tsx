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
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    alert: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
  };

  const borderStyles: Record<AlertVariant, string> = {
    success: "border-emerald-200 bg-emerald-50",
    alert: "border-amber-200 bg-amber-50",
    error: "border-rose-200 bg-rose-50",
    info: "border-sky-200 bg-sky-50",
  };

  const titleColors: Record<AlertVariant, string> = {
    success: "text-emerald-800",
    alert: "text-amber-800",
    error: "text-rose-800",
    info: "text-sky-800",
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
          <p className="mt-1 text-xs text-slate-700 leading-relaxed">
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
          className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white min-touch-target flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
