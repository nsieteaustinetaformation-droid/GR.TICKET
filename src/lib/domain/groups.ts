import type { GroupPayment, GroupShare, GrtkTicket } from "../../lib/types";
import type { PaymentIntent } from "../payments/provider";
import { registerPaymentProvider, resolvePaymentProvider } from "../payments/registry";
import { cardProvider } from "../payments/providers/card";
import { mobileMoneyProvider } from "../payments/providers/mobile-money";
import { getState } from "../server/state";
import { recordAudit } from "../server/audit";
import {
  DEFAULT_GROUP_VALIDATION_MODE,
  DEFAULT_HOLD_HOURS,
  REMINDER_FINAL_RATIO,
  REMINDER_HALF_RATIO,
} from "./constants";
import { heldSeats, reserveSeats, releaseReservation } from "./reservations";

registerPaymentProvider(cardProvider);
registerPaymentProvider(mobileMoneyProvider);

export interface CreateGroupInput {
  eventId: string;
  eventTitle: string;
  initiatorName: string;
  countryCode: string;
  currency: string;
  validationMode?: GroupPayment["validationMode"];
  unitAmountMinor: number;
  quantity: number;
  capacity: number;
  holdHours?: number;
  now?: Date;
}

export type CreateGroupResult =
  | { ok: true; group: GroupPayment; shares: GroupShare[] }
  | { ok: false; error: "INVALID_QUANTITY" | "SOLD_OUT" };

export function createGroup(input: CreateGroupInput): CreateGroupResult {
  const holdHours = input.holdHours ?? DEFAULT_HOLD_HOURS;
  const reserved = reserveSeats({
    eventId: input.eventId,
    quantity: input.quantity,
    capacity: input.capacity,
    holdHours,
    now: input.now,
  });
  if (!reserved.ok) return { ok: false, error: reserved.error };

  const state = getState();
  const now = input.now ?? new Date();
  const group: GroupPayment = {
    id: crypto.randomUUID(),
    token: crypto.randomUUID().replace(/-/g, ""),
    eventId: input.eventId,
    eventTitle: input.eventTitle ?? "",
    initiatorName: input.initiatorName,
    currency: input.currency,
    countryCode: input.countryCode,
    validationMode: input.validationMode ?? DEFAULT_GROUP_VALIDATION_MODE,
    quantity: input.quantity,
    totalAmountMinor: input.unitAmountMinor * input.quantity,
    holdHours,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + holdHours * 3_600_000).toISOString(),
    status: "open",
    reminderHalfSent: false,
    reminderFinalSent: false,
  };

  const shares: GroupShare[] = Array.from({ length: input.quantity }, (_, index) => ({
    id: crypto.randomUUID(),
    groupId: group.id,
    seatIndex: reserved.reservation.seatStart + index,
    holderName: null,
    amountMinor: input.unitAmountMinor,
    status: "pending",
    idempotencyKey: null,
    paymentMethod: null,
    ticketId: null,
    paidAt: null,
  }));

  state.groups.set(group.id, group);
  shares.forEach((share) => state.shares.set(share.id, share));
  recordAudit("group.created", group.initiatorName, group.id, { quantity: group.quantity });
  return { ok: true, group, shares };
}

export interface PayShareInput {
  token: string;
  shareId: string;
  holderName: string;
  methodCode: string;
  idempotencyKey: string;
  now?: Date;
}

export type PayShareResult =
  | {
      ok: true;
      intent: PaymentIntent;
      share: GroupShare;
      ticket?: GrtkTicket;
      group: GroupPayment;
      replayed: boolean;
    }
  | {
      ok: false;
      error:
        | "GROUP_NOT_FOUND"
        | "GROUP_CLOSED"
        | "GROUP_EXPIRED"
        | "SHARE_NOT_FOUND"
        | "SHARE_NOT_PENDING"
        | "HOLDER_REQUIRED"
        | "PAYMENT_ERROR";
    };

