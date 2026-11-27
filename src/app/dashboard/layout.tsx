import type { ReactNode } from "react";
import { requireServerAuth } from "@/lib/auth/server";

/** La session est vérifiée côté serveur avant tout rendu du tableau de bord. */
export const instant = false;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireServerAuth("/dashboard");
  return <>{children}</>;
}
