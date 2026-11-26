"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { restoreLocalEvents } from "@/lib/store/events";
import { supabase } from "@/lib/supabase/client";
import { loadAllFromSupabase } from "@/lib/supabase/load";

export function SupabaseBootstrap() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (supabase) void loadAllFromSupabase();
    else restoreLocalEvents();
  }, [user]);

  return null;
}
