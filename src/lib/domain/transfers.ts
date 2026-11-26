import type { GrtkTicket } from "../../lib/types";
import { getState } from "../server/state";
import { recordAudit } from "../server/audit";
import { DEFAULT_RESALE_CAP_PERCENT } from "./constants";

export interface TransferInput {
  ticketId: string;
  fromAccountId: string;
  toAccountId: string;
  toDeviceId: string;
  toHolderName: string;
  resalePriceMinor: number;
  resaleCapPercent?: number;
  now?: Date;
}

export type TransferResult =
  | { ok: true; newTicket: GrtkTicket }
  | {
      ok: false;
      error: "TICKET_NOT_FOUND" | "NOT_OWNER" | "NOT_TRANSFERABLE" | "PRICE_ABOVE_CAP";
    };

/**
 * Transfert/revente dans GRTK uniquement. L'ancien QR est invalidé par
 * l'incrément de version ; un nouveau billet est lié au nouvel appareil.
 */
export function transferTicket(input: TransferInput): TransferResult {
  const state = getState();
  const ticket = state.tickets.get(input.ticketId);
  if (!ticket) return { ok: false, error: "TICKET_NOT_FOUND" };
  if (ticket.holderAccountId !== input.fromAccountId) return { ok: false, error: "NOT_OWNER" };
  if (ticket.status !== "active") return { ok: false, error: "NOT_TRANSFERABLE" };

  const cap = input.resaleCapPercent ?? DEFAULT_RESALE_CAP_PERCENT;
  if (input.resalePriceMinor > ticket.priceMinor * cap) return { ok: false, error: "PRICE_ABOVE_CAP" };

  const now = input.now ?? new Date();
  ticket.status = "transferred";
  ticket.qrVersion += 1;

  const newTicket: GrtkTicket = {
    id: crypto.randomUUID(),
    eventId: ticket.eventId,
    eventTitle: ticket.eventTitle,
    holderName: input.toHolderName.trim(),
    holderAccountId: input.toAccountId,
    deviceId: input.toDeviceId,
    seatLabel: ticket.seatLabel,
    priceMinor: input.resalePriceMinor,
    currency: ticket.currency,
    status: "active",
    qrVersion: ticket.qrVersion,
    createdAt: now.toISOString(),
  };
  state.tickets.set(newTicket.id, newTicket);
  recordAudit("ticket.transferred", input.fromAccountId, ticket.id, {
    toTicketId: newTicket.id,
    oldVersionInvalidated: ticket.qrVersion - 1,
    priceMinor: input.resalePriceMinor,
  });
  return { ok: true, newTicket };
}
