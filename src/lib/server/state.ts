import type {
  AuditEntry,
  GroupPayment,
  GroupShare,
  GrtkTicket,
  RefundClaim,
} from "../../lib/types";
import type { PaymentIntent } from "../payments/provider";

export interface Reservation {
  id: string;
  eventId: string;
  quantity: number;
  seatStart: number;
  expiresAt: string;
  groupId?: string;
}

export interface QrChallenge {
  ticketId: string;
  nonce: string;
  scannerId: string;
  createdAt: string;
  expiresAt: string;
}

export interface ServerState {
  groups: Map<string, GroupPayment>;
  shares: Map<string, GroupShare>;
  intents: Map<string, PaymentIntent>;
  tickets: Map<string, GrtkTicket>;
  claims: Map<string, RefundClaim>;
  audit: AuditEntry[];
  seats: Map<string, number>;
  reservations: Map<string, Reservation>;
  usedNonces: Set<string>;
  challenges: Map<string, QrChallenge>;
  idempotency: Map<string, string>;
  deviceSecrets: Map<string, string>;
}

declare global {
  // eslint-disable-next-line no-var
  var __grtkState: ServerState | undefined;
}

function emptyState(): ServerState {
  return {
    groups: new Map(),
    shares: new Map(),
    intents: new Map(),
    tickets: new Map(),
    claims: new Map(),
    audit: [],
    seats: new Map(),
    reservations: new Map(),
    usedNonces: new Set(),
    challenges: new Map(),
    idempotency: new Map(),
    deviceSecrets: new Map(),
  };
}

/**
 * État serveur de démonstration. En production, ces collections sont remplacées
 * par les tables Postgres correspondantes (voir supabase/schema.sql). Les
 * services métier ne dépendent pas du stockage : ils reçoivent l'état en entrée.
 */
export function getState(): ServerState {
  if (!globalThis.__grtkState) globalThis.__grtkState = emptyState();
  return globalThis.__grtkState;
}

export function resetState(): void {
  globalThis.__grtkState = emptyState();
}
