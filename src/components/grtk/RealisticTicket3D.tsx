"use client";

import type { ReactNode } from "react";

type Angle = "left" | "flat" | "right";

interface Props {
  children: ReactNode;
  angle?: Angle;
  className?: string;
  /** Couleur de la tranche du billet, configurable par l'événement. */
  edgeColor?: string;
}

/**
 * Mise en scène 3D réaliste : épaisseur du carton, reflets, ombre portée
 * et léger effet de perspective. Le contenu du billet reste intact.
 */
export function RealisticTicket3D({ children, angle = "flat", className = "", edgeColor = "#6D5CFF" }: Props) {
  return (
    <div className={`grtk-stage ${className}`}>
      <div
        className={`grtk-3d grtk-3d--${angle}`}
        style={{ "--grtk-edge": edgeColor } as React.CSSProperties}
      >
        <div className="grtk-3d-edge" aria-hidden />
        {children}
        <div className="grtk-perforation" aria-hidden />
        <div className="grtk-foil" aria-hidden />
        <div className="grtk-sheen" aria-hidden />
      </div>
      <div className="grtk-ground-shadow" aria-hidden />
    </div>
  );
}
