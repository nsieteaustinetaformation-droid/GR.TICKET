import { fail, json, readJson } from "@/lib/api/respond";
import { createClaim, decideClaim } from "@/lib/domain/claims";
import type { GuaranteePolicy } from "@/lib/domain/claims";
import { getState } from "@/lib/server/state";

interface Body {
  ticketId?: string;
  reason?: string;
  photoUrl?: string;
  countryCode?: string;
  autoDecide?: boolean;
}

export async function POST(request: Request) {
  const body = await readJson<Body>(request);
  // La décision automatique est réservée au serveur : un visiteur ne peut pas
  // s'approuver lui-même en envoyant `autoDecide: true`.
  if (body?.autoDecide === true) return fail("FORBIDDEN", 403);
  if (!body?.ticketId || !body.reason) return fail("TICKET_AND_REASON_REQUIRED");

  const created = createClaim({ ticketId: body.ticketId, reason: body.reason, photoUrl: body.photoUrl });
  if (!created.ok) return fail(created.error, 409);

  const ticket = getState().tickets.get(body.ticketId);
  const policy: GuaranteePolicy = {
    compensationPercent: Number(process.env.GRTK_COMPENSATION_PERCENT ?? 0),
    claimWindowHours: Number(process.env.GRTK_CLAIM_WINDOW_HOURS ?? 72),
    reserveMinor: Number(process.env.GRTK_RESERVE_MINOR ?? ticket?.priceMinor ?? 0),
  };

  if (body.autoDecide) {
    const decision = decideClaim({ claimId: created.claim.id, policy, mode: "auto", approved: true });
    if (!decision.ok && decision.error !== "FRAUD_SUSPECTED" && decision.error !== "OUT_OF_WINDOW") {
      return fail(decision.error, 409);
    }
    return json({ ok: true, claim: created.claim, decision, escalated: !decision.ok }, 201);
  }
  return json({ ok: true, claim: created.claim, escalated: true }, 201);
}
