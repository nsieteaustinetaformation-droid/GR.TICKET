"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080412] text-white">
        Chargement…
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
