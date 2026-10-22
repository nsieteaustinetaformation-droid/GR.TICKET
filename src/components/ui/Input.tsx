import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between"
          >
            <span>
              {label} {required && <span className="text-[var(--gold-primary)]">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[var(--text-secondary)] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={cn(
              "w-full h-11 px-3.5 text-sm rounded-lg bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-app)] placeholder:text-[var(--text-muted)] transition-all duration-150 min-touch-target",
              "focus-visible:border-[var(--border-focus)] focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-1",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              error && "border-[var(--state-error)] focus-visible:border-[var(--state-error)] focus-visible:outline-[var(--state-error)]",
              className
            )}
            {...props}
          />

          {rightIcon && !error && (
            <div className="absolute right-3.5 text-[var(--text-secondary)] pointer-events-none flex items-center justify-center">
              {rightIcon}
            </div>
          )}

          {error && (
            <div className="absolute right-3.5 text-[var(--state-error)] pointer-events-none flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-[var(--state-error)] flex items-center gap-1 font-medium mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-[var(--text-secondary)] mt-0.5">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
