"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { loadDraft, saveDraft, type EventDraft, type TicketTypeDraft } from "@/lib/draft";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { formatMoney, toMinor } from "@/lib/international/money";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";

const field =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

function BilletsWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { setDraft(loadDraft()); }, []);

  if (!draft) return <main className="min-h-screen bg-white" />;

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

  const config = getCountryConfig(draft.countryCode);
  const currency = draft.currency || config.currency;
  const money = (amountMinor: number) => formatMoney(amountMinor, currency, config.locale);
  const gross = draft.ticketTypes.reduce((sum, t) => sum + toMinor(t.price, currency) * t.quantity, 0);

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/evenements/nouveau/infos" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Étape précédente
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-6">Vos billets</h1>
        <p className="text-sm text-slate-500 mt-1">Étape 2 sur 4 — définissez les prix et les quantités.</p>
        <div className="mt-8"><WizardSteps current={2} /></div>

        <form onSubmit={next} className="space-y-5">
          {draft.ticketTypes.map((t, index) => (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-violet-700">Type de billet {index + 1}</h2>
                {draft.ticketTypes.length > 1 && (
                  <button type="button" onClick={() => removeTicket(t.id)} className="text-slate-400 hover:text-red-600" aria-label="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nom</span>
                  <input className={field} value={t.name} onChange={(e) => updateTicket(t.id, { name: e.target.value })} placeholder="Standard, VIP…" required />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Prix ({currency})</span>
                  <input type="number" min={1} className={field} value={t.price} onChange={(e) => updateTicket(t.id, { price: Number(e.target.value) })} required />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quantité</span>
                  <input type="number" min={1} className={field} value={t.quantity} onChange={(e) => updateTicket(t.id, { quantity: Number(e.target.value) })} required />
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                Revenu potentiel : {money(toMinor(t.price, currency) * t.quantity)} — vous recevrez {money(Math.round(toMinor(t.price, currency) * t.quantity * (100 - DEFAULT_COMMISSION_PERCENT) / 100))} après la commission de {DEFAULT_COMMISSION_PERCENT} %.
              </p>
            </div>
          ))}

          <button type="button" onClick={addTicket} className="w-full rounded-2xl border border-dashed border-slate-300 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 hover:border-violet-500 hover:text-violet-700 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Ajouter un type de billet
          </button>

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 flex items-center justify-between text-sm">
            <span className="text-slate-600">Chiffre d&apos;affaires potentiel</span>
            <span className="font-black text-lg text-slate-900">{money(gross)}</span>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-white hover:bg-violet-700">
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
