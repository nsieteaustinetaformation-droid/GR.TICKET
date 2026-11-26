export type PaymentStatus = "requires_action" | "succeeded" | "failed" | "refunded";

export interface CreateIntentInput {
  amountMinor: number;
  currency: string;
  countryCode: string;
  methodCode: string;
  referenceId: string;
  idempotencyKey: string;
  payerName?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  providerCode: string;
  methodCode: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  externalRef: string;
  checkoutUrl?: string;
  createdAt: string;
}

export interface WebhookEvent {
  providerCode: string;
  externalRef: string;
  status: PaymentStatus;
  idempotencyKey: string;
}

export interface RefundInput {
  intentId: string;
  amountMinor: number;
  currency: string;
  reason: string;
}

export interface RefundResult {
  id: string;
  status: "refunded" | "failed";
  externalRef: string;
}

/**
 * Contrat d'un moyen de paiement. Un nouvel adaptateur s'ajoute sans toucher
 * aux services métier : il suffit de l'enregistrer dans le registre.
 */
export interface PaymentProvider {
  readonly code: string;
  readonly labelKey: string;
  supports(methodCode: string, countryCode: string, currency: string): boolean;
  createIntent(input: CreateIntentInput): Promise<PaymentIntent>;
  retrieveIntent(intentId: string): Promise<PaymentIntent | null>;
  refund(input: RefundInput): Promise<RefundResult>;
  verifyWebhook(payload: unknown): Promise<WebhookEvent>;
}
