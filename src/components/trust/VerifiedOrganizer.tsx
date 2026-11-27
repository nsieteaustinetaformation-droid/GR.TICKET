import type { JSX } from "react";
import { BadgeCheck } from "lucide-react";
import { normalizeLocale, translate } from "@/lib/international/messages";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  verified?: boolean;
  logoUrl?: string | null;
  locale?: string;
  className?: string;
}

function initials(name: string): string {
  const value = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return value || "?";
}

export function VerifiedOrganizer({
  name,
  verified = false,
  logoUrl,
  locale = "fr",
  className,
}: Props): JSX.Element {
  const resolved = normalizeLocale(locale);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] text-xs font-bold text-[var(--grtk-text-3)]"
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-full w-full object-contain" />
        ) : (
          initials(name)
        )}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[var(--grtk-text)]">{name}</span>
        {verified === true && (
          <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <BadgeCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
            {translate(resolved, "trust.verifiedOrganizer")}
          </span>
        )}
      </span>
    </div>
  );
}
