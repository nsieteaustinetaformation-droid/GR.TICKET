"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { JSX } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  /** True une fois le thème stocké lu côté client (évite tout mismatch SSR). */
  mounted: boolean;
}

const STORAGE_KEY = "grtk-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

/**
 * Source de vérité du thème GRTK.
 * Le script synchrone injecté dans <head> par le layout applique le thème
 * avant le premier paint ; ce provider synchronise ensuite l'état React.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
  // Le serveur et le premier rendu client partent du design blanc par défaut,
  // exactement comme l'attribut data-theme="light" rendu par le layout.
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage indisponible (navigation privée, CSP…) : on garde light.
    }

    const initial: Theme = isTheme(stored) ? stored : "light";
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Le thème reste appliqué pour la session en cours.
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle, mounted }),
    [theme, setTheme, toggle, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans ThemeProvider");
  return ctx;
}
