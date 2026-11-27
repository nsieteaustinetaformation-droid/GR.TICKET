"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Filet de sécurité côté navigateur. Les layouts serveur et le proxy font la
 * vraie vérification : ici on garde simplement l'utilisateur connecté en UI.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/connexion?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--grtk-bg)] text-sm text-[var(--grtk-text-2)]">
        Chargement…
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
