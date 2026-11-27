"use client";

import type { ComponentType, JSX } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImagePlaceholderProps {
  icon?: ComponentType<{ className?: string }>;
  label?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Cadre neutre affiché quand aucune image n'est fournie.
 * Aucune photo stock ou générée : seulement un dégradé violet très clair.
 */
export function ImagePlaceholder({
  icon: Icon = ImageIcon,
  label = "Aucune image",
  className,
  compact = false,
}: ImagePlaceholderProps): JSX.Element {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--grtk-border)] text-center",
        compact ? "p-3" : "p-6",
        className
      )}
      style={{ background: "linear-gradient(135deg, var(--grtk-violet-50), var(--grtk-violet-100))" }}
    >
      <Icon
        className={cn(
          "shrink-0 text-[var(--grtk-violet-600)]",
          compact ? "h-5 w-5" : "h-8 w-8"
        )}
      />
      {label && (
        <span
          className={cn(
            "font-medium text-[var(--grtk-text-3)]",
            compact ? "text-[11px]" : "text-xs"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
