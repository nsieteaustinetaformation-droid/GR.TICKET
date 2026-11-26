import { createHmac, timingSafeEqual } from "node:crypto";
import type { GrtkTicket } from "../../lib/types";
import { getState } from "../server/state";
import { recordAudit } from "../server/audit";
import { QR_WINDOW_MS } from "./constants";

export function qrWindow(now = new Date()): number {
  return Math.floor(now.getTime() / QR_WINDOW_MS);
}

export function getOrCreateDeviceSecret(deviceId: string): string {
  const state = getState();
  let secret = state.deviceSecrets.get(deviceId);
  if (!secret) {
    secret = createHmac("sha256", deviceId).update(crypto.randomUUID()).digest("hex");
    state.deviceSecrets.set(deviceId, secret);
  }
  return secret;
}

export interface QrChallengeResult {
  nonce: string;
  expiresAt: string;
  window: number;
}

/** Le scanner émet un défi : une capture d'écran ne peut pas y répondre. */
export function createChallenge(ticketId: string, scannerId: string, now = new Date()): QrChallengeResult {
  const state = getState();
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const challenge = {
    ticketId,
    nonce,
    scannerId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + QR_WINDOW_MS).toISOString(),
  };
  state.challenges.set(nonce, challenge);
  return { nonce, expiresAt: challenge.expiresAt, window: qrWindow(now) };
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Construit le QR dynamique : il change toutes les 30 secondes (fenêtre). */
export function buildDynamicQr(ticket: GrtkTicket, nonce: string, now = new Date()): string {
  const secret = getOrCreateDeviceSecret(ticket.deviceId);
  const payload = `${ticket.id}.${nonce}.${qrWindow(now)}.${ticket.qrVersion}`;
  return `${payload}.${sign(payload, secret)}`;
}

export type ScanResult =
  | { ok: true; ticket: GrtkTicket; nonce: string }
  | {
      ok: false;
      error:
        | "MALFORMED"
        | "INVALID_SIGNATURE"
        | "EXPIRED_WINDOW"
        | "WRONG_VERSION"
        | "CHALLENGE_NOT_FOUND"
        | "NONCE_REPLAY"
        | "ALREADY_USED"
        | "NOT_ACTIVE";
    };

/**
 * Vérifie : signature de l'appareil lié, fenêtre de 30 s, version du QR,
 * défi non réutilisé, billet non déjà scanné. Chaque tentative est journalisée.
 */
export function verifyScan(token: string, scannerId: string, now = new Date()): ScanResult {
  const state = getState();
  const parts = token.split(".");
  if (parts.length !== 5) return { ok: false, error: "MALFORMED" };

  const [ticketId, nonce, windowValue, versionValue, signature] = parts;
  const ticket = state.tickets.get(ticketId);
  if (!ticket) return { ok: false, error: "MALFORMED" };

  const payload = `${ticketId}.${nonce}.${windowValue}.${versionValue}`;
  const expected = sign(payload, getOrCreateDeviceSecret(ticket.deviceId));
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    recordAudit("scan.rejected", scannerId, ticketId, { reason: "INVALID_SIGNATURE" });
    return { ok: false, error: "INVALID_SIGNATURE" };
  }

  if (Number(windowValue) !== qrWindow(now)) {
    recordAudit("scan.rejected", scannerId, ticketId, { reason: "EXPIRED_WINDOW" });
    return { ok: false, error: "EXPIRED_WINDOW" };
  }
  if (Number(versionValue) !== ticket.qrVersion) {
    recordAudit("scan.rejected", scannerId, ticketId, { reason: "WRONG_VERSION" });
    return { ok: false, error: "WRONG_VERSION" };
  }
  const challenge = state.challenges.get(nonce);
  if (!challenge || challenge.ticketId !== ticketId || challenge.scannerId !== scannerId) {
    recordAudit("scan.rejected", scannerId, ticketId, { reason: "CHALLENGE_NOT_FOUND" });
    return { ok: false, error: "CHALLENGE_NOT_FOUND" };
  }
  if (state.usedNonces.has(nonce)) {
    recordAudit("scan.rejected", scannerId, ticketId, { reason: "NONCE_REPLAY" });
    return { ok: false, error: "NONCE_REPLAY" };
  }
  if (ticket.status === "used" || ticket.status === "transferred" || ticket.status === "refunded") {
    recordAudit("scan.rejected", scannerId, ticketId, { reason: "ALREADY_USED", status: ticket.status });
    return { ok: false, error: "ALREADY_USED" };
  }
  if (ticket.status !== "active") {
    recordAudit("scan.rejected", scannerId, ticketId, { reason: "NOT_ACTIVE", status: ticket.status });
    return { ok: false, error: "NOT_ACTIVE" };
  }

  state.usedNonces.add(nonce);
  ticket.status = "used";
  recordAudit("scan.accepted", scannerId, ticketId, { nonce, holder: ticket.holderName });
  return { ok: true, ticket, nonce };
}
