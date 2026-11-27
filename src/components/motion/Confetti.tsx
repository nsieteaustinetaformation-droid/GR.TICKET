"use client";

import type { JSX } from "react";
import { motion, useReducedMotion } from "motion/react";

interface ConfettiProps {
  active: boolean;
  count?: number;
}

/** Accents discrets violet / clairs (tokens GRTK existants), 1,2 s, décoratifs. */
const CONFETTI_TOKENS = [
  "var(--grtk-violet-600)",
  "var(--grtk-violet-400)",
  "var(--grtk-violet-100)",
] as const;

export function Confetti({ active, count = 14 }: ConfettiProps): JSX.Element | null {
  const reduced = useReducedMotion();
  if (!active || reduced) return null;

  const pieces = Math.max(1, Math.min(Math.floor(count), 40));

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {Array.from({ length: pieces }, (_, index) => {
        const left = (index * 37 + 11) % 100;
        const drift = ((index * 29) % 60) - 30;
        const width = 5 + (index % 3) * 2;

        return (
          <motion.span
            key={index}
            className="absolute top-0 block rounded-[2px]"
            style={{
              left: `${left}%`,
              width,
              height: width * 1.8,
              backgroundColor: CONFETTI_TOKENS[index % CONFETTI_TOKENS.length],
            }}
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [0, 90, 180, 240],
              x: [0, drift / 2, drift, drift],
              rotate: [0, 180, 360, 540],
            }}
            transition={{
              duration: 1.2,
              delay: (index % 5) * 0.035,
              ease: "easeOut",
              times: [0, 0.35, 0.7, 1],
            }}
          />
        );
      })}
    </div>
  );
}
