import type { CountryConfig } from "./config";
import { registerCountryConfigs } from "./config";

/**
 * Données de configuration (pas de logique métier). En production, cette liste
 * est remplacée par les lignes des tables `countries` et `tax_rules`.
 * Ajouter un pays = ajouter une ligne ici ou en base, sans toucher au code.
 */
export const SEED_COUNTRIES: CountryConfig[] = [
  { countryCode: "CG", currency: "XAF", timeZone: "Africa/Brazzaville", locale: "fr", taxRate: 0, taxMode: "exclusive", taxLabel: "TVA", paymentMethods: ["mtn", "airtel"], guaranteeReserveMinor: 0 },
  { countryCode: "CD", currency: "CDF", timeZone: "Africa/Kinshasa", locale: "fr", taxRate: 0, taxMode: "exclusive", taxLabel: "TVA", paymentMethods: ["mtn", "airtel", "orange"], guaranteeReserveMinor: 0 },
  { countryCode: "FR", currency: "EUR", timeZone: "Europe/Paris", locale: "fr", taxRate: 0.2, taxMode: "inclusive", taxLabel: "TVA", paymentMethods: ["card"], guaranteeReserveMinor: 0 },
  { countryCode: "BE", currency: "EUR", timeZone: "Europe/Brussels", locale: "fr", taxRate: 0.21, taxMode: "inclusive", taxLabel: "TVA", paymentMethods: ["card"], guaranteeReserveMinor: 0 },
  { countryCode: "KE", currency: "KES", timeZone: "Africa/Nairobi", locale: "en", taxRate: 0.16, taxMode: "inclusive", taxLabel: "VAT", paymentMethods: ["mpesa", "card"], guaranteeReserveMinor: 0 },
  { countryCode: "US", currency: "USD", timeZone: "America/New_York", locale: "en", taxRate: 0, taxMode: "exclusive", taxLabel: "Sales tax", paymentMethods: ["card"], guaranteeReserveMinor: 0 },
  { countryCode: "GB", currency: "GBP", timeZone: "Europe/London", locale: "en", taxRate: 0.2, taxMode: "inclusive", taxLabel: "VAT", paymentMethods: ["card"], guaranteeReserveMinor: 0 },
];

export function installSeedConfig(): void {
  registerCountryConfigs(SEED_COUNTRIES);
}

installSeedConfig();
