import { fail, json, readJson } from "@/lib/api/respond";
import { payShare } from "@/lib/domain/groups";

interface Body {
  holderName?: string;
  methodCode?: string;
  idempotencyKey?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string; shareId: string }> }
) {
  const { token, shareId } = await params;
  const body = await readJson<Body>(request);
  if (!body?.holderName || !body.methodCode || !body.idempotencyKey) {
    return fail("HOLDER_METHOD_AND_IDEMPOTENCY_KEY_REQUIRED");
  }

  const result = await payShare({
    token,
    shareId,
    holderName: body.holderName,
    methodCode: body.methodCode,
    idempotencyKey: body.idempotencyKey,
  });
  if (!result.ok) return fail(result.error, result.error === "PAYMENT_ERROR" ? 502 : 409);
  return json({ ok: true, intent: result.intent, share: result.share, ticket: result.ticket, group: result.group, replayed: result.replayed });
}
