import { fail, json, readJson } from "@/lib/api/respond";
import { reserveSeats } from "@/lib/domain/reservations";

interface Body {
  quantity?: number;
  capacity?: number;
  holdHours?: number;
  groupId?: string;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJson<Body>(request);
  if (!body || typeof body.quantity !== "number" || typeof body.capacity !== "number") {
    return fail("QUANTITY_AND_CAPACITY_REQUIRED");
  }

  const result = reserveSeats({
    eventId: id,
    quantity: body.quantity,
    capacity: body.capacity,
    holdHours: body.holdHours,
    groupId: body.groupId,
  });
  if (!result.ok) return fail(result.error, 409);
  return json({ ok: true, reservation: result.reservation }, 201);
}
