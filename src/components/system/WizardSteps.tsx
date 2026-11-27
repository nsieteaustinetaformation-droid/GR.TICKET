"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type JSX, type MouseEvent } from "react";
import { Check, Lock } from "lucide-react";
import { loadDraft } from "@/lib/draft";
import {
  EVENT_STEP_FIELDS,
  validateEventStep,
  type EventStep,
} from "@/lib/validation/event";

const STEPS: Array<{ n: EventStep; label: string; href: string }> = [
  { n: 1, label: "Infos", href: "/evenements/nouveau/infos" },
  { n: 2, label: "Billets", href: "/evenements/nouveau/billets" },
  { n: 3, label: "Commission", href: "/evenements/nouveau/commission" },
  { n: 4, label: "Aperçu", href: "/evenements/nouveau/apercu" },
];

const GATING_STEPS: EventStep[] = [1, 2, 3];

export interface WizardStepsProps {
  current: EventStep | number;
  completed?: number[];
  onNavigate?: (step: EventStep) => boolean | void;
}

export function WizardSteps({ current, completed, onNavigate }: WizardStepsProps): JSX.Element {
  const [draft, setDraft] = useState<unknown>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  }, []);

  const computedCompleted = useMemo(() => {
    if (draft === null) return [] as number[];
    return GATING_STEPS.filter((step) => validateEventStep(step, draft).valid);
  }, [draft]);

  const done = completed ?? computedCompleted;
  const doneSet = useMemo(() => new Set(done), [done]);
  const blockingStep = GATING_STEPS.find((step) => !doneSet.has(step)) ?? 4;
  const blockingValidation = useMemo(
    () => validateEventStep(blockingStep, draft ?? {}),
    [blockingStep, draft]
  );

  const doneCount = STEPS.filter((step) => doneSet.has(step.n)).length;
  const progress = Math.round((Math.min(doneCount, 4) / 4) * 100);

  function revealBlockingField(): void {
    const field =
      blockingValidation.firstField ?? EVENT_STEP_FIELDS[blockingStep][0] ?? null;
    const fieldElement = field ? document.getElementById(`field-${field}`) : null;
    const element: HTMLElement | null = fieldElement ?? containerRef.current;
    if (!element) return;

    element.scrollIntoView?.({ behavior: "smooth", block: "center" });
    element.classList.remove("animate-shake");
    // Force un reflow pour rejouer l'animation lors de clics répétés.
    void element.offsetWidth;
    element.classList.add("animate-shake");
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => element.classList.remove("animate-shake"), 400);
  }

  function handleClick(step: EventStep, locked: boolean, event: MouseEvent<HTMLElement>): void {
    if (locked) {
      // Un clic sur une étape verrouillée ne déclenche jamais de navigation.
      event.preventDefault();
      if (onNavigate) onNavigate(step);
      else revealBlockingField();
      return;
    }
    if (onNavigate && onNavigate(step) === false) {
      event.preventDefault();
      revealBlockingField();
    }
  }

  return (
    <nav
      ref={containerRef}
      aria-label="Étapes de création de l'événement"
      className="mb-8"
    >
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">
          Progression
        </span>
        <span className="text-[11px] font-semibold text-[var(--grtk-text-2)]">
          {doneCount}/4 étapes terminées
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Progression de la création"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--grtk-surface-2)]"
      >
        <div
          className="h-full rounded-full bg-[var(--grtk-violet-600)] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-4 flex flex-wrap gap-2">
        {STEPS.map((step) => {
          const active = step.n === current;
          const locked = step.n > blockingStep;
          const stepDone = doneSet.has(step.n) && !active;
          const baseClass =
            "inline-flex min-touch-target items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors duration-200";
          const stateClass = locked
            ? "cursor-not-allowed border-[var(--grtk-border)] bg-[var(--grtk-muted)] text-[var(--grtk-text-3)]"
            : active
              ? "border-[var(--grtk-violet-600)] bg-[var(--grtk-violet-600)] text-white"
              : stepDone
                ? "border-[var(--grtk-success)] bg-[var(--grtk-violet-50)] text-[var(--grtk-success)]"
                : "border-[var(--grtk-border)] bg-[var(--grtk-surface)] text-[var(--grtk-text-2)] hover:border-[var(--grtk-violet-600)] hover:text-[var(--grtk-violet-700)]";
          const content = (
            <>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
                {locked ? (
                  <Lock className="h-3 w-3" aria-hidden="true" />
                ) : stepDone ? (
                  <Check className="h-3 w-3" aria-hidden="true" />
                ) : (
                  step.n
                )}
              </span>
              {step.label}
            </>
          );

          return (
            <li key={step.n}>
              {locked ? (
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  aria-disabled="true"
                  tabIndex={-1}
                  className={`${baseClass} ${stateClass}`}
                  onClick={(event) => handleClick(step.n, true, event)}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={step.href}
                  aria-current={active ? "step" : undefined}
                  className={`${baseClass} ${stateClass}`}
                  onClick={(event) => handleClick(step.n, false, event)}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
