"use client";

import type { JSX } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { HTMLMotionProps, MotionStyle } from "motion/react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = HTMLMotionProps<"button">;

/** Bouton qui suit légèrement le curseur, avec retour élastique à la sortie. */
export function MagneticButton({
  children,
  className,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: MagneticButtonProps): JSX.Element {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 });

  const motionStyle = {
    ...style,
    ...(reduced ? {} : { x: springX, y: springY }),
  } as MotionStyle;

  return (
    <motion.button
      {...props}
      className={cn("magnetic-btn", className)}
      style={motionStyle}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (reduced) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - (bounds.left + bounds.width / 2)) * 0.12);
        y.set((event.clientY - (bounds.top + bounds.height / 2)) * 0.12);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.button>
  );
}
