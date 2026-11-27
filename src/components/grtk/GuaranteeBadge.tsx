"use client";

import { ShieldCheck } from "lucide-react";
import { normalizeLocale, translate, type Locale } from "@/lib/international/messages";

export function GuaranteeBadge({ locale = "fr", compact = false }: { locale?: Locale | string; compact?: boolean }) {
  const resolved = normalizeLocale(locale);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
      <ShieldCheck className="h-3.5 w-3.5" />
      {compact ? translate(resolved, "guarantee.badge") : translate(resolved, "guarantee.promise")}
    </span>
  );
}
