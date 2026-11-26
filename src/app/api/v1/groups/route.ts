import { fail, json, readJson } from "@/lib/api/respond";
import { createGroup } from "@/lib/domain/groups";

interface Body {
  eventId?: string;
  eventTitle?: string;
  initiatorName?: string;
  countryCode?: string;
  currency?: string;
  validationMode?: "all_or_nothing" | "paid_seats";
  unitAmountMinor?: number;
  quantity?: number;
  capacity?: number;
  holdHours?: number;
}

export async function POST(request: Request) {
  const body = await readJson<Body>(request);
  if (
    !body ||
    !body.eventId ||
    !body.initiatorName ||
    !body.countryCode ||
    !body.currency ||
    typeof body.unitAmountMinor !== "number" ||
    typeof body.quantity !== "number" ||
    typeof body.capacity !== "number"
  ) {
    return fail("MISSING_REQUIRED_FIELDS");
  }

  const result = createGroup({
    eventId: body.eventId,
    eventTitle: body.eventTitle ?? "",
    initiatorName: body.initiatorName,
    countryCode: body.countryCode,
    currency: body.currency,
    validationMode: body.validationMode,
    unitAmountMinor: body.unitAmountMinor,
    quantity: body.quantity,
    capacity: body.capacity,
    holdHours: body.holdHours,
  });
  if (!result.ok) return fail(result.error, 409);
  return json({ ok: true, group: result.group, shares: result.shares }, 201);
}
