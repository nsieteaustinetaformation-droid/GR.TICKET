import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE } from "@/lib/auth/constants";

/**
 * Next.js 16 : `proxy.ts` remplace `middleware.ts`.
 * Premier filtre, volontairement léger : présence d'une session (Supabase ou
 * démo signée). La vérification cryptographique complète est faite côté serveur
 * dans les layouts et les route handlers, jamais dans le navigateur.
 */
const PRIVATE_PATHS = [
  "/dashboard",
  "/admin",
  "/guichet",
  "/scanner",
  "/evenements/nouveau",
  "/profil",
];

function hasSupabaseSession(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token") && cookie.value.length > 0
  );
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPrivate = PRIVATE_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  if (!isPrivate) return NextResponse.next();

  const signedDemoSession = request.cookies.get(DEMO_COOKIE)?.value;
  if (hasSupabaseSession(request) || (signedDemoSession && signedDemoSession.length > 0)) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const login = new URL("/connexion", request.url);
  login.searchParams.set("next", `${path}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/guichet/:path*",
    "/scanner/:path*",
    "/evenements/nouveau/:path*",
    "/profil/:path*",
  ],
};
