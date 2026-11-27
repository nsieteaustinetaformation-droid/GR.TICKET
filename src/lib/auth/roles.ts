/**
 * Rôles applicatifs. Un compte public ne peut jamais se donner le rôle admin :
 * le rôle est lu côté serveur (metadonnées Supabase ou session signée en démo).
 */
export const ACCOUNT_ROLES = ["buyer", "organizer", "promoter", "admin"] as const;
export type AccountRole = (typeof ACCOUNT_ROLES)[number];

export const ROLE_LABELS: Record<AccountRole, string> = {
  buyer: "Acheteur",
  organizer: "Organisateur",
  promoter: "Promoteur / Affilié",
  admin: "Administrateur",
};

/** Anciens rôles internes conservés pour ne pas casser les comptes déjà créés. */
const LEGACY_ROLES: Record<string, AccountRole> = {
  customer: "buyer",
  manager: "organizer",
  seller: "promoter",
  scanner: "organizer",
};

export function normalizeRole(value: unknown): AccountRole {
  if (typeof value !== "string") return "buyer";
  const role = value.toLowerCase().trim();
  if ((ACCOUNT_ROLES as readonly string[]).includes(role)) return role as AccountRole;
  return LEGACY_ROLES[role] ?? "buyer";
}

const RANK: Record<AccountRole, number> = { buyer: 0, organizer: 1, promoter: 2, admin: 3 };

/** Un organisateur peut faire tout ce qu'un acheteur peut faire, etc. */
export function hasRequiredRole(current: AccountRole, required: AccountRole): boolean {
  return RANK[current] >= RANK[required];
}
