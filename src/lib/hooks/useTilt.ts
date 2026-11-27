"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

export interface TiltOptions {
  /** Inclinaison maximale en degrés (défaut : 6). */
  max?: number;
  /** Active la réactivité au pointeur (défaut : true). */
  reactive?: boolean;
  /** Écoute également l'orientation de l'appareil si le navigateur le permet. */
  gyro?: boolean;
  /** Désactive complètement le hook (défaut : false). */
  disabled?: boolean;
}

interface TiltValues {
  rx: number;
  ry: number;
  mx: number;
  my: number;
}

type OrientationCtor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Pilote les variables CSS d'une scène 3D :
 *  - --rx / --ry (degrés) sur l'élément `.grtk-3d` contenu dans la ref,
 *  - --mx / --my (pourcents) sur le `.grtk-stage` qui porte la ref.
 * Les mises à jour sont regroupées dans une frame d'animation (rAF).
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(
  options: TiltOptions = {}
): {
  ref: RefObject<T | null>;
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  onPointerLeave: () => void;
} {
  const { max = 6, reactive = true, gyro = false, disabled = false } = options;
  const active = reactive && !disabled;

  const ref = useRef<T | null>(null);
  const frame = useRef<number | null>(null);
  const pending = useRef<TiltValues | null>(null);
  const reduced = useRef(false);

  const reset = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    pending.current = null;

    const stage = ref.current;
    const target = stage?.querySelector<HTMLElement>(".grtk-3d") ?? stage;
    // Retour aux valeurs par défaut définies dans :root (--rx: 6deg, --ry: -9deg, …).
    target?.style.removeProperty("--rx");
    target?.style.removeProperty("--ry");
    stage?.style.removeProperty("--mx");
    stage?.style.removeProperty("--my");
  }, []);

  const schedule = useCallback((values: TiltValues) => {
    pending.current = values;
    if (frame.current !== null) return;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const next = pending.current;
      pending.current = null;
      if (!next) return;

      const stage = ref.current;
      if (!stage) return;
      const target = stage.querySelector<HTMLElement>(".grtk-3d") ?? stage;

      target.style.setProperty("--rx", `${next.rx.toFixed(2)}deg`);
      target.style.setProperty("--ry", `${next.ry.toFixed(2)}deg`);
      stage.style.setProperty("--mx", `${next.mx.toFixed(1)}%`);
      stage.style.setProperty("--my", `${next.my.toFixed(1)}%`);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduced.current = query.matches;
      if (query.matches) reset();
    };

    sync();
    query.addEventListener?.("change", sync);
    return () => {
      query.removeEventListener?.("change", sync);
      reset();
    };
  }, [reset]);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (!active || reduced.current) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const px = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
      const py = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);

      schedule({
        rx: clamp((0.5 - py) * 2 * max, -max, max),
        ry: clamp((px - 0.5) * 2 * max, -max, max),
        mx: px * 100,
        my: py * 100,
      });
    },
    [active, max, schedule]
  );

  const onPointerLeave = useCallback(() => {
    reset();
  }, [reset]);

  // Gyroscope : jamais d'exception si l'API, la permission ou le capteur manque.
  useEffect(() => {
    if (!active || !gyro || reduced.current || typeof window === "undefined") return;

    const ctor = globalThis.DeviceOrientationEvent as OrientationCtor | undefined;
    if (!ctor) return;

    let alive = true;

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (!alive || reduced.current) return;
      if (event.gamma === null || event.beta === null) return;

      const px = clamp(event.gamma / 30, -1, 1);
      const py = clamp((event.beta - 45) / 30, -1, 1);

      schedule({
        rx: clamp(-py * max, -max, max),
        ry: clamp(px * max, -max, max),
        mx: (px + 1) * 50,
        my: (1 - py) * 50,
      });
    };

    const attach = () => {
      if (alive && !reduced.current) {
        window.addEventListener("deviceorientation", onOrientation);
      }
    };

    try {
      if (typeof ctor.requestPermission === "function") {
        // iOS 13+ : la permission peut être refusée ou nécessiter un geste utilisateur.
        void ctor
          .requestPermission()
          .then((state) => {
            if (state === "granted") attach();
          })
          .catch(() => {
            /* capteur indisponible : mode pointeur uniquement */
          });
      } else {
        attach();
      }
    } catch {
      /* API indisponible : on ne fait rien */
    }

    return () => {
      alive = false;
      window.removeEventListener("deviceorientation", onOrientation);
    };
  }, [active, gyro, max, schedule]);

  return { ref, onPointerMove, onPointerLeave };
}
