import { cookies } from "next/headers";
import { fail, json, readJson } from "@/lib/api/respond";
import { DEMO_COOKIE, demoCookieOptions, signDemoSession } from "@/lib/auth/demo-session";
import { normalizeRole } from "@/lib/auth/roles";

interface Body {
  email?: string;
  fullName?: string;
  phone?: string;
  role?: string;
}

/**
 * Uniquement utilisé quand Supabase n'est pas branché : pose une session de
 * démo signée, vérifiable par le proxy et les layouts serveur.
 * Le rôle admin n'est jamais accepté depuis une requête publique.
 */
export async function POST(request: Request) {
  const body = await readJson<Body>(request);
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("EMAIL_REQUIRED");
  const fullName = body?.fullName?.trim() ?? "";
  if (fullName.length < 2) return fail("NAME_REQUIRED");

  const requested = normalizeRole(body?.role);
  const role = requested === "admin" ? "organizer" : requested;
  const store = await cookies();
  store.set(
    DEMO_COOKIE,
    signDemoSession({
      id: `demo-${email}`,
      email,
      fullName,
      phone: body?.phone?.trim() ?? "",
      role,
    }),
    demoCookieOptions
  );
  return json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.set(DEMO_COOKIE, "", { ...demoCookieOptions, maxAge: 0 });
  return json({ ok: true });
}
