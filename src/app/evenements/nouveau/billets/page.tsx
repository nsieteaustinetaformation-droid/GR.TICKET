"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { FieldError } from "@/components/system/FieldError";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { loadDraft, saveDraft, type EventDraft, type TicketTypeDraft } from "@/lib/draft";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { formatMoney, toMinor } from "@/lib/international/money";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { validateEventStep } from "@/lib/validation/event";
import { useStepGuard } from "@/lib/validation/useStepGuard";

function BilletsWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => { setDraft(loadDraft()); }, []);
  useStepGuard(2, draft !== null);

  const validation = useMemo(() => validateEventStep(2, draft ?? {}), [draft]);
  const errors = showErrors ? validation.errors : {};

  if (!draft) return <main className="min-h-screen bg-[var(--grtk-bg)]" />;

  const update = (patch: Partial<EventDraft>) => {
    setDraft({ ...draft, ...patch });
    saveDraft(patch);
  };
  const updateTicket = (id: string, patch: Partial<TicketTypeDraft>) => {
    const ticketTypes = draft.ticketTypes.map((t) => (t.id === id ? { ...t, ...patch } : t));
    update({ ticketTypes });
  };
  const addTicket = () => {
    update({
      ticketTypes: [...draft.ticketTypes, { id: crypto.randomUUID(), name: "", price: 0, quantity: 100 }],
    });
  };
  const removeTicket = (id: string) => {
    if (draft.ticketTypes.length === 1) return;
    update({ ticketTypes: draft.ticketTypes.filter((t) => t.id !== id) });
  };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!validation.valid) {
      const field = validation.firstField ?? "ticketTypes.0.name";
      document.getElementById(`field-${field}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById(`field-${field}`)?.focus?.({ preventScroll: true });
      return;
    }
    router.push("/evenements/nouveau/commission");
  };

  const config = getCountryConfig(draft.countryCode);
  const currency = draft.currency || config.currency;
  const money = (amountMinor: number) => formatMoney(amountMinor, currency, config.locale);
  const gross = draft.ticketTypes.reduce((sum, t) => sum + toMinor(t.price, currency) * t.quantity, 0);

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/evenements/nouveau/infos" className="link-underline inline-flex items-center gap-2 text-xs text-[var(--grtk-text-3)] hover:text-violet-700">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Étape précédente
          </Link>
          <ThemeToggle compact />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">Vos billets</h1>
        <p className="mt-1 text-sm text-[var(--grtk-text-3)]">Étape 2 sur 4 — prix, quantités et identité visuelle du billet.</p>
        <div className="mt-8"><WizardSteps current={2} /></div>

        <form onSubmit={next} noValidate className="space-y-5">
          {draft.ticketTypes.map((t, index) => (
            <Reveal key={t.id} delay={index * 40}>
              <section className="space-y-4 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700">Type de billet {index + 1}</h2>
                  {draft.ticketTypes.length > 1 && (
                    <button type="button" onClick={() => removeTicket(t.id)} className="magnetic-btn rounded-lg p-2 text-[var(--grtk-text-3)] hover:text-rose-600" aria-label={`Supprimer le type de billet ${index + 1}`}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Nom</span>
                    <input id={`field-ticketTypes.${index}.name`} className="field" value={t.name} onChange={(e) => updateTicket(t.id, { name: e.target.value })} placeholder="Standard, VIP…" />
                    <FieldError message={errors[`ticketTypes.${index}.name`]} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Prix ({currency})</span>
                    <input id={`field-ticketTypes.${index}.price`} type="number" min={0} step="0.01" className="field" value={t.price} onChange={(e) => updateTicket(t.id, { price: Number(e.target.value) })} />
                    <FieldError message={errors[`ticketTypes.${index}.price`]} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Quantité</span>
                    <input id={`field-ticketTypes.${index}.quantity`} type="number" min={1} step="1" className="field" value={t.quantity} onChange={(e) => updateTicket(t.id, { quantity: Number(e.target.value) })} />
                    <FieldError message={errors[`ticketTypes.${index}.quantity`]} />
                  </label>
                </div>
                <p className="text-[11px] text-[var(--grtk-text-3)]">
                  Revenu potentiel : {money(toMinor(t.price, currency) * t.quantity)} — vous recevrez {money(Math.round(toMinor(t.price, currency) * t.quantity * (100 - DEFAULT_COMMISSION_PERCENT) / 100))} après la commission de {DEFAULT_COMMISSION_PERCENT} %.
                </p>
              </section>
            </Reveal>
          ))}

          <FieldError message={errors.ticketTypes} />

          <button type="button" onClick={addTicket} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--grtk-border-strong)] py-4 text-xs font-bold uppercase tracking-wider text-[var(--grtk-text-2)] hover:border-violet-500 hover:text-violet-700">
            <Plus className="h-4 w-4" aria-hidden /> Ajouter un type de billet
          </button>

          <Reveal>
            <div className="grid gap-5 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 sm:grid-cols-2">
              <ImageUploader
                value={draft.ticketLogoUrl ?? null}
                onChange={(url) => update({ ticketLogoUrl: url ?? undefined })}
                shape="square"
                label="Logo sur le billet (facultatif)"
                compact
              />
              <ImageUploader
                value={draft.ticketBackgroundUrl ?? null}
                onChange={(url) => update({ ticketBackgroundUrl: url ?? undefined })}
                shape="ticket"
                label="Arrière-plan du billet (facultatif)"
                hint="Format billet · JPG, PNG, WebP, HEIC · 5 Mo max"
              />
            </div>
          </Reveal>

          <div className="flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm">
            <span className="text-[var(--grtk-text-2)]">Chiffre d&apos;affaires potentiel</span>
            <span className="font-heading text-lg font-black text-violet-700">{money(gross)}</span>
          </div>

          <MagneticButton
            type="submit"
            aria-disabled={!validation.valid}
            className={`btn-neon-purple flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider ${validation.valid ? "" : "opacity-60"}`}
          >
            Continuer vers la commission <ArrowRight className="h-4 w-4" aria-hidden />
          </MagneticButton>
        </form>
      </div>
    </main>
  );
}

export default function BilletsPage() {
  return <RequireAuth><BilletsWizard /></RequireAuth>;
}
