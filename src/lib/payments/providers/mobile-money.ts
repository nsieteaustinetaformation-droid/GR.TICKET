import type {
  CreateIntentInput,
  PaymentIntent,
  PaymentProvider,
  RefundInput,
  RefundResult,
  WebhookEvent,
} from "../provider";

const MOBILE_MONEY_METHODS = new Set(["mtn", "airtel", "mpesa", "orange", "wallet"]);

/**
 * Adaptateur mobile money / portefeuilles via un agrégateur unique.
 * Un nouveau réseau s'ajoute dans MOBILE_MONEY_METHODS, sans toucher au métier.
 */
export const mobileMoneyProvider: PaymentProvider = {
  code: "mobile-money",
  labelKey: "payment.mobileMoney",

  supports(methodCode: string) {
    return MOBILE_MONEY_METHODS.has(methodCode.toLowerCase());
  },

  async createIntent(input: CreateIntentInput): Promise<PaymentIntent> {
    const externalRef = `mm_${crypto.randomUUID()}`;
    return {
      id: `pi_${crypto.randomUUID()}`,
      providerCode: this.code,
      methodCode: input.methodCode.toLowerCase(),
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: process.env.MOBILE_MONEY_MODE === "live" ? "requires_action" : "succeeded",
      externalRef,
      checkoutUrl: process.env.MOBILE_MONEY_MODE === "live" ? `https://pay.example.test/${externalRef}` : undefined,
      createdAt: new Date().toISOString(),
    };
  },

  async retrieveIntent() {
    return null;
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    return { id: `re_${crypto.randomUUID()}`, status: "refunded", externalRef: `mm_refund_${input.intentId}` };
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
