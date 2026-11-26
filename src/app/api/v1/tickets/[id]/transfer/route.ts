import { fail, json, readJson } from "@/lib/api/respond";
import { transferTicket } from "@/lib/domain/transfers";

interface Body {
  fromAccountId?: string;
  toAccountId?: string;
  toDeviceId?: string;
  toHolderName?: string;
  resalePriceMinor?: number;
  resaleCapPercent?: number;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJson<Body>(request);
  if (!body?.fromAccountId || !body.toAccountId || !body.toDeviceId || !body.toHolderName || typeof body.resalePriceMinor !== "number") {
    return fail("MISSING_REQUIRED_FIELDS");
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
