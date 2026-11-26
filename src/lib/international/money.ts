/**
 * Argent international : montants en unités mineures entières + code ISO 4217.
 * Aucun float, aucune devise codée en dur dans le métier.
 */

export interface Money {
  amountMinor: number;
  currency: string;
}

/** « fr » / « en » sont des codes d'interface ; Intl attend une locale complète. */
export function normalizeIntlLocale(locale?: string | null): string {
  const value = (locale ?? "").toLowerCase();
  if (value.startsWith("fr")) return "fr-FR";
  if (value.startsWith("en")) return "en-US";
  return value || "en-US";
}

export function resolveCurrencyDigits(currency: string, locale = "en-US"): number {
  const digits = new Intl.NumberFormat(normalizeIntlLocale(locale), {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits ?? 2;
  return Number.isFinite(digits) ? digits : 2;
}

export function toMinor(amountMajor: number, currency: string, locale?: string): number {
  return Math.round(amountMajor * 10 ** resolveCurrencyDigits(currency, locale));
}

export function toMajor(amountMinor: number, currency: string, locale?: string): number {
  return amountMinor / 10 ** resolveCurrencyDigits(currency, locale);
}

export function formatMoney(amountMinor: number, currency: string, locale = "en-US"): string {
  const intlLocale = normalizeIntlLocale(locale);
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(toMajor(amountMinor, currency, intlLocale));
}

export interface TaxResult {
  netMinor: number;
  taxMinor: number;
  grossMinor: number;
  taxRate: number;
}

export function applyTax(
  amountMinor: number,
  taxRate: number,
  mode: "inclusive" | "exclusive" = "exclusive"
): TaxResult {
  if (mode === "inclusive") {
    const grossMinor = amountMinor;
    const taxMinor = Math.round(grossMinor - grossMinor / (1 + taxRate));
    return { netMinor: grossMinor - taxMinor, taxMinor, grossMinor, taxRate };
  }
  const taxMinor = Math.round(amountMinor * taxRate);
  return { netMinor: amountMinor, taxMinor, grossMinor: amountMinor + taxMinor, taxRate };
}

export function percentage(amountMinor: number, percent: number): number {
  return Math.round(amountMinor * percent);
}
