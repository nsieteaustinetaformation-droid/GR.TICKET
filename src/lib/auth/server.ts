import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { DEMO_COOKIE, verifyDemoSession } from "./demo-session";
import { hasRequiredRole, normalizeRole, type AccountRole } from "./roles";
import { createServerSupabase, isSupabaseServerConfigured } from "@/lib/supabase/server";

export interface ServerAuth {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: AccountRole;
  verified: boolean;
  isDemo: boolean;
}

/**
 * Source de vérité côté serveur. Aucune donnée d'un autre compte n'est
 * accessible depuis un layout ou une route API sans passer par cette fonction.
 */
export async function getServerAuth(): Promise<ServerAuth | null> {
  // La vérification d'expiration lit l'heure courante : rendu au moment de la
  // requête, jamais une valeur figée dans le HTML statique.
  await connection();
  if (isSupabaseServerConfigured()) {
    const client = await createServerSupabase();
    if (!client) return null;
    const { data } = await client.auth.getUser();
    const user = data.user;
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? "",
      fullName: String(user.user_metadata?.full_name ?? ""),
      phone: String(user.user_metadata?.phone ?? ""),
      avatarUrl: String(user.user_metadata?.avatar_url ?? ""),
      role: normalizeRole(user.app_metadata?.role ?? user.user_metadata?.role),
      verified: Boolean(user.email_confirmed_at || user.phone_confirmed_at),
      isDemo: false,
    };
  }

  const store = await cookies();
  const payload = verifyDemoSession(store.get(DEMO_COOKIE)?.value);
  if (!payload) return null;
  return {
    id: payload.id,
    email: payload.email,
    fullName: payload.fullName,
    phone: payload.phone,
    avatarUrl: "",
    role: payload.role,
    verified: true,
    isDemo: true,
  };
}

/** Redirection vers la connexion avec retour à la page demandée. */
export async function requireServerAuth(next?: string): Promise<ServerAuth> {
  const auth = await getServerAuth();
  if (!auth) redirect(next ? `/connexion?next=${encodeURIComponent(next)}` : "/connexion");
  if (!auth.verified) redirect(`/connexion?next=${encodeURIComponent(next ?? "/dashboard")}&verify=1`);
  return auth;
}

export async function requireServerRole(role: AccountRole, next?: string): Promise<ServerAuth> {
  const auth = await requireServerAuth(next);
  if (!hasRequiredRole(auth.role, role)) redirect("/dashboard");
  return auth;
}
