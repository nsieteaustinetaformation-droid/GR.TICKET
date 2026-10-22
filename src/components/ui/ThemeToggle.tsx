"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./Button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Vérifie le thème initial sur la balise html
    const currentTheme = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleTheme}
      aria-label={`Passer en mode ${theme === "dark" ? "clair" : "sombre"}`}
      leftIcon={theme === "dark" ? <Sun className="w-4 h-4 text-[var(--gold-primary)]" /> : <Moon className="w-4 h-4 text-[var(--gold-primary)]" />}
      className="text-xs"
    >
      <span>Mode {theme === "dark" ? "Clair" : "Sombre"}</span>
    </Button>
  );
}
