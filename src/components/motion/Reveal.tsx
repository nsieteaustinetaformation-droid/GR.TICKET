"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, JSX, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  /** Délai avant l'animation, en millisecondes. */
  delay?: number;
  className?: string;
  as?: ElementType;
}

/** Révèle son contenu une seule fois lorsqu'il entre dans le viewport. */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps): JSX.Element {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const style: CSSProperties = {
    opacity: visible ? undefined : 0,
    animationDelay: visible && !reduced && delay > 0 ? `${delay}ms` : undefined,
  };

  return createElement(
    as,
    {
      ref,
      className: cn(visible && !reduced && "animate-reveal", className),
      style,
    },
    children
  );
}
