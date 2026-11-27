import { requireApiAuth } from "@/lib/api/guard";
import { fail, json } from "@/lib/api/respond";
import { getState } from "@/lib/server/state";

/**
 * Point d'intégration Wallet. Les credentials restent côté serveur.
 * Tant qu'ils ne sont pas fournis, la réponse indique explicitement ce qu'il
 * faut configurer, sans jamais prétendre qu'un pass a été généré.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  const kind = new URL(request.url).searchParams.get("kind");
  const ticket = getState().tickets.get(id);
  if (!ticket) return fail("TICKET_NOT_FOUND", 404);
  if (kind !== "apple" && kind !== "google") return fail("KIND_REQUIRED");

  const configured =
    kind === "google"
      ? Boolean(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON)
      : Boolean(process.env.APPLE_PASS_CERTIFICATE && process.env.APPLE_PASS_KEY && process.env.APPLE_PASS_TEAM_ID);

  if (!configured) {
    return fail("WALLET_CREDENTIALS_NOT_CONFIGURED", 501, {
      kind,
      required:
        kind === "google"
          ? ["GOOGLE_WALLET_ISSUER_ID", "GOOGLE_WALLET_SERVICE_ACCOUNT_JSON"]
          : ["APPLE_PASS_CERTIFICATE", "APPLE_PASS_KEY", "APPLE_PASS_TEAM_ID"],
    });
  }

  return json({
    ok: true,
    kind,
    ticketId: ticket.id,
    holder: ticket.holderName,
    event: ticket.eventTitle,
    payload: {
      passType: kind === "google" ? "EVENT_TICKET" : "pkpass",
      barcode: { type: "QR", value: `grtk://ticket/${ticket.id}` },
      relevantDate: ticket.createdAt,
    },
  });
}
