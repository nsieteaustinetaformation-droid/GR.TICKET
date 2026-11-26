import { json } from "@/lib/api/respond";
import { guaranteeStats } from "@/lib/domain/claims";
import { getAuditLog } from "@/lib/server/audit";
import { getState } from "@/lib/server/state";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";

export async function GET() {
  const state = getState();
  const firstClaim = [...state.claims.values()][0];
  const ticket = firstClaim ? state.tickets.get(firstClaim.ticketId) : undefined;
  const currency = ticket?.currency ?? getCountryConfig().currency;
  return json({
    ok: true,
    stats: { ...guaranteeStats(), currency },
    audit: getAuditLog().slice(-50).reverse(),
  });
}
