import type { GrtkTicket, RefundClaim } from "../../lib/types";
import { getState } from "../server/state";
import { recordAudit } from "../server/audit";
import { DEFAULT_CLAIM_WINDOW_HOURS, DEFAULT_COMPENSATION_PERCENT } from "./constants";

export interface GuaranteePolicy {
  compensationPercent: number;
  claimWindowHours: number;
  reserveMinor: number;
}

export interface CreateClaimInput {
  ticketId: string;
  reason: string;
  photoUrl?: string;
  now?: Date;
}

export type CreateClaimResult =
  | { ok: true; claim: RefundClaim }
  | { ok: false; error: "TICKET_NOT_FOUND" | "REASON_REQUIRED" | "ALREADY_CLAIMED" };

export function createClaim(input: CreateClaimInput): CreateClaimResult {
  const state = getState();
  const ticket = state.tickets.get(input.ticketId);
  if (!ticket) return { ok: false, error: "TICKET_NOT_FOUND" };
  if (!input.reason.trim()) return { ok: false, error: "REASON_REQUIRED" };
  const existing = [...state.claims.values()].some(
    (item) => item.ticketId === ticket.id && item.status !== "rejected"
  );
  if (existing) return { ok: false, error: "ALREADY_CLAIMED" };

  const claim: RefundClaim = {
    id: crypto.randomUUID(),
    ticketId: ticket.id,
    reason: input.reason.trim(),
    photoUrl: input.photoUrl,
    status: "pending",
    decision: null,
    amountMinor: ticket.priceMinor,
    createdAt: (input.now ?? new Date()).toISOString(),
  };
  state.claims.set(claim.id, claim);
  recordAudit("claim.created", ticket.holderAccountId, claim.id, { ticketId: ticket.id });
  return { ok: true, claim };
}

export interface DecideClaimInput {
  claimId: string;
  policy: GuaranteePolicy;
  mode: "auto" | "agent";
  approved: boolean;
  now?: Date;
}

export type DecideClaimResult =
  | { ok: true; claim: RefundClaim; paidMinor: number; decision: "auto" | "agent" }
  | { ok: false; error: "CLAIM_NOT_FOUND" | "ALREADY_DECIDED" | "OUT_OF_WINDOW" | "FRAUD_SUSPECTED" | "INSUFFICIENT_RESERVE" };

/**
 * Règle automatique : le billet est valide et non utilisé ailleurs, la
 * réclamation est dans le délai et la réserve du pays est suffisante.
 * Sinon, escalade vers un agent (le mode auto ne décide pas à la légère).
 */
export function decideClaim(input: DecideClaimInput): DecideClaimResult {
  const state = getState();
  const claim = state.claims.get(input.claimId);
  if (!claim) return { ok: false, error: "CLAIM_NOT_FOUND" };
  if (claim.status !== "pending") return { ok: false, error: "ALREADY_DECIDED" };

  const ticket = state.tickets.get(claim.ticketId);
  if (!ticket) return { ok: false, error: "FRAUD_SUSPECTED" };

  const now = input.now ?? new Date();
  const windowMs = (input.policy.claimWindowHours ?? DEFAULT_CLAIM_WINDOW_HOURS) * 3_600_000;
  const inWindow = now.getTime() - new Date(claim.createdAt).getTime() <= windowMs;

  if (input.mode === "auto") {
    if (!inWindow) return { ok: false, error: "OUT_OF_WINDOW" };
    if (ticket.status !== "active") {
      claim.status = "rejected";
      claim.decision = "auto";
      claim.decidedAt = now.toISOString();
      recordAudit("claim.auto_rejected", "system", claim.id, { reason: "ticket_not_active", status: ticket.status });
      return { ok: false, error: "FRAUD_SUSPECTED" };
    }
  }

  if (!input.approved) {
    claim.status = "rejected";
    claim.decision = input.mode;
    claim.decidedAt = now.toISOString();
    recordAudit("claim.rejected", input.mode, claim.id, {});
    return { ok: true, claim, paidMinor: 0, decision: input.mode };
  }

  const compensationRate = input.policy.compensationPercent ?? DEFAULT_COMPENSATION_PERCENT;
  const paidMinor = claim.amountMinor + Math.round(claim.amountMinor * compensationRate);
  if (paidMinor > input.policy.reserveMinor) return { ok: false, error: "INSUFFICIENT_RESERVE" };

  claim.status = "paid";
  claim.decision = input.mode;
  claim.decidedAt = now.toISOString();
  ticket.status = "refunded";
  recordAudit("refund.issued", input.mode, claim.id, {
    ticketId: ticket.id,
    amountMinor: paidMinor,
    compensationPercent: compensationRate,
  });
  return { ok: true, claim, paidMinor, decision: input.mode };
}

export interface GuaranteeStats {
  claims: number;
  paidClaims: number;
  fraudDetected: number;
  fraudRate: number;
  totalCostMinor: number;
}

export function guaranteeStats(): GuaranteeStats {
  const claims = [...getState().claims.values()];
  const fraudDetected = claims.filter((item) => item.status === "rejected").length;
  const paidClaims = claims.filter((item) => item.status === "paid").length;
  const paidAudit = getState().audit
    .filter((entry) => entry.action === "refund.issued")
    .reduce((sum, entry) => {
      const amount = entry.metadata?.amountMinor;
      return sum + (typeof amount === "number" ? amount : 0);
    }, 0);
  return {
    claims: claims.length,
    paidClaims,
    fraudDetected,
    fraudRate: claims.length === 0 ? 0 : fraudDetected / claims.length,
    totalCostMinor: paidAudit,
  };
}
