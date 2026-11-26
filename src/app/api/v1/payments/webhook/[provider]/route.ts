import { createHmac, timingSafeEqual } from "node:crypto";
import { fail, json, readJson } from "@/lib/api/respond";
import { getPaymentProvider } from "@/lib/payments/registry";
import "@/lib/payments";
import { getState } from "@/lib/server/state";
import { recordAudit } from "@/lib/server/audit";

/**
 * Webhook idempotent : la signature est vérifiée, puis la clé d'idempotence
 * garantit qu'un webhook rejoué ne déclenche jamais deux traitements.
 */
export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: code } = await params;
  const provider = getPaymentProvider(code);
  if (!provider) return fail("UNKNOWN_PROVIDER", 404);

  const raw = await request.text();
  const signature = request.headers.get("x-grtk-signature") ?? "";
  const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? "demo-webhook-secret";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fail("INVALID_SIGNATURE", 401);

  const payload = JSON.parse(raw) as Record<string, unknown>;
  const event = await provider.verifyWebhook(payload);
  const key = `webhook:${event.idempotencyKey || event.externalRef}`;
  const state = getState();
  if (state.idempotency.has(key)) {
    return json({ ok: true, replayed: true, status: "already_processed" });
  }
  state.idempotency.set(key, event.externalRef);

  for (const intent of state.intents.values()) {
    if (intent.externalRef === event.externalRef) intent.status = event.status;
  }
  recordAudit("payment.webhook", provider.code, event.externalRef, {
    status: event.status,
    idempotencyKey: event.idempotencyKey,
  });
  return json({ ok: true, replayed: false, status: event.status });
}
