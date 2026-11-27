import type { ReactNode } from "react";
import { requireServerRole } from "@/lib/auth/server";

export const instant = false;

export default async function CreateEventLayout({ children }: { children: ReactNode }) {
  await requireServerRole("organizer", "/evenements/nouveau");
  return <>{children}</>;
}
