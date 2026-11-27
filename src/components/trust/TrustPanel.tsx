import type { JSX, ReactNode } from "react";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { getCountryConfig } from "@/lib/international/config";
import { normalizeLocale, translate } from "@/lib/international/messages";
import { cn } from "@/lib/utils";
import { PaymentMethods } from "./PaymentMethods";
import { VerifiedOrganizer } from "./VerifiedOrganizer";

interface Props {
  countryCode?: string;
  paymentMethods?: string[];
  organizerName?: string;
  organizerVerified?: boolean;
  organizerLogoUrl?: string | null;
  locale?: string;
  children?: ReactNode;
  className?: string;
}

export function TrustPanel({
  countryCode,
  paymentMethods,
  organizerName,
  organizerVerified,
  organizerLogoUrl,
  locale,
  children,
  className,
}: Props): JSX.Element {
  const resolvedLocale = normalizeLocale(
    locale ?? (countryCode ? getCountryConfig(countryCode).locale : "fr"),
  );
  const hasOrganizer = Boolean(organizerName?.trim());

  return (
    <section className={cn("glass-panel rounded-[var(--radius-2xl)] p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <GuaranteeBadge locale={resolvedLocale} withTooltip />

        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--grtk-text-3)]">
          {translate(resolvedLocale, "trust.securePayment")}
        </p>
      </div>

      <div className="mt-5 border-t border-[var(--grtk-border)] pt-5">
        <PaymentMethods
          countryCode={countryCode}
          methods={paymentMethods}
          compact
          className="justify-start"
        />
      </div>

      {hasOrganizer && (
        <div className="mt-5 border-t border-[var(--grtk-border)] pt-5">
          <VerifiedOrganizer
            name={organizerName ?? ""}
            verified={organizerVerified}
            logoUrl={organizerLogoUrl}
            locale={resolvedLocale}
          />
        </div>
      )}

      {children && (
        <div className="mt-5 border-t border-[var(--grtk-border)] pt-5">{children}</div>
      )}
    </section>
  );
}
