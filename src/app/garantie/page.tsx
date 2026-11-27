import type { Metadata } from "next";
import type { JSX } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CircleCheck,
  Mail,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { translate } from "@/lib/international/messages";

export const metadata: Metadata = {
  title: "Garantie GR Ticket",
  description:
    "Conditions de la garantie GR Ticket : QR dynamique, anti-capture, double scan, réclamation et remboursement.",
};

const SUPPORT_EMAIL = "support@gr-ticket.com";
const LOCALE = "fr";

const conditions: ReadonlyArray<{
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
}> = [
  { titleKey: "guarantee.qrDynamic", descKey: "guarantee.qrDynamic.desc", icon: RefreshCw },
  { titleKey: "guarantee.antiCapture", descKey: "guarantee.antiCapture.desc", icon: ScanLine },
  { titleKey: "guarantee.doubleScan", descKey: "guarantee.doubleScan.desc", icon: QrCode },
  { titleKey: "guarantee.claimTitle", descKey: "guarantee.claim.desc", icon: CircleCheck },
  { titleKey: "guarantee.refundTitle", descKey: "guarantee.refund.desc", icon: ShieldCheck },
];

export default function GuaranteePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[var(--grtk-text-3)] hover:text-[var(--grtk-violet-700)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {translate(LOCALE, "guarantee.backHome")}
          </Link>
          <Link href="/comment-ca-marche" className="link-underline text-[var(--grtk-violet-700)]">
            {translate(LOCALE, "guarantee.howLink")}
          </Link>
        </nav>

        <header className="mt-8 rounded-[var(--radius-2xl)] border border-emerald-200 bg-emerald-50/60 p-6 sm:p-9">
          <span className="inline-flex rounded-full border border-[var(--grtk-violet-100)] bg-[var(--grtk-violet-50)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--grtk-violet-700)]">
            GR Ticket
          </span>
          <h1 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight sm:text-5xl">
            {translate(LOCALE, "guarantee.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--grtk-text-2)] sm:text-base">
            {translate(LOCALE, "guarantee.lead")}
          </p>
          <div className="mt-5">
            <GuaranteeBadge locale={LOCALE} withTooltip={false} />
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-[var(--grtk-text)]">
            {translate(LOCALE, "guarantee.promiseTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--grtk-text-2)]">
            {translate(LOCALE, "guarantee.promiseBody")}
          </p>
        </section>

        <section className="mt-6">
          <h2 className="font-heading text-xl font-bold text-[var(--grtk-text)]">
            {translate(LOCALE, "guarantee.conditionsTitle")}
          </h2>
          <ul className="mt-4 space-y-3">
            {conditions.map((condition) => {
              const Icon = condition.icon;
              return (
                <li
                  key={condition.titleKey}
                  className="flex gap-4 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 shadow-[var(--shadow-1)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--grtk-violet-100)] bg-[var(--grtk-violet-50)]">
                    <Icon className="h-5 w-5 [color:var(--grtk-violet-600)]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--grtk-text)]">
                      {translate(LOCALE, condition.titleKey)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--grtk-text-2)]">
                      {translate(LOCALE, condition.descKey)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-[var(--grtk-text-2)]">
            <Mail className="h-4 w-4 shrink-0 [color:var(--grtk-violet-600)]" aria-hidden="true" />
            {translate(LOCALE, "guarantee.support", { email: SUPPORT_EMAIL })}
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
