"use client";

import Link from "next/link";

const STEPS = [
  { n: 1, label: "Infos", href: "/evenements/nouveau/infos" },
  { n: 2, label: "Billets", href: "/evenements/nouveau/billets" },
  { n: 3, label: "Commission", href: "/evenements/nouveau/commission" },
  { n: 4, label: "Aperçu", href: "/evenements/nouveau/apercu" },
];

export function WizardSteps({ current }: { current: number }) {
  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {STEPS.map((step) => {
        const done = step.n < current;
        const active = step.n === current;
        return (
          <Link
            key={step.n}
            href={step.href}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition ${
              active
                ? "border-violet-600 bg-violet-600 text-white"
                : done
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
              {done ? "✓" : step.n}
            </span>
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
