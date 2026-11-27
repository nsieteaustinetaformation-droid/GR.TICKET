"use client";

import type { JSX } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

/** Placeholder shimmeré, une ou plusieurs lignes. */
export function Skeleton({ className, lines = 1 }: SkeletonProps): JSX.Element {
  const count = Math.max(1, Math.floor(lines));

  if (count === 1) {
    return <div className={cn("skeleton h-4 w-full", className)} aria-hidden="true" />;
  }

  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton h-4 w-full" />
      ))}
    </div>
  );
}
