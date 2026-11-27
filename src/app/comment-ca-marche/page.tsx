import type { Metadata } from "next";
import type { JSX } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ScanLine, ShieldCheck, Ticket as TicketIcon, Users, type LucideIcon } from "lucide-react";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { translate } from "@/lib/international/messages";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description: "Réservez, payez seul ou à plusieurs, recevez votre billet garanti et scannez-le à l'entrée.",
};

const SUPPORT_EMAIL = "support@gr-ticket.com";
const LOCALE = "fr";

const steps: ReadonlyArray<{ key: string; icon: LucideIcon }> = [
  { key: "how.step1", icon: TicketIcon },
  { key: "how.step2", icon: Users },
  { key: "how.step3", icon: ShieldCheck },
  { key: "how.step4", icon: ScanLine },
];

export default function HowItWorksPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[var(--grtk-text-3)] hover:text-[var(--grtk-violet-700)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {translate(LOCALE, "how.backHome")}
          </Link>
          <Link
            href="/garantie"
            className="link-underline text-[var(--grtk-violet-700)]"
          >
            {translate(LOCALE, "how.conditionsLink")}
          </Link>
        </nav>

        <header className="mt-8 rounded-[var(--radius-2xl)] border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 sm:p-9">
          <span className="inline-flex rounded-full border border-[var(--grtk-violet-100)] bg-[var(--grtk-violet-50)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--grtk-violet-700)]">
            GR Ticket
          </span>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            {translate(LOCALE, "how.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--grtk-text-2)] sm:text-base">
            {translate(LOCALE, "how.lead")}
          </p>
          <div className="mt-5">
            <GuaranteeBadge locale={LOCALE} />
          </div>
        </header>

        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.key}
                className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-[var(--shadow-1)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white"
                    style={{ backgroundColor: "var(--grtk-violet-600)" }}
                  >
                    {index + 1}
                  </span>
                  <Icon className="h-5 w-5 [color:var(--grtk-violet-600)]" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-heading text-lg font-bold text-[var(--grtk-text)]">
                  {translate(LOCALE, `${step.key}.title`)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--grtk-text-2)]">
                  {translate(LOCALE, `${step.key}.desc`)}
                </p>
              </li>
            );
          })}
        </ol>

        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-[var(--grtk-text-2)]">
            <Mail className="h-4 w-4 shrink-0 [color:var(--grtk-violet-600)]" aria-hidden="true" />
            {translate(LOCALE, "how.support", { email: SUPPORT_EMAIL })}
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="link-underline text-sm font-bold text-[var(--grtk-violet-700)]"
          >
            {SUPPORT_EMAIL}
          </a>
        </section>
      </div>
    </main>
  );
}
