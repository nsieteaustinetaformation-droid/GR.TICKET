import { requireApiAuth } from "@/lib/api/guard";
import { fail, json } from "@/lib/api/respond";
import { buildDynamicQr } from "@/lib/domain/qr";
import { getState } from "@/lib/server/state";

/**
 * Le titulaire connecté demande un QR signé par la clé de son appareil.
 * Le token change à chaque fenêtre de 30 s et à chaque défi du scanner.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  const nonce = new URL(request.url).searchParams.get("nonce");
  if (!nonce) return fail("NONCE_REQUIRED");

  const ticket = getState().tickets.get(id);
  if (!ticket) return fail("TICKET_NOT_FOUND", 404);
  const challenge = getState().challenges.get(nonce);
  if (!challenge || challenge.ticketId !== id) return fail("CHALLENGE_NOT_FOUND", 404);

  return json({ ok: true, token: buildDynamicQr(ticket, nonce), expiresAt: challenge.expiresAt });
}
