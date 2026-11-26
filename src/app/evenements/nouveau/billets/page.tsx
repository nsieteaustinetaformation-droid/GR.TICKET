"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { loadDraft, saveDraft, type EventDraft, type TicketTypeDraft } from "@/lib/draft";
import { formatXAF } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-400";

function BilletsWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { setDraft(loadDraft()); }, []);

  if (!draft) return <main className="min-h-screen bg-[#080412]" />;

  const updateTicket = (id: string, patch: Partial<TicketTypeDraft>) => {
    const ticketTypes = draft.ticketTypes.map((t) => (t.id === id ? { ...t, ...patch } : t));
    setDraft({ ...draft, ticketTypes });
    saveDraft({ ticketTypes });
  };

  const addTicket = () => {
    const ticketTypes = [
      ...draft.ticketTypes,
      { id: crypto.randomUUID(), name: "", price: 10000, quantity: 100 },
    ];
    setDraft({ ...draft, ticketTypes });
    saveDraft({ ticketTypes });
  };

  const removeTicket = (id: string) => {
    if (draft.ticketTypes.length === 1) return;
    const ticketTypes = draft.ticketTypes.filter((t) => t.id !== id);
    setDraft({ ...draft, ticketTypes });
    saveDraft({ ticketTypes });
  };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = draft.ticketTypes.some((t) => !t.name.trim() || t.price <= 0 || t.quantity <= 0);
    if (invalid) {
      setError("Chaque type de billet doit avoir un nom, un prix et une quantité.");
      return;
    }
    router.push("/evenements/nouveau/commission");
  };

  const gross = draft.ticketTypes.reduce((sum, t) => sum + t.price * t.quantity, 0);

  return (
    <main className="min-h-screen bg-[#080412] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/evenements/nouveau/infos" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Étape précédente
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-6">Vos billets</h1>
        <p className="text-sm text-white/50 mt-1">Étape 2 sur 4 — définissez les prix et les quantités.</p>
        <div className="mt-8"><WizardSteps current={2} /></div>

        <form onSubmit={next} className="space-y-5">
          {draft.ticketTypes.map((t, index) => (
            <div key={t.id} className="rounded-3xl border border-white/10 bg-[#0E0A1C] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-purple-300">Type de billet {index + 1}</h2>
                {draft.ticketTypes.length > 1 && (
                  <button type="button" onClick={() => removeTicket(t.id)} className="text-white/40 hover:text-red-300" aria-label="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Nom</span>
                  <input className={field} value={t.name} onChange={(e) => updateTicket(t.id, { name: e.target.value })} placeholder="Standard, VIP…" required />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Prix (FCFA)</span>
                  <input type="number" min={1} className={field} value={t.price} onChange={(e) => updateTicket(t.id, { price: Number(e.target.value) })} required />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Quantité</span>
                  <input type="number" min={1} className={field} value={t.quantity} onChange={(e) => updateTicket(t.id, { quantity: Number(e.target.value) })} required />
                </label>
              </div>
              <p className="text-[11px] text-white/40">
                Revenu potentiel : {formatXAF(t.price * t.quantity)} — vous recevrez {formatXAF(Math.round(t.price * t.quantity * 0.9))} après la commission de 10 %.
              </p>
            </div>
          ))}

          <button type="button" onClick={addTicket} className="w-full rounded-2xl border border-dashed border-white/20 py-4 text-xs font-bold uppercase tracking-wider text-white/60 hover:border-purple-400 hover:text-white flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Ajouter un type de billet
          </button>

          <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 flex items-center justify-between text-sm">
            <span className="text-white/60">Chiffre d&apos;affaires potentiel</span>
            <span className="font-black text-lg">{formatXAF(gross)}</span>
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-purple-600 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-purple-500">
            Continuer vers la commission <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}

export default function BilletsPage() {
  return <RequireAuth><BilletsWizard /></RequireAuth>;
}
