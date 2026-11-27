"use client";

import type { JSX } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/system/ThemeProvider";

/** Bascule mode clair / sombre, avec persistance via ThemeProvider. */
export function ThemeToggle({ compact = false }: { compact?: boolean }): JSX.Element {
  const { theme, toggle, mounted } = useTheme();
  const isDark = mounted && theme === "dark";
  const label = isDark ? "Mode clair" : "Mode sombre";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={`btn-glass-outline magnetic-btn inline-flex min-touch-target items-center justify-center gap-2 text-xs font-semibold ${
        compact ? "h-9 w-9 px-0" : "h-9 px-3"
      }`}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
      {!compact && <span>{label}</span>}
    </button>
  );
}
