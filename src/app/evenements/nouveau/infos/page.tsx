"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { loadDraft, saveDraft, type EventDraft } from "@/lib/draft";
import type { EventCategory } from "@/lib/types";

const CATEGORIES: EventCategory[] = ["Concert", "Festival", "VIP Pass", "Sport", "Spectacle"];
const CITIES = ["Brazzaville", "Pointe-Noire", "Dolisie", "Oyo"] as const;
const IMAGES = [
  "/images/ticket_bg.jpg",
  "/images/concert_guitarist.jpg",
  "/images/artist_hero.jpg",
  "/images/festival_stadium.jpg",
];

const field =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-400";
const label = "block space-y-1.5";

function InfosWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { setDraft(loadDraft()); }, []);

  if (!draft) return <main className="min-h-screen bg-[#080412]" />;

  const update = (patch: Partial<EventDraft>) => {
    setDraft({ ...draft, ...patch });
    saveDraft(patch);
  };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.category || !draft.description.trim() || !draft.date || !draft.startTime || !draft.venue.trim() || !draft.city) {
      setError("Remplissez tous les champs obligatoires.");
      return;
    }
    router.push("/evenements/nouveau/billets");
  };

  return (
    <main className="min-h-screen bg-[#080412] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Tableau de bord
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-6">Créer un événement</h1>
        <p className="text-sm text-white/50 mt-1">Étape 1 sur 4 — les informations de votre événement.</p>
        <div className="mt-8"><WizardSteps current={1} /></div>

        <form onSubmit={next} className="space-y-5 rounded-3xl border border-white/10 bg-[#0E0A1C] p-6 sm:p-8">
          <label className={label}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Nom de l&apos;événement *</span>
            <input className={field} value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="Ex: Godman Afro-Fusion Festival 2027" required />
          </label>

          <div className="grid sm:grid-cols-2 gap-5">
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Catégorie *</span>
              <select className={field} value={draft.category} onChange={(e) => update({ category: e.target.value as EventCategory })} required>
                <option value="">Choisir…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Ville *</span>
              <select className={field} value={draft.city} onChange={(e) => update({ city: e.target.value as EventDraft["city"] })} required>
                <option value="">Choisir…</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <label className={label}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Description *</span>
            <textarea className={`${field} min-h-24`} value={draft.description} onChange={(e) => update({ description: e.target.value })} placeholder="Présentez votre événement…" required />
          </label>

          <div className="grid sm:grid-cols-3 gap-5">
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Date *</span>
              <input type="date" className={field} value={draft.date} onChange={(e) => update({ date: e.target.value })} required />
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Ouverture des portes</span>
              <input type="time" className={field} value={draft.doorsOpenTime} onChange={(e) => update({ doorsOpenTime: e.target.value })} />
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Début *</span>
              <input type="time" className={field} value={draft.startTime} onChange={(e) => update({ startTime: e.target.value })} required />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Lieu *</span>
              <input className={field} value={draft.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="Ex: Palais des Congrès" required />
            </label>
            <label className={label}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Adresse</span>
              <input className={field} value={draft.address} onChange={(e) => update({ address: e.target.value })} placeholder="Ex: Avenue de la Paix" />
            </label>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Image de l&apos;événement</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {IMAGES.map((src) => (
                <button
                  type="button"
                  key={src}
                  onClick={() => update({ imageUrl: src })}
                  className={`rounded-xl overflow-hidden border-2 transition ${draft.imageUrl === src ? "border-purple-400" : "border-transparent opacity-60"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={src} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-purple-600 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-purple-500">
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
