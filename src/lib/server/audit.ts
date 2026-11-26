import { getState } from "./state";
import type { AuditEntry } from "@/lib/types";

export function recordAudit(
  action: string,
  actor: string,
  entityId: string,
  metadata: Record<string, unknown> = {}
): AuditEntry {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    action,
    actor,
    entityId,
    metadata,
    createdAt: new Date().toISOString(),
  };
  getState().audit.push(entry);
  return entry;
}

export function getAuditLog(entityId?: string): AuditEntry[] {
  const entries = getState().audit;
  return entityId ? entries.filter((entry) => entry.entityId === entityId) : [...entries];
}
