import { getState } from "../server/state";
import type { Reservation } from "../server/state";
import { DEFAULT_HOLD_HOURS } from "./constants";

export interface ReserveInput {
  eventId: string;
  quantity: number;
  capacity: number;
  holdHours?: number;
  groupId?: string;
  now?: Date;
}

export type ReserveResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; error: "INVALID_QUANTITY" | "SOLD_OUT" };

/**
 * Réservation atomique : le compteur de places est calculé et écrit en une
 * seule opération. Avec Postgres, la même garantie est apportée par la RPC
 * reserve_seats() (SELECT ... FOR UPDATE) décrite dans le schéma SQL.
 */
export function reserveSeats(input: ReserveInput): ReserveResult {
  const { eventId, quantity, capacity, groupId } = input;
  const holdHours = input.holdHours ?? DEFAULT_HOLD_HOURS;
  if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(capacity)) {
    return { ok: false, error: "INVALID_QUANTITY" };
  }

  const state = getState();
  const now = input.now ?? new Date();
  const active = [...state.reservations.values()].filter(
    (item) => item.eventId === eventId && new Date(item.expiresAt).getTime() > now.getTime()
  );
  const held = active.reduce((sum, item) => sum + item.quantity, 0);

  if (held + quantity > capacity) return { ok: false, error: "SOLD_OUT" };

  const reservation: Reservation = {
    id: crypto.randomUUID(),
    eventId,
    quantity,
    seatStart: held + 1,
    expiresAt: new Date(now.getTime() + holdHours * 3_600_000).toISOString(),
    groupId,
  };
  state.reservations.set(reservation.id, reservation);
  state.seats.set(eventId, held + quantity);
  return { ok: true, reservation };
}

export function releaseReservation(reservationId: string): boolean {
  const state = getState();
  const reservation = state.reservations.get(reservationId);
  if (!reservation) return false;
  state.reservations.delete(reservationId);
  const remaining = [...state.reservations.values()]
    .filter((item) => item.eventId === reservation.eventId)
    .reduce((sum, item) => sum + item.quantity, 0);
  state.seats.set(reservation.eventId, remaining);
  return true;
}

export function releaseExpiredReservations(now = new Date()): number {
  const state = getState();
  let released = 0;
  for (const reservation of [...state.reservations.values()]) {
    if (new Date(reservation.expiresAt).getTime() <= now.getTime()) {
      if (releaseReservation(reservation.id)) released += 1;
    }
  }
  return released;
}

export function heldSeats(eventId: string, now = new Date()): number {
  return [...getState().reservations.values()]
    .filter((item) => item.eventId === eventId && new Date(item.expiresAt).getTime() > now.getTime())
    .reduce((sum, item) => sum + item.quantity, 0);
}
