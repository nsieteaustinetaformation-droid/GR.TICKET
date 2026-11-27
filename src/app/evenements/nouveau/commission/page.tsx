"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { loadDraft, saveDraft, type EventDraft } from "@/lib/draft";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { formatMoney, toMinor } from "@/lib/international/money";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";

const field =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

function CommissionWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { setDraft(loadDraft()); }, []);

  if (!draft) return <main className="min-h-screen bg-white" />;

  const config = getCountryConfig(draft.countryCode);
  const currency = draft.currency || config.currency;
  const money = (amountMinor: number) => formatMoney(amountMinor, currency, config.locale);
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
    if (!draft.payoutPhone.trim() || !draft.accepted) {
      setError("Renseignez le numéro de réception et acceptez les conditions.");
      return;
    }
    router.push("/evenements/nouveau/apercu");
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/evenements/nouveau/billets" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Étape précédente
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-6">Commission & paiement</h1>
        <p className="text-sm text-slate-500 mt-1">Étape 3 sur 4 — la plateforme prélève {DEFAULT_COMMISSION_PERCENT} % sur chaque vente.</p>
        <div className="mt-8"><WizardSteps current={3} /></div>

        <form onSubmit={next} className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 sm:p-8">
            <div className="flex items-center gap-2 text-violet-700">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Répartition des revenus</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] uppercase text-slate-500">Ventes potentielles</p>
                <p className="text-lg font-black mt-1 text-slate-900">{money(gross)}</p>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-[11px] uppercase text-red-600">Commission GRTK ({DEFAULT_COMMISSION_PERCENT} %)</p>
                <p className="text-lg font-black mt-1 text-red-600">− {money(commission)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-[11px] uppercase text-emerald-700">Vous recevez ({100 - DEFAULT_COMMISSION_PERCENT} %)</p>
                <p className="text-lg font-black mt-1 text-emerald-700">{money(net)}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              La commission est calculée sur chaque billet vendu. Le montant net vous est reversé sur le numéro ci-dessous.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Où recevoir votre argent ?</h2>
            <div className="grid grid-cols-2 gap-3">
              {payoutMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => update({ payoutMethod: method })}
                  className={`rounded-xl border p-4 text-xs font-bold uppercase tracking-wider transition ${
                    draft.payoutMethod === method
                      ? "border-violet-600 bg-violet-50 text-violet-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {method.toUpperCase()}
                </button>
              ))}
            </div>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Coordonnées de réception ({config.countryCode || "international"})</span>
              <input className={field} value={draft.payoutPhone} onChange={(e) => update({ payoutPhone: e.target.value })} placeholder="Numéro ou identifiant selon le moyen de paiement" required />
            </label>
            <label className="flex items-start gap-3 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={draft.accepted} onChange={(e) => update({ accepted: e.target.checked })} className="mt-1 w-4 h-4 accent-violet-600" />
              <span>J&apos;accepte que la plateforme prélève {DEFAULT_COMMISSION_PERCENT} % sur chaque billet vendu et me reverse {100 - DEFAULT_COMMISSION_PERCENT} % des ventes.</span>
            </label>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-white hover:bg-violet-700">
            Continuer vers l&apos;aperçu <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}

export default function CommissionPage() {
  return <RequireAuth><CommissionWizard /></RequireAuth>;
}
