"use client";

import { useId, type JSX } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { normalizeLocale, translate, type Locale } from "@/lib/international/messages";
import { cn } from "@/lib/utils";

interface Props {
  locale?: Locale | string;
  compact?: boolean;
  withTooltip?: boolean;
  className?: string;
}

export function GuaranteeBadge({
  locale = "fr",
  compact = false,
  withTooltip = true,
  className,
}: Props): JSX.Element {
  const resolved = normalizeLocale(locale);
  const descriptionId = useId();
  const short = translate(resolved, "guarantee.short");
  const label = compact
    ? translate(resolved, "guarantee.badge")
    : translate(resolved, "guarantee.promise");

  return (
    <span className={cn("group relative inline-flex", className)}>
      <span
        tabIndex={withTooltip ? 0 : undefined}
        title={short}
        aria-describedby={withTooltip ? descriptionId : undefined}
        className={cn(
          "animate-badge-shine inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700",
          compact && "px-2.5 py-0.5 text-[9px]",
        )}
        // Le fond animé ne doit briller qu'à l'affichage, jamais en boucle.
        style={{ animationIterationCount: 1 }}
      >
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </span>

      {withTooltip && (
        <span
          role="tooltip"
          id={descriptionId}
          className="absolute left-0 top-full z-30 mt-2 hidden w-64 rounded-xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-3 text-left shadow-[var(--shadow-3)] group-hover:block group-focus-within:block"
        >
          <span className="block text-xs font-semibold leading-snug text-[var(--grtk-text)]">{short}</span>
          <Link
            href="/garantie"
            className="link-underline mt-2 inline-block text-[11px] font-bold text-[var(--grtk-violet-700)]"
          >
            {translate(resolved, "trust.conditions")}
          </Link>
        </span>
      )}
    </span>
  );
}
