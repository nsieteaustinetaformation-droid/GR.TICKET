"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { FieldError } from "@/components/system/FieldError";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { loadDraft, saveDraft, type EventDraft } from "@/lib/draft";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { formatMoney, toMinor } from "@/lib/international/money";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { paymentMethodLabel } from "@/lib/international/messages";
import { validateEventStep } from "@/lib/validation/event";
import { useStepGuard } from "@/lib/validation/useStepGuard";

function CommissionWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => { setDraft(loadDraft()); }, []);
  useStepGuard(3, draft !== null);

  const validation = useMemo(() => validateEventStep(3, draft ?? {}), [draft]);
  const errors = showErrors ? validation.errors : {};

  if (!draft) return <main className="min-h-screen bg-[var(--grtk-bg)]" />;

  const config = getCountryConfig(draft.countryCode);
  const currency = draft.currency || config.currency;
  const locale = config.locale;
  const money = (amountMinor: number) => formatMoney(amountMinor, currency, locale);
  const payoutMethods = config.paymentMethods.length > 0 ? config.paymentMethods : ["card"];
  const gross = draft.ticketTypes.reduce((sum, t) => sum + toMinor(t.price, currency) * t.quantity, 0);
  const commission = Math.round(gross * DEFAULT_COMMISSION_PERCENT / 100);
  const net = gross - commission;

  const update = (patch: Partial<EventDraft>) => {
    setDraft({ ...draft, ...patch });
    saveDraft(patch);
  };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!validation.valid) {
      const field = validation.firstField ?? "payoutMethod";
      document.getElementById(`field-${field}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById(`field-${field}`)?.focus?.({ preventScroll: true });
      return;
    }
    router.push("/evenements/nouveau/apercu");
  };

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/evenements/nouveau/billets" className="link-underline inline-flex items-center gap-2 text-xs text-[var(--grtk-text-3)] hover:text-violet-700">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Étape précédente
          </Link>
          <ThemeToggle compact />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">Commission &amp; paiement</h1>
        <p className="mt-1 text-sm text-[var(--grtk-text-3)]">Étape 3 sur 4 — la plateforme prélève {DEFAULT_COMMISSION_PERCENT} % sur chaque vente. Aucun montant n&apos;est demandé à la publication.</p>
        <div className="mt-8"><WizardSteps current={3} /></div>

        <form onSubmit={next} noValidate className="space-y-5">
          <Reveal>
            <section className="space-y-4 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-2 text-violet-700">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <h2 className="text-xs font-bold uppercase tracking-wider">Répartition des revenus</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] p-4">
                  <p className="text-[11px] uppercase text-[var(--grtk-text-3)]">Ventes potentielles</p>
                  <p className="mt-1 font-heading text-lg font-black">{money(gross)}</p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-[11px] uppercase text-rose-700">Commission GRTK ({DEFAULT_COMMISSION_PERCENT} %)</p>
                  <p className="mt-1 font-heading text-lg font-black text-rose-700">− {money(commission)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-[11px] uppercase text-emerald-700">Vous recevez ({100 - DEFAULT_COMMISSION_PERCENT} %)</p>
                  <p className="mt-1 font-heading text-lg font-black text-emerald-700">{money(net)}</p>
                </div>
              </div>
              <p className="text-[11px] text-[var(--grtk-text-3)]">
                La commission est calculée sur chaque billet vendu. Le montant net vous est reversé sur le moyen choisi ci-dessous.
              </p>
            </section>
          </Reveal>

          <Reveal delay={60}>
            <section className="space-y-4 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm sm:p-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">Où recevoir votre argent ?</h2>
              <div id="field-payoutMethod" className="grid grid-cols-2 gap-3">
                {payoutMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    id={draft.payoutMethod === method ? "field-payoutMethod" : undefined}
                    onClick={() => { update({ payoutMethod: method }); setShowErrors(true); }}
                    aria-pressed={draft.payoutMethod === method}
                    className={`min-touch-target rounded-xl border p-4 text-xs font-bold uppercase tracking-wider transition-colors ${draft.payoutMethod === method ? "border-violet-600 bg-violet-50 text-violet-700" : "border-[var(--grtk-border)] hover:border-violet-400"}`}
                  >
                    {paymentMethodLabel(locale, method)}
                  </button>
                ))}
              </div>
              <FieldError message={errors.payoutMethod} />

              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Coordonnées de réception ({config.countryCode || "international"})</span>
                <input
                  id="field-payoutPhone"
                  className="field"
                  value={draft.payoutPhone}
                  onChange={(e) => { update({ payoutPhone: e.target.value }); setShowErrors(true); }}
                  placeholder="Numéro ou identifiant selon le moyen de paiement"
                />
                <FieldError message={errors.payoutPhone} />
              </label>

              <label className="flex cursor-pointer items-start gap-3 text-xs text-[var(--grtk-text-2)]">
                <input
                  id="field-accepted"
                  type="checkbox"
                  checked={draft.accepted}
                  onChange={(e) => { update({ accepted: e.target.checked }); setShowErrors(true); }}
                  className="mt-0.5 h-4 w-4 accent-violet-600"
                />
                <span>J&apos;accepte que la plateforme prélève {DEFAULT_COMMISSION_PERCENT} % sur chaque billet vendu et me reverse {100 - DEFAULT_COMMISSION_PERCENT} % des ventes.</span>
              </label>
              <FieldError message={errors.accepted} />
            </section>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5">
              <ImageUploader
                value={draft.organizerLogoUrl ?? null}
                onChange={(url) => update({ organizerLogoUrl: url ?? undefined })}
                shape="square"
                label="Logo de l'organisateur (facultatif)"
                hint="Affiché sur la page événement et dans le récapitulatif de confiance"
                compact
              />
            </div>
          </Reveal>

          <MagneticButton
            type="submit"
            aria-disabled={!validation.valid}
            className={`btn-neon-purple flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider ${validation.valid ? "" : "opacity-60"}`}
          >
            Continuer vers l&apos;aperçu <ArrowRight className="h-4 w-4" aria-hidden />
          </MagneticButton>
        </form>
      </div>
    </main>
  );
}

export default function CommissionPage() {
  return <RequireAuth><CommissionWizard /></RequireAuth>;
}
