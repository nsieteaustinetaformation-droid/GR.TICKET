"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { FieldError } from "@/components/system/FieldError";
import { ImageUploader, ImageGalleryUploader } from "@/components/ui/ImageUploader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { loadDraft, saveDraft, type EventDraft } from "@/lib/draft";
import { getCountryConfig, listCountryConfigs } from "@/lib/international/config";
import "@/lib/international/seed";
import { validateEventStep, EVENT_STEP_FIELDS } from "@/lib/validation/event";
import { useStepGuard } from "@/lib/validation/useStepGuard";
import type { EventCategory } from "@/lib/types";

const CATEGORIES: EventCategory[] = ["Concert", "Festival", "VIP Pass", "Sport", "Spectacle"];

function timeZones(): string[] {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone");
    if (supported?.length) return supported;
  } catch {
    // navigateur ancien : liste réduite ci-dessous
  }
  return ["UTC", "Europe/Paris", "Europe/London", "America/New_York", "Africa/Lagos", "Africa/Nairobi"];
}

function InfosWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [zones, setZones] = useState<string[]>([]);

  useEffect(() => {
    setDraft(loadDraft());
    setZones(timeZones());
  }, []);

  useStepGuard(1, draft !== null);

  const validation = useMemo(() => validateEventStep(1, draft ?? {}), [draft]);
  const errors = showErrors ? validation.errors : {};

  if (!draft) return <main className="min-h-screen bg-[var(--grtk-bg)]" />;

  const update = (patch: Partial<EventDraft>) => {
    setDraft({ ...draft, ...patch });
    saveDraft(patch);
  };

  const errorFor = (field: string) => errors[field];

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!validation.valid) {
      const field =
        validation.firstField ?? EVENT_STEP_FIELDS[1].find((name) => validation.errors[name]);
      const node = field ? document.getElementById(`field-${field}`) : null;
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      node?.focus?.({ preventScroll: true });
      return;
    }
    router.push("/evenements/nouveau/billets");
  };

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="link-underline inline-flex items-center gap-2 text-xs text-[var(--grtk-text-3)] hover:text-violet-700">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Tableau de bord
          </Link>
          <ThemeToggle compact />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">Créer un événement</h1>
        <p className="mt-1 text-sm text-[var(--grtk-text-3)]">Étape 1 sur 4 — les informations de votre événement. Le brouillon est enregistré automatiquement.</p>
        <div className="mt-8"><WizardSteps current={1} /></div>

        <form onSubmit={next} noValidate className="space-y-5 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm sm:p-8">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Nom de l&apos;événement *</span>
            <input
              id="field-title"
              className="field"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Ex : Festival International 2027"
            />
            <FieldError message={errorFor("title")} />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Catégorie *</span>
              <select id="field-category" className="field" value={draft.category} onChange={(e) => update({ category: e.target.value as EventCategory })}>
                <option value="">Choisir…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <FieldError message={errorFor("category")} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Pays *</span>
              <select
                id="field-countryCode"
                className="field"
                value={draft.countryCode}
                onChange={(e) => {
                  const config = getCountryConfig(e.target.value);
                  update({
                    countryCode: config.countryCode,
                    currency: config.currency,
                    timeZone: config.timeZone,
                    payoutMethod: config.paymentMethods[0] ?? "card",
                  });
                }}
              >
                <option value="">Choisir…</option>
                {listCountryConfigs().map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>{c.countryCode} — {c.currency}</option>
                ))}
              </select>
              <FieldError message={errorFor("countryCode")} />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Ville *</span>
              <input id="field-city" className="field" value={draft.city} onChange={(e) => update({ city: e.target.value })} placeholder="Ex : Paris" />
              <FieldError message={errorFor("city")} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Fuseau horaire IANA *</span>
              <select id="field-timeZone" className="field" value={draft.timeZone} onChange={(e) => update({ timeZone: e.target.value })}>
                <option value="">Choisir…</option>
                {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
              </select>
              <FieldError message={errorFor("timeZone")} />
            </label>
          </div>

          <p className="flex items-center gap-2 rounded-xl border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] px-4 py-3 text-xs text-[var(--grtk-text-2)]">
            <Info className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
            Devise : {draft.currency || "—"} · Fuseau : {draft.timeZone || "—"}. Les horaires sont affichés dans le fuseau choisi, pas dans celui du visiteur.
          </p>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Description *</span>
            <textarea id="field-description" className="field min-h-24" value={draft.description} onChange={(e) => update({ description: e.target.value })} placeholder="Présentez votre événement…" />
            <FieldError message={errorFor("description")} />
          </label>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Date *</span>
              <input id="field-date" type="date" className="field" value={draft.date} onChange={(e) => update({ date: e.target.value })} />
              <FieldError message={errorFor("date")} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Ouverture des portes</span>
              <input className="field" type="time" value={draft.doorsOpenTime} onChange={(e) => update({ doorsOpenTime: e.target.value })} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Début *</span>
              <input id="field-startTime" type="time" className="field" value={draft.startTime} onChange={(e) => update({ startTime: e.target.value })} />
              <FieldError message={errorFor("startTime")} />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Lieu *</span>
              <input id="field-venue" className="field" value={draft.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="Ex : Palais des Congrès" />
              <FieldError message={errorFor("venue")} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Adresse</span>
              <input className="field" value={draft.address} onChange={(e) => update({ address: e.target.value })} placeholder="Ex : Avenue de la Paix" />
            </label>
          </div>

          <Reveal>
            <div className="space-y-4 rounded-xl border border-[var(--grtk-border)] p-5">
              <div id="field-imageUrl">
                <ImageUploader
                  value={draft.imageUrl || null}
                  onChange={(url) => { update({ imageUrl: url ?? "" }); setShowErrors(true); }}
                  shape="cover"
                  label="Couverture de l'événement *"
                  hint="16:9 recommandé · JPG, PNG, WebP, HEIC · 5 Mo max · glissez, collez ou prenez une photo"
                />
                <FieldError message={errorFor("imageUrl")} />
              </div>
              <ImageGalleryUploader
                values={draft.gallery ?? []}
                onChange={(urls) => update({ gallery: urls })}
                max={8}
                label="Galerie photos (facultatif)"
              />
            </div>
          </Reveal>

          <MagneticButton
            type="submit"
            aria-disabled={!validation.valid}
            className={`btn-neon-purple flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider ${validation.valid ? "" : "opacity-60"}`}
          >
            Continuer vers les billets <ArrowRight className="h-4 w-4" aria-hidden />
          </MagneticButton>
        </form>
      </div>
    </main>
  );
}

export default function InfosPage() {
  return <RequireAuth><InfosWizard /></RequireAuth>;
}
