import type {
  CreateIntentInput,
  PaymentIntent,
  PaymentProvider,
  RefundInput,
  RefundResult,
  WebhookEvent,
} from "../provider";

/**
 * Adaptateur cartes bancaires. Les identifiants restent côté serveur.
 * Tant que la clé n'est pas fournie, le provider fonctionne en simulation.
 */
export const cardProvider: PaymentProvider = {
  code: "card",
  labelKey: "payment.card",

  supports(methodCode: string) {
    return methodCode === "card";
  },

  async createIntent(input: CreateIntentInput): Promise<PaymentIntent> {
    const externalRef = `card_${crypto.randomUUID()}`;
    return {
      id: `pi_${crypto.randomUUID()}`,
      providerCode: this.code,
      methodCode: input.methodCode,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: process.env.CARD_PROVIDER_MODE === "live" ? "requires_action" : "succeeded",
      externalRef,
      checkoutUrl: process.env.CARD_PROVIDER_MODE === "live" ? `https://pay.example.test/${externalRef}` : undefined,
      createdAt: new Date().toISOString(),
    };
  },

  async retrieveIntent() {
    return null;
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    return { id: `re_${crypto.randomUUID()}`, status: "refunded", externalRef: `card_refund_${input.intentId}` };
  },

  async verifyWebhook(payload: unknown): Promise<WebhookEvent> {
    const data = payload as Record<string, unknown>;
    return {
      providerCode: this.code,
      externalRef: String(data.externalRef ?? ""),
      status: (data.status as WebhookEvent["status"]) ?? "succeeded",
      idempotencyKey: String(data.idempotencyKey ?? ""),
    };
  },
};
