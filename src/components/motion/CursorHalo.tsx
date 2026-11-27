"use client";

import { useEffect, useRef } from "react";
import type { JSX } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { MotionStyle } from "motion/react";
import { cn } from "@/lib/utils";

/** Halo radial qui suit le pointeur dans son parent (position: relative). */
export function CursorHalo({ className }: { className?: string }): JSX.Element | null {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const springX = useSpring(x, { stiffness: 180, damping: 24, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 180, damping: 24, mass: 0.5 });

  useEffect(() => {
    if (reduced) return;

    const parent = ref.current?.parentElement;
    if (!parent) return;

    const onMove = (event: PointerEvent) => {
      const bounds = parent.getBoundingClientRect();
      x.set(event.clientX - bounds.left);
      y.set(event.clientY - bounds.top);
    };
    const onLeave = () => {
      x.set(-999);
      y.set(-999);
    };

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y, reduced]);

  if (reduced) return null;

  const style = { x: springX, y: springY } as MotionStyle;

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute left-0 top-0 -ml-32 -mt-32 h-64 w-64 rounded-full opacity-[0.14] blur-2xl",
        className
      )}
      style={{
        ...style,
        background: "radial-gradient(circle, var(--grtk-violet-400) 0%, transparent 70%)",
      }}
    />
  );
}
