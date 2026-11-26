import { json } from "@/lib/api/respond";
import { releaseExpiredGroups, processReminders } from "@/lib/domain/groups";
import { releaseExpiredReservations } from "@/lib/domain/reservations";

export async function POST() {
  return GET();
}

export async function GET() {
  return json({
    ok: true,
    groupsExpired: await releaseExpiredGroups(),
    reservationsReleased: releaseExpiredReservations(),
    reminders: processReminders(),
  });
}
