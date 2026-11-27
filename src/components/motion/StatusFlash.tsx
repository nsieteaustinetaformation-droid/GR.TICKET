"use client";

import { useEffect, useRef } from "react";
import type { JSX } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface StatusFlashProps {
  kind: "success" | "error";
  message: string;
  onDone?: () => void;
}

/** Feedback court : coche animée ou secousse, puis onDone (une seule fois). */
export function StatusFlash({ kind, message, onDone }: StatusFlashProps): JSX.Element {
  const reduced = useReducedMotion();
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const timer = window.setTimeout(() => doneRef.current?.(), reduced ? 600 : 1200);
    return () => window.clearTimeout(timer);
  }, [kind, message, reduced]);

  const success = kind === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] px-3 py-1.5 text-xs font-semibold"
    >
      <motion.span
        className={cn(
          "inline-flex",
          success
            ? "animate-pop text-[var(--grtk-success)]"
            : "animate-shake text-[var(--grtk-error)]"
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </motion.span>
      <span>{message}</span>
    </motion.div>
  );
}
