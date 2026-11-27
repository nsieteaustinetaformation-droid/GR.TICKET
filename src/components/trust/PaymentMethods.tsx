import type { JSX } from "react";
import { CreditCard, LockKeyhole, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { paymentMethodLabel, translate } from "@/lib/international/messages";
import { cn } from "@/lib/utils";

interface Props {
  countryCode?: string;
  methods?: string[];
  compact?: boolean;
  className?: string;
}

/** Icônes génériques : aucun logo de marque n'est reproduit. */
function methodIcon(code: string): LucideIcon {
  switch (code) {
    case "card":
      return CreditCard;
    case "mtn":
    case "airtel":
    case "orange":
    case "mpesa":
      return Smartphone;
    case "wallet":
      return Wallet;
    default:
      return CreditCard;
  }
}

function methodLabel(code: string, locale: "fr" | "en", compact: boolean): string {
  const label = paymentMethodLabel(locale, code);
  if (!compact) return label;
  if (code === "card") return locale === "fr" ? "CB" : "Card";
  return label.split(" ")[0];
}

export function PaymentMethods({
  countryCode,
  methods,
  compact = false,
  className,
}: Props): JSX.Element {
  const config = getCountryConfig(countryCode);
  const configured = methods && methods.length > 0 ? methods : config.paymentMethods;
  const codes = [...new Set(["card", ...configured.map((method) => method.trim().toLowerCase()).filter(Boolean)])];
  const locale = countryCode ? config.locale : "fr";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {codes.map((code) => {
        const Icon = methodIcon(code);
        const fullLabel = paymentMethodLabel(locale, code);
        return (
          <span
            key={code}
            title={fullLabel}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] font-semibold text-[var(--grtk-text-2)]",
              compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-[11px]",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--grtk-violet-600)]" aria-hidden="true" />
            {methodLabel(code, locale, compact)}
          </span>
        );
      })}

      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--grtk-text-3)]">
        <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
        {translate(locale, "trust.securePayment")}
      </span>
    </div>
  );
}
