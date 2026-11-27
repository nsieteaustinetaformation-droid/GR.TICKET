import { getServerAuth, type ServerAuth } from "@/lib/auth/server";
import { hasRequiredRole, type AccountRole } from "@/lib/auth/roles";
import { fail } from "./respond";

export interface ApiGuardResult {
  auth: ServerAuth;
}

/**
 * Garde serveur des API privées. Retourne une Response 401/403 en cas d'échec.
 * En mode démo, la session signée est vérifiée exactement comme en production.
 */
export async function requireApiAuth(role?: AccountRole): Promise<ApiGuardResult | Response> {
  const auth = await getServerAuth();
  if (!auth) return fail("SESSION_EXPIRED", 401);
  if (!auth.verified) return fail("ACCOUNT_NOT_VERIFIED", 403);
  if (role && !hasRequiredRole(auth.role, role)) return fail("FORBIDDEN", 403);
  return { auth };
}

/** Protège les tâches planifiées et les webhooks avec un secret serveur. */
export function requireApiSecret(request: Request, envName: string): Response | null {
  const expected = process.env[envName]?.trim();
  if (!expected || expected === "demo-webhook-secret" || expected === "changez-moi") {
    return fail("SECRET_NOT_CONFIGURED", 503);
  }
  const provided =
    request.headers.get("x-cron-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  if (provided !== expected) return fail("FORBIDDEN", 403);
  return null;
}
