"use client";

import { useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useTilt } from "@/lib/hooks/useTilt";
import { cn } from "@/lib/utils";

type Angle = "left" | "flat" | "right";

interface Props {
  children: ReactNode;
  angle?: Angle;
  className?: string;
  /** Couleur de la tranche du billet, configurable par l'événement. */
  edgeColor?: string;
  /** Active la réactivité au pointeur / gyroscope (utile à désactiver pour l'impression). */
  reactive?: boolean;
  /** Affiche un verso retournable au clavier. */
  flippable?: boolean;
  back?: ReactNode;
}

/**
 * Mise en scène 3D réaliste : épaisseur du carton, reflets, ombre portée
 * et léger effet de perspective. Le contenu du billet reste intact.
 */
export function RealisticTicket3D({
  children,
  angle = "flat",
  className = "",
  edgeColor = "#7C3AED",
  reactive = true,
  flippable = false,
  back,
}: Props): JSX.Element {
  const [flipped, setFlipped] = useState(false);
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>({
    gyro: true,
    reactive,
  });

  const decor = (
    <>
      <div className="grtk-3d-edge" aria-hidden="true" />
      <div className="grtk-perforation" aria-hidden="true" />
      <div className="grtk-foil" aria-hidden="true" />
      <div className="grtk-sheen" aria-hidden="true" />
    </>
  );

  const ticketClassName = cn("grtk-3d", `grtk-3d--${angle}`);
  const ticketStyle = {
    "--grtk-edge": edgeColor,
    // La règle CSS du verso écrase la transform 3D : on recompose ici inclination + rotation.
    ...(flippable && flipped
      ? { transform: "rotateY(180deg) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(-1deg)" }
      : {}),
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={cn("grtk-stage", className)}
      onPointerMove={reactive ? onPointerMove : undefined}
      onPointerLeave={reactive ? onPointerLeave : undefined}
    >
      {flippable ? (
        <>
          <div className="grtk-flip" data-flipped={flipped ? "true" : "false"}>
            <div
              className={cn(ticketClassName, "grtk-flip-inner")}
              style={ticketStyle}
              data-reactive={reactive ? "true" : undefined}
            >
              <div className="grtk-flip-face">
                {children}
                {decor}
              </div>
              <div className="grtk-flip-face grtk-flip-back">{back}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((previous) => !previous)}
            aria-label="Retourner le billet"
            aria-pressed={flipped}
            title="Retourner le billet"
            className="btn-glass-outline magnetic-btn absolute right-3 top-3 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--grtk-text-2)]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Retourner le billet</span>
          </button>
          <div className="grtk-ground-shadow" aria-hidden="true" />
        </>
      ) : (
        <>
          <div className={ticketClassName} style={ticketStyle} data-reactive={reactive ? "true" : undefined}>
            {children}
            {decor}
          </div>
          <div className="grtk-ground-shadow" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
