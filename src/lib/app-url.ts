/**
 * URL publique canonique de l'application.
 * Elle sert à générer des liens qui restent valides quand on les copie
 * depuis un environnement de développement ou une preview Vercel.
 */
const FALLBACK_APP_URL = "https://gr-ticket-theta.vercel.app";

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) return FALLBACK_APP_URL;
  return configured.replace(/\/+$/, "") || FALLBACK_APP_URL;
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAppUrl()}${normalized}`;
}
