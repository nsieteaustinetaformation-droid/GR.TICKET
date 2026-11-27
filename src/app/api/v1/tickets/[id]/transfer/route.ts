import { requireApiAuth } from "@/lib/api/guard";
import { fail, json, readJson } from "@/lib/api/respond";
import { transferTicket } from "@/lib/domain/transfers";
import { getState } from "@/lib/server/state";

interface Body {
  fromAccountId?: string;
  toAccountId?: string;
  toDeviceId?: string;
  toHolderName?: string;
  resalePriceMinor?: number;
  resaleCapPercent?: number;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  const body = await readJson<Body>(request);
  if (!body?.fromAccountId || !body.toAccountId || !body.toDeviceId || !body.toHolderName || typeof body.resalePriceMinor !== "number") {
    return fail("MISSING_REQUIRED_FIELDS");
  }
  const ticket = getState().tickets.get(id);
  if (!ticket) return fail("TICKET_NOT_FOUND", 404);
  // Un compte réel ne peut transférer que ses propres billets.
  if (!ticket.holderAccountId.startsWith("account-") && ticket.holderAccountId !== guard.auth.id) {
    return fail("FORBIDDEN", 403);
  }
  const result = transferTicket({
    ticketId: id,
    fromAccountId: body.fromAccountId,
    toAccountId: body.toAccountId,
    toDeviceId: body.toDeviceId,
    toHolderName: body.toHolderName,
    resalePriceMinor: body.resalePriceMinor,
    resaleCapPercent: body.resaleCapPercent,
  });
  if (!result.ok) return fail(result.error, 409);
  return json({ ok: true, ticket: result.newTicket });
}
