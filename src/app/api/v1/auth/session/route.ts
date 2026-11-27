import { json } from "@/lib/api/respond";
import { getServerAuth } from "@/lib/auth/server";

/** Session serveur courante : source de vérité pour restaurer l'utilisateur. */
export async function GET() {
  const auth = await getServerAuth();
  if (!auth) return json({ ok: false }, 401);
  return json({
    ok: true,
    user: {
      id: auth.id,
      email: auth.email,
      fullName: auth.fullName,
      phone: auth.phone,
      avatarUrl: auth.avatarUrl,
      role: auth.role,
    },
  });
}
