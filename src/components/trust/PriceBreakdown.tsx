import type { JSX } from "react";
import { ShieldCheck } from "lucide-react";
import { formatMoney } from "@/lib/international/money";
import { normalizeLocale, translate } from "@/lib/international/messages";
import { cn } from "@/lib/utils";

interface Props {
  currency: string;
  locale?: string;
  subtotalMinor: number;
  taxMinor: number;
  taxLabel?: string;
  totalMinor: number;
  commissionMinor?: number;
  commissionLabel?: string;
  className?: string;
}

function Row({
  label,
  value,
  subtle = false,
}: {
  label: string;
  value: string;
  subtle?: boolean;
}): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cn("text-[var(--grtk-text-2)]", subtle ? "text-[11px]" : "text-sm")}>{label}</dt>
      <dd
        className={cn(
          "font-mono tabular-nums text-[var(--grtk-text)]",
          subtle ? "text-[11px]" : "text-sm font-semibold",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function PriceBreakdown({
  currency,
  locale = "fr",
  subtotalMinor,
  taxMinor,
  taxLabel,
  totalMinor,
  commissionMinor,
  commissionLabel,
  className,
}: Props): JSX.Element {
  const resolved = normalizeLocale(locale);
  const money = (amountMinor: number) => formatMoney(amountMinor, currency, resolved);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5",
        className,
      )}
    >
      <dl className="space-y-3">
        <Row label={translate(resolved, "trust.subtotal")} value={money(subtotalMinor)} />
        <Row label={taxLabel ?? translate(resolved, "trust.tax")} value={money(taxMinor)} />

        {typeof commissionMinor === "number" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
            <Row label={translate(resolved, "trust.commissionToOrganizer")} value={money(commissionMinor)} subtle />
            {commissionLabel && (
              <p className="mt-1 text-[10px] leading-snug text-emerald-700">{commissionLabel}</p>
            )}
          </div>
        )}
      </dl>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-[var(--grtk-border)] pt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">
          {translate(resolved, "trust.total")}
        </span>
        <span className="font-mono text-2xl font-black tabular-nums text-[var(--grtk-text)]">
          {money(totalMinor)}
        </span>
      </div>

      <p className="mt-3 flex items-start gap-2 text-[11px] leading-snug text-[var(--grtk-text-3)]">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
        {translate(resolved, "trust.noHiddenFees")}
      </p>
    </div>
  );
}
