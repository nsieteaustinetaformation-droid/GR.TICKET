import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function config(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  if (url.includes("votre-projet") || key.endsWith("...") || key.length < 40) return null;
  return { url, key };
}

export function isSupabaseServerConfigured(): boolean {
  return config() !== null;
}

/**
 * Client Supabase serveur : lit la session dans les cookies (et non dans le
 * localStorage), ce qui permet au proxy et aux layouts de la vérifier.
 */
export async function createServerSupabase() {
  const found = config();
  if (!found) return null;
  const cookieStore = await cookies();

  return createServerClient(found.url, found.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : le proxy rafraîchit le cookie.
        }
      },
    },
  });
}
