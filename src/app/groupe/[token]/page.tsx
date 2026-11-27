"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Check, Clock, Copy, MessageCircle, Share2, ShieldCheck, Users,
} from "lucide-react";
import { FieldError } from "@/components/system/FieldError";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { TrustPanel } from "@/components/trust/TrustPanel";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/motion/Skeleton";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { paymentMethodLabel, translate, type Locale } from "@/lib/international/messages";
import { formatMoney } from "@/lib/international/money";
import type { GroupPayment, GroupShare } from "@/lib/types";

interface GroupData {
  group: GroupPayment;
  shares: GroupShare[];
  held: number;
}

function idempotencyFor(shareId: string): string {
  const key = `grtk-idem-${shareId}`;
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
}

function GroupView() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<GroupData | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/v1/groups/${token}`);
    if (res.ok) setData((await res.json()) as GroupData);
  }, [token]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (!data) {
    return (
      <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </main>
    );
  }

  const { group, shares } = data;
  const config = getCountryConfig(group.countryCode);
  const locale: Locale = config.locale;
  const paymentMethods = config.paymentMethods.length > 0 ? config.paymentMethods : ["card"];
  const defaultMethod = paymentMethods[0];
  const paid = shares.filter((s) => s.status === "paid").length;
  const progress = shares.length ? Math.round((paid / shares.length) * 100) : 0;
  const link = typeof window !== "undefined" ? window.location.href : "";
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(translate(locale, "split.invite", { name: group.initiatorName, link }))}`;

  async function pay(share: GroupShare) {
    const name = (names[share.id] ?? "").trim();
    if (name.length < 2) {
      setErrors((current) => ({ ...current, [share.id]: "Indiquez le nom du titulaire avant de payer." }));
      document.getElementById(`field-name-${share.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById(`field-name-${share.id}`)?.focus({ preventScroll: true });
      return;
    }
    setBusy(share.id);
    setErrors((current) => ({ ...current, [share.id]: "" }));
    setFlash(null);
    try {
      const res = await fetch(`/api/v1/groups/${token}/shares/${share.id}/pay`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          holderName: name,
          methodCode: methods[share.id] ?? defaultMethod,
          idempotencyKey: idempotencyFor(share.id),
        }),
      });
      const result = (await res.json()) as { ok: boolean; error?: string; ticket?: { id: string } };
      if (!res.ok || !result.ok) {
        setFlash({ kind: "error", message: result.error ?? "Paiement refusé. Aucun montant débité." });
        return;
      }
      setFlash({ kind: "success", message: "Votre part est payée. Billet généré." });
      await load();
      if (result.ticket) window.location.href = `/billet/${result.ticket.id}`;
    } catch {
      setFlash({ kind: "error", message: "Erreur réseau. Votre clé d'idempotence évite un double débit : réessayez." });
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="link-underline text-xs text-[var(--grtk-text-3)] hover:text-violet-700">← Tableau de bord</Link>
          <ThemeToggle compact />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white"><Users className="h-5 w-5" aria-hidden /></span>
          <div>
            <GuaranteeBadge locale={locale} compact withTooltip />
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight">Paiement de groupe</h1>
          </div>
        </div>
        <p className="text-sm text-[var(--grtk-text-2)]">
          Organisé par {group.initiatorName} · {shares.length} places · réservation jusqu&apos;au {new Date(group.expiresAt).toLocaleString()}
        </p>

        {flash && <StatusFlash kind={flash.kind} message={flash.message} onDone={() => setFlash(null)} />}

        <Reveal>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">{translate(locale, "split.tracking")}</p>
              <span className="font-mono text-sm font-bold text-violet-700">{paid}/{shares.length}</span>
            </div>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--grtk-surface-2)]">
              <div className="h-full rounded-full bg-violet-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--grtk-text-3)]">
              Règle : {group.validationMode === "all_or_nothing" ? "tout le monde paie, ou personne n'est débité" : "seules les places payées sont confirmées"}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => void copyLink()} className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg border border-[var(--grtk-border)] px-3 py-2 text-[10px] font-bold uppercase hover:border-violet-600">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? "Lien copié" : "Copier le lien"}
              </button>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase text-white hover:bg-emerald-700"><MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp</a>
              <a href={`sms:?body=${encodeURIComponent(translate(locale, "split.sms", { link }))}`} className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg border border-[var(--grtk-border)] px-3 py-2 text-[10px] font-bold uppercase hover:border-violet-600"><Share2 className="h-3.5 w-3.5" aria-hidden /> SMS</a>
            </div>
          </section>
        </Reveal>

        <div className="space-y-3">
          {shares.map((share, index) => (
            <Reveal key={share.id} delay={index * 50}>
              <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold">Place {index + 1}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${share.status === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {share.status === "paid" ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Clock className="h-3.5 w-3.5" aria-hidden />}
                    {share.status === "paid" ? translate(locale, "split.paid") : translate(locale, "split.waiting")}
                  </span>
                </div>
                <p className="mt-1 font-mono text-lg font-bold">{formatMoney(share.amountMinor, group.currency, locale)}</p>
                {share.status === "pending" && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <input
                        id={`field-name-${share.id}`}
                        value={names[share.id] ?? ""}
                        onChange={(e) => setNames({ ...names, [share.id]: e.target.value })}
                        placeholder="Nom du titulaire"
                        aria-label={`Nom du titulaire pour la place ${index + 1}`}
                        className="field"
                      />
                      <FieldError message={errors[share.id]} />
                    </div>
                    <select
                      value={methods[share.id] ?? defaultMethod}
                      onChange={(e) => setMethods({ ...methods, [share.id]: e.target.value })}
                      aria-label={`Moyen de paiement pour la place ${index + 1}`}
                      className="field"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>{paymentMethodLabel(locale, method)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => void pay(share)}
                      disabled={busy === share.id}
                      className="btn-neon-purple min-touch-target sm:col-span-2 disabled:opacity-50"
                    >
                      {busy === share.id ? "Paiement en cours…" : "Payer ma part"}
                    </button>
                  </div>
                )}
                {share.ticketId && (
                  <Link href={`/billet/${share.ticketId}`} className="link-underline mt-3 inline-block text-[11px] font-bold uppercase text-emerald-700">Voir mon billet →</Link>
                )}
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <TrustPanel
            countryCode={group.countryCode}
            paymentMethods={paymentMethods}
            locale={locale}
          >
            <p className="flex items-start gap-2 text-xs text-[var(--grtk-text-2)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              Chaque place est payée séparément avec une clé anti-double-paiement. Si le groupe n&apos;est pas complet à expiration, les places sont libérées et aucun participant n&apos;est débité.
            </p>
          </TrustPanel>
        </Reveal>
      </div>
    </main>
  );
}

export default function GroupPage() {
  return <Suspense fallback={<main className="min-h-screen bg-white" />}><GroupView /></Suspense>;
}
