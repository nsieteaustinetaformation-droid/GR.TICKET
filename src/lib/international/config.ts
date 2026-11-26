/**
 * Configuration pays/devise/fuseau/taxe.
 * Les valeurs viennent de la base (table countries/tax_rules) ou d'un seed de test.
 * Le métier ne contient aucune branche spécifique à un pays.
 */

export interface CountryConfig {
  countryCode: string;
  currency: string;
  timeZone: string;
  locale: "fr" | "en";
  taxRate: number;
  taxMode: "inclusive" | "exclusive";
  taxLabel: string;
  paymentMethods: string[];
  guaranteeReserveMinor: number;
}

const registry = new Map<string, CountryConfig>();

export function registerCountryConfig(config: CountryConfig): void {
  registry.set(config.countryCode.toUpperCase(), config);
}

export function registerCountryConfigs(configs: CountryConfig[]): void {
  configs.forEach(registerCountryConfig);
}

export function getCountryConfig(countryCode?: string | null): CountryConfig {
  if (!countryCode) return neutralConfig("");
  return registry.get(countryCode.toUpperCase()) ?? neutralConfig(countryCode.toUpperCase());
}

export function listCountryConfigs(): CountryConfig[] {
  return [...registry.values()];
}

export function clearCountryConfigs(): void {
  registry.clear();
}

function neutralConfig(countryCode: string): CountryConfig {
  return {
    countryCode,
    currency: "USD",
    timeZone: "UTC",
    locale: "en",
    taxRate: 0,
    taxMode: "exclusive",
    taxLabel: "Tax",
    paymentMethods: ["card"],
    guaranteeReserveMinor: 0,
  };
}
