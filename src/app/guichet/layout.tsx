import type { ReactNode } from "react";
import { requireServerRole } from "@/lib/auth/server";

export const instant = false;

export default async function GuichetLayout({ children }: { children: ReactNode }) {
  await requireServerRole("organizer", "/guichet");
  return <>{children}</>;
}
