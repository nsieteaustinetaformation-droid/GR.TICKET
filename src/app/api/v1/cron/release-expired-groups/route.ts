import { requireApiSecret } from "@/lib/api/guard";
import { json } from "@/lib/api/respond";
import { releaseExpiredGroups, processReminders } from "@/lib/domain/groups";
import { releaseExpiredReservations } from "@/lib/domain/reservations";

/** Tâche planifiée : protégée par CRON_SECRET (header `x-cron-secret` ou Bearer). */
export async function POST(request: Request) {
  const denied = requireApiSecret(request, "CRON_SECRET");
  if (denied) return denied;
  return run();
}

export async function GET(request: Request) {
  const denied = requireApiSecret(request, "CRON_SECRET");
  if (denied) return denied;
  return run();
}

async function run() {
  return json({
    ok: true,
    groupsExpired: await releaseExpiredGroups(),
    reservationsReleased: releaseExpiredReservations(),
    reminders: processReminders(),
  });
}
