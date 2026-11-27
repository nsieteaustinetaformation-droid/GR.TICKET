"use client";

import React from "react";
import { Sun } from "lucide-react";

/** L'application GRTK utilise un thème blanc unique sur toutes les pages. */
export function ThemeToggle() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
      <Sun className="h-4 w-4 text-violet-600" />
      Mode clair
    </span>
  );
}
