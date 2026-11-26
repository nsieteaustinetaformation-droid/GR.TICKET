import { fail, json, readJson } from "@/lib/api/respond";
import { decideClaim } from "@/lib/domain/claims";
import type { GuaranteePolicy } from "@/lib/domain/claims";
import { getState } from "@/lib/server/state";

interface Body {
  approved?: boolean;
  compensationPercent?: number;
  claimWindowHours?: number;
  reserveMinor?: number;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJson<Body>(request);
  if (typeof body?.approved !== "boolean") return fail("APPROVED_REQUIRED");

  const ticketId = getState().claims.get(id)?.ticketId;
  const ticket = ticketId ? getState().tickets.get(ticketId) : undefined;
  const policy: GuaranteePolicy = {
    compensationPercent: body.compensationPercent ?? Number(process.env.GRTK_COMPENSATION_PERCENT ?? 0),
    claimWindowHours: body.claimWindowHours ?? Number(process.env.GRTK_CLAIM_WINDOW_HOURS ?? 72),
    reserveMinor: body.reserveMinor ?? Number(process.env.GRTK_RESERVE_MINOR ?? ticket?.priceMinor ?? 0),
  };

  const result = decideClaim({ claimId: id, policy, mode: "agent", approved: body.approved });
  if (!result.ok) return fail(result.error, 409);
  return json({ ok: true, claim: result.claim, paidMinor: result.paidMinor });
}
