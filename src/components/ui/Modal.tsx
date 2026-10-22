"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fermeture par touche Echap & gestion du scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Arrière-plan flou sombre */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Conteneur de la modale */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-app)] text-[var(--text-primary)] shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150",
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Accent doré supérieur */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold-primary)] to-[var(--gold-hover)]" />

        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-app)]">
            <div>
              <h3 id="modal-title" className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {description}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              type="button"
              aria-label="Fermer la boîte de dialogue"
              className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] min-touch-target flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corps de la modale */}
          <div className="py-5 text-sm">{children}</div>

          {/* Pied de page optionnel */}
          {footer && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-app)]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
