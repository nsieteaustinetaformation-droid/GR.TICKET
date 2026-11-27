import { requireApiAuth } from "@/lib/api/guard";
import { fail, json } from "@/lib/api/respond";
import { getState } from "@/lib/server/state";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  const ticket = getState().tickets.get(id);
  if (!ticket) return fail("TICKET_NOT_FOUND", 404);
  const audit = getState().audit.filter((entry) => entry.entityId === id).slice(-20).reverse();
  return json({ ok: true, ticket, audit });
}
