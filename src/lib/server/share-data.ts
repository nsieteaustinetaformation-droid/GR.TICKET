import { formatMoney } from "@/lib/international/money";
import { getState } from "./state";

/**
 * Données nécessaires aux métadonnées et à l'image d'aperçu des liens partagés.
 * En démonstration elles viennent de l'état serveur ; elles seront lues depuis
 * Postgres quand la persistance sera branchée, sans changer les calculs.
 */

export interface SharePreviewData {
  eventTitle: string;
  amountLabel: string;
  holderName: string;
  initiator: string;
  currency: string;
}

export function getSharePreview(token: string, shareId: string): SharePreviewData | null {
  const state = getState();
  const group = [...state.groups.values()].find((item) => item.token === token);
  if (!group) return null;
  const share = state.shares.get(shareId);
  if (!share || share.groupId !== group.id) return null;
  return {
    eventTitle: group.eventTitle || "Événement GR Ticket",
    amountLabel: formatMoney(share.amountMinor, group.currency, "fr"),
    holderName: share.holderName ?? "",
    initiator: group.initiatorName,
    currency: group.currency,
  };
}

export interface GroupPreviewData {
  eventTitle: string;
  initiator: string;
  totalLabel: string;
  quantity: number;
}

export function getGroupPreview(token: string): GroupPreviewData | null {
  const state = getState();
  const group = [...state.groups.values()].find((item) => item.token === token);
  if (!group) return null;
  return {
    eventTitle: group.eventTitle || "Événement GR Ticket",
    initiator: group.initiatorName,
    totalLabel: formatMoney(group.totalAmountMinor, group.currency, "fr"),
    quantity: group.quantity,
  };
}

export interface TicketPreviewData {
  eventTitle: string;
  holderName: string;
  priceLabel: string;
}

export function getTicketPreview(ticketId: string): TicketPreviewData | null {
  const ticket = getState().tickets.get(ticketId);
  if (!ticket) return null;
  return {
    eventTitle: ticket.eventTitle || "Événement GR Ticket",
    holderName: ticket.holderName,
    priceLabel: formatMoney(ticket.priceMinor, ticket.currency, "fr"),
  };
}
