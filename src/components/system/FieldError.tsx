"use client";

import type { JSX } from "react";

export function FieldError({ message, id }: { message?: string; id?: string }): JSX.Element | null {
  if (!message) return null;
  return (
    <p
      key={message}
      id={id}
      role="alert"
      className="animate-shake mt-1.5 text-xs font-semibold text-[var(--grtk-error)]"
    >
      {message}
    </p>
  );
}