export async function payShare(input: PayShareInput): Promise<PayShareResult> {
  const state = getState();
  const now = input.now ?? new Date();
  const group = [...state.groups.values()].find((item) => item.token === input.token);
  if (!group) return { ok: false, error: "GROUP_NOT_FOUND" };
  if (group.status !== "open") return { ok: false, error: "GROUP_CLOSED" };
  if (new Date(group.expiresAt).getTime() <= now.getTime()) {
    await expireGroup(group.id, now);
    return { ok: false, error: "GROUP_EXPIRED" };
  }

  const share = state.shares.get(input.shareId);
  if (!share || share.groupId !== group.id) return { ok: false, error: "SHARE_NOT_FOUND" };
  if (!input.idempotencyKey.trim()) return { ok: false, error: "PAYMENT_ERROR" };

  // Idempotence : une même clé rend toujours le même intent, jamais un second
  // paiement, même si la part est déjà passée au statut "paid".
  const idemKey = `${group.id}:${share.id}:${input.idempotencyKey}`;
  const existingIntentId = state.idempotency.get(idemKey);
  if (existingIntentId) {
    const intent = state.intents.get(existingIntentId);
    if (intent) {
      recordAudit("payment.replayed", input.holderName || share.holderName || "", share.id, { intentId: intent.id });
      return { ok: true, intent, share, group, replayed: true };
    }
  }

  if (share.status !== "pending") return { ok: false, error: "SHARE_NOT_PENDING" };
  if (!input.holderName.trim()) return { ok: false, error: "HOLDER_REQUIRED" };

  try {
    const provider = resolvePaymentProvider(input.methodCode, group.countryCode, group.currency);
    const intent = await provider.createIntent({
      amountMinor: share.amountMinor,
      currency: group.currency,
      countryCode: group.countryCode,
      methodCode: input.methodCode,
      referenceId: share.id,
      idempotencyKey: input.idempotencyKey,
      payerName: input.holderName.trim(),
      metadata: { groupId: group.id, token: group.token },
    });

    state.intents.set(intent.id, intent);
    state.idempotency.set(idemKey, intent.id);
    share.idempotencyKey = input.idempotencyKey;
    share.paymentMethod = provider.code;
    share.holderName = input.holderName.trim();

    if (intent.status === "succeeded") {
      share.status = "paid";
      share.paidAt = now.toISOString();
    }
    recordAudit("payment.created", input.holderName.trim(), share.id, {
      intentId: intent.id,
      amountMinor: share.amountMinor,
      currency: group.currency,
    });

    const groupShares = [...state.shares.values()].filter((item) => item.groupId === group.id);
    const allPaid = groupShares.every((item) => item.status === "paid");
    let ticket: GrtkTicket | undefined;

    if (allPaid) {
      // « Tout ou rien » : tous les billets sont émis en même temps.
      for (const paidShare of groupShares.filter((item) => item.status === "paid")) {
        const issued = issueTicket(group, paidShare, now);
        if (paidShare.id === share.id) ticket = issued;
      }
      group.status = "completed";
      recordAudit("group.completed", group.initiatorName, group.id, {});
    } else if (share.status === "paid" && group.validationMode === "paid_seats") {
      ticket = issueTicket(group, share, now);
    }

    return { ok: true, intent, share, ticket, group, replayed: false };
  } catch (error) {
    recordAudit("payment.failed", input.holderName, share.id, {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: "PAYMENT_ERROR" };
  }
}

export function issueTicket(group: GroupPayment, share: GroupShare, now = new Date()): GrtkTicket {
  const state = getState();
  if (share.ticketId && state.tickets.has(share.ticketId)) {
    return state.tickets.get(share.ticketId)!;
  }
  const ticket: GrtkTicket = {
    id: crypto.randomUUID(),
    eventId: group.eventId,
    eventTitle: group.eventTitle,
    holderName: share.holderName ?? group.initiatorName,
    holderAccountId: `account-${share.id}`,
    deviceId: `device-${share.id}`,
    seatLabel: `Place ${share.seatIndex}`,
    priceMinor: share.amountMinor,
    currency: group.currency,
    status: "active",
    qrVersion: 1,
    createdAt: now.toISOString(),
  };
  state.tickets.set(ticket.id, ticket);
  share.ticketId = ticket.id;
  recordAudit("ticket.issued", ticket.holderName, ticket.id, { groupId: group.id });
  return ticket;
}

export function getGroup(token: string) {
  const state = getState();
  const group = [...state.groups.values()].find((item) => item.token === token);
  if (!group) return null;
  return {
    group,
    shares: [...state.shares.values()].filter((item) => item.groupId === group.id),
    held: heldSeats(group.eventId),
  };
}

export async function expireGroup(groupId: string, now = new Date()): Promise<boolean> {
  const state = getState();
  const group = state.groups.get(groupId);
  if (!group || group.status !== "open") return false;

  const shares = [...state.shares.values()].filter((item) => item.groupId === groupId);
  const paid = shares.filter((item) => item.status === "paid");
  if (group.validationMode === "all_or_nothing") {
    await Promise.all(paid.map(async (share) => {
      share.status = "refunded";
      // Remboursement effectif via l'adaptateur d'origine quand les clés sont branchées.
      const intent = share.idempotencyKey
        ? state.intents.get(state.idempotency.get(`${group.id}:${share.id}:${share.idempotencyKey}`) ?? "")
        : undefined;
      if (intent) {
        const provider = resolvePaymentProvider(share.paymentMethod ?? "card", group.countryCode, group.currency);
        await provider.refund({ intentId: intent.id, amountMinor: share.amountMinor, currency: group.currency, reason: "group_expired" });
      }
      if (share.ticketId) {
        const ticket = state.tickets.get(share.ticketId);
        if (ticket) ticket.status = "refunded";
      }
      recordAudit("refund.issued", group.initiatorName, share.id, { reason: "group_expired" });
    }));
  }
  shares.filter((item) => item.status === "pending").forEach((item) => { item.status = "expired"; });
  group.status = "expired";
  const reservation = [...state.reservations.values()].find((item) => item.groupId === groupId);
  if (reservation) releaseReservation(reservation.id);
  recordAudit("group.expired", group.initiatorName, groupId, { validationMode: group.validationMode });
  return true;
}

export async function releaseExpiredGroups(now = new Date()): Promise<number> {
  const state = getState();
  let count = 0;
  for (const group of [...state.groups.values()]) {
    if (group.status === "open" && new Date(group.expiresAt).getTime() <= now.getTime()) {
      if (await expireGroup(group.id, now)) count += 1;
    }
  }
  return count;
}

export interface Reminder {
  shareId: string;
  holderName: string;
  kind: "half" | "final";
}

export function processReminders(now = new Date()): Reminder[] {
  const state = getState();
  const reminders: Reminder[] = [];
  for (const group of state.groups.values()) {
    if (group.status !== "open") continue;
    const elapsed = (now.getTime() - new Date(group.createdAt).getTime()) /
      (new Date(group.expiresAt).getTime() - new Date(group.createdAt).getTime());
    if (!group.reminderHalfSent && elapsed >= REMINDER_HALF_RATIO) {
      group.reminderHalfSent = true;
      [...state.shares.values()]
        .filter((item) => item.groupId === group.id && item.status === "pending" && item.holderName)
        .forEach((item) => reminders.push({ shareId: item.id, holderName: item.holderName!, kind: "half" }));
    }
    if (!group.reminderFinalSent && elapsed >= REMINDER_FINAL_RATIO) {
      group.reminderFinalSent = true;
      [...state.shares.values()]
        .filter((item) => item.groupId === group.id && item.status === "pending" && item.holderName)
        .forEach((item) => reminders.push({ shareId: item.id, holderName: item.holderName!, kind: "final" }));
    }
  }
  return reminders;
}
