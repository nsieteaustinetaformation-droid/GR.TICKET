"use client";

import { useEffect, useState } from "react";
import type { JSX } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface CountUpProps {
  value: number;
  /** Durée en secondes (défaut : 0.4). */
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

const defaultFormatter = (value: number): string => Math.round(value).toLocaleString("fr-FR");

/** Compteur animé via une MotionValue, sans mouvement si l'utilisateur l'a désactivé. */
export function CountUp({ value, duration = 0.4, className, formatter = defaultFormatter }: CountUpProps): JSX.Element {
  const reduced = useReducedMotion();
  const count = useMotionValue(reduced ? value : 0);
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      count.set(value);
      setDisplay(value);
      return;
    }

    const unsubscribe = count.on("change", (latest: number) => setDisplay(latest));
    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, value, duration, reduced]);

  return <span className={cn("font-tabular", className)}>{formatter(display)}</span>;
}
