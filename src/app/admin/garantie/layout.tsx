import type { ReactNode } from "react";
import { requireServerRole } from "@/lib/auth/server";

export const instant = false;

export default async function AdminGarantieLayout({ children }: { children: ReactNode }) {
  await requireServerRole("admin", "/admin/garantie");
  return <>{children}</>;
}
