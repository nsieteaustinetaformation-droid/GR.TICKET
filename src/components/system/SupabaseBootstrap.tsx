"use client";

import { useEffect } from "react";
import { loadAllFromSupabase } from "@/lib/supabase/load";

export function SupabaseBootstrap() {
  useEffect(() => {
    void loadAllFromSupabase();
  }, []);

  return null;
}
