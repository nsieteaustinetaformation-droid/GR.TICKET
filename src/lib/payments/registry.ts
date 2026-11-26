import type { PaymentProvider } from "./provider";

const providers = new Map<string, PaymentProvider>();

export function registerPaymentProvider(provider: PaymentProvider): void {
  providers.set(provider.code, provider);
}

export function getPaymentProvider(code: string): PaymentProvider | undefined {
  return providers.get(code);
}

export function listPaymentProviders(): PaymentProvider[] {
  return [...providers.values()];
}

export function resolvePaymentProvider(methodCode: string, countryCode: string, currency: string): PaymentProvider {
  const provider = listPaymentProviders().find((item) => item.supports(methodCode, countryCode, currency));
  if (!provider) {
    throw new Error(`Aucun moyen de paiement disponible: ${methodCode} / ${countryCode} / ${currency}`);
  }
  return provider;
}

export function clearPaymentProviders(): void {
  providers.clear();
}
