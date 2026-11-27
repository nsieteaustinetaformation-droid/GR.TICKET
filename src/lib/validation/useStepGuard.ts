"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadDraft } from "@/lib/draft";
import { validateEventStep, type EventStep } from "./event";

const HREFS = [
  "/evenements/nouveau/infos",
  "/evenements/nouveau/billets",
  "/evenements/nouveau/commission",
  "/evenements/nouveau/apercu",
] as const;

/**
 * Verrouille l'accès direct par URL : une étape ne s'ouvre que si toutes les
 * étapes précédentes sont valides dans le brouillon. La publication est en plus
 * revérifiée côté serveur par /api/v1/events (Zod), donc contourner l'UI ne
 * permet jamais de publier un événement incomplet.
 */
export function useStepGuard(step: EventStep, ready = true): void {
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const draft = loadDraft();
    for (const prior of [1, 2, 3] as EventStep[]) {
      if (prior >= step) break;
      if (!validateEventStep(prior, draft).valid) {
        router.replace(HREFS[prior - 1]);
        return;
      }
    }
  }, [step, ready, router]);
}
