import { createHmac, timingSafeEqual } from "node:crypto";
import { DEMO_COOKIE } from "./constants";
import { normalizeRole, type AccountRole } from "./roles";

/**
 * Session de démonstration signée côté serveur.
 * Sans clés Supabase, l'application reste utilisable, mais les espaces privés
 * et les API sensibles vérifient quand même un cookie signé (pas un simple
 * `localStorage` modifiable par le visiteur).
 */
export { DEMO_COOKIE };
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface DemoSessionPayload {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: AccountRole;
  exp: number;
}

function signingSecret(): string {
  const configured = process.env.TICKET_SIGNATURE_SECRET?.trim();
  // Valeur de développement uniquement : en production la variable doit être définie.
  return configured && configured !== "changez-moi" ? configured : "gr-ticket-demo-session-dev-secret";
}

function signature(data: string): string {
  return createHmac("sha256", signingSecret()).update(data).digest("base64url");
}

export function signDemoSession(input: Omit<DemoSessionPayload, "exp">): string {
  const payload: DemoSessionPayload = {
    ...input,
    role: normalizeRole(input.role),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${signature(data)}`;
}

export function verifyDemoSession(token?: string | null): DemoSessionPayload | null {
  if (!token) return null;
  const [data, mac] = token.split(".");
  if (!data || !mac) return null;
  const expected = signature(data);
  const a = Buffer.from(expected);
  const b = Buffer.from(mac);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as DemoSessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.id || !payload.email) return null;
    return { ...payload, role: normalizeRole(payload.role) };
  } catch {
    return null;
  }
}

export const demoCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
