"use client";

import type { JSX } from "react";
import { motion, useReducedMotion } from "motion/react";

/** Transition douce à chaque navigation (Next fournit la clé du template). */
export default function Template({ children }: { children: React.ReactNode }): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
