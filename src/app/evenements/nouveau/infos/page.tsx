"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { loadDraft, saveDraft, type EventDraft } from "@/lib/draft";
import { getCountryConfig, listCountryConfigs } from "@/lib/international/config";
import "@/lib/international/seed";
import type { EventCategory } from "@/lib/types";

const CATEGORIES: EventCategory[] = ["Concert", "Festival", "VIP Pass", "Sport", "Spectacle"];
const IMAGES = [
  "/images/ticket_bg.jpg",
  "/images/concert_guitarist.jpg",
  "/images/artist_hero.jpg",
  "/images/festival_stadium.jpg",
];

const field =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
const label = "block space-y-1.5";

function InfosWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { setDraft(loadDraft()); }, []);

  if (!draft) return <main className="min-h-screen bg-white" />;

  const update = (patch: Partial<EventDraft>) => {
    setDraft({ ...draft, ...patch });
    saveDraft(patch);
  };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.category || !draft.description.trim() || !draft.date || !draft.startTime || !draft.venue.trim() || !draft.city || !draft.countryCode) {
      setError("Remplissez tous les champs obligatoires.");
      return;
    }
    router.push("/evenements/nouveau/billets");
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Tableau de bord
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-6">Créer un événement</h1>
        <p className="text-sm text-slate-500 mt-1">Étape 1 sur 4 — les informations de votre événement.</p>
        <div className="mt-8"><WizardSteps current={1} /></div>

        <form onSubmit={next} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <label className={label}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nom de l&apos;événement *</span>
            <input className={field} value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="Ex: Festival International 2027" required />
          </label>

          <div className="grid sm:grid-cols-2 gap-5">
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Catégorie *</span>
              <select className={field} value={draft.category} onChange={(e) => update({ category: e.target.value as EventCategory })} required>
                <option value="">Choisir…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pays *</span>
              <select
                className={field}
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
                required
              >
                <option value="">Choisir…</option>
                {listCountryConfigs().map((c) => (
                  <option key={c.countryCode} value={c.countryCode}>{c.countryCode} — {c.currency}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ville *</span>
              <input className={field} value={draft.city} onChange={(e) => update({ city: e.target.value })} placeholder="Ex: Paris" required />
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Devise / Fuseau</span>
              <input className={`${field} bg-slate-50 text-slate-500`} readOnly value={draft.countryCode ? `${draft.currency} · ${draft.timeZone}` : "Sélectionnez un pays"} />
            </label>
          </div>

          <label className={label}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</span>
            <textarea className={`${field} min-h-24`} value={draft.description} onChange={(e) => update({ description: e.target.value })} placeholder="Présentez votre événement…" required />
          </label>

          <div className="grid sm:grid-cols-3 gap-5">
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date *</span>
              <input type="date" className={field} value={draft.date} onChange={(e) => update({ date: e.target.value })} required />
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ouverture des portes</span>
              <input type="time" className={field} value={draft.doorsOpenTime} onChange={(e) => update({ doorsOpenTime: e.target.value })} />
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Début *</span>
              <input type="time" className={field} value={draft.startTime} onChange={(e) => update({ startTime: e.target.value })} required />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lieu *</span>
              <input className={field} value={draft.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="Ex: Palais des Congrès" required />
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Adresse</span>
              <input className={field} value={draft.address} onChange={(e) => update({ address: e.target.value })} placeholder="Ex: Avenue de la Paix" />
            </label>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Image de l&apos;événement</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {IMAGES.map((src) => (
                <button
                  type="button"
                  key={src}
                  onClick={() => update({ imageUrl: src })}
                  className={`rounded-xl overflow-hidden border-2 transition ${draft.imageUrl === src ? "border-violet-600 ring-2 ring-violet-100" : "border-slate-200 opacity-60 hover:opacity-100"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={src} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-white hover:bg-violet-700">
            Continuer vers les billets <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}

export default function InfosPage() {
  return <RequireAuth><InfosWizard /></RequireAuth>;
}
