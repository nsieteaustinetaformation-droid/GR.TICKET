"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { loadDraft, saveDraft, type EventDraft } from "@/lib/draft";
import { formatXAF } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

const field =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-400";

function CommissionWizard() {
  const router = useRouter();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { setDraft(loadDraft()); }, []);

  if (!draft) return <main className="min-h-screen bg-[#080412]" />;

  const gross = draft.ticketTypes.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const commission = Math.round(gross * 0.1);
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
    <main className="min-h-screen bg-[#080412] text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/evenements/nouveau/billets" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Étape précédente
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-6">Commission & paiement</h1>
        <p className="text-sm text-white/50 mt-1">Étape 3 sur 4 — la plateforme prélève 10 % sur chaque vente.</p>
        <div className="mt-8"><WizardSteps current={3} /></div>

        <form onSubmit={next} className="space-y-5">
          <div className="rounded-3xl border border-purple-400/20 bg-[#0E0A1C] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-purple-300">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Répartition des revenus</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-[11px] uppercase text-white/40">Ventes potentielles</p>
                <p className="text-lg font-black mt-1">{formatXAF(gross)}</p>
              </div>
              <div className="rounded-2xl bg-red-500/10 border border-red-400/20 p-4">
                <p className="text-[11px] uppercase text-red-200/70">Commission Godman (10 %)</p>
                <p className="text-lg font-black mt-1 text-red-300">− {formatXAF(commission)}</p>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/20 p-4">
                <p className="text-[11px] uppercase text-emerald-200/70">Vous recevez (90 %)</p>
                <p className="text-lg font-black mt-1 text-emerald-300">{formatXAF(net)}</p>
              </div>
            </div>
            <p className="text-[11px] text-white/40">
              La commission est calculée sur chaque billet vendu. Le montant net vous est reversé sur le numéro ci-dessous.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0E0A1C] p-6 sm:p-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Où recevoir votre argent ?</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["mtn", "airtel"] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => update({ payoutMethod: method })}
                  className={`rounded-xl border p-4 text-xs font-bold uppercase tracking-wider transition ${
                    draft.payoutMethod === method
                      ? "border-amber-400 bg-amber-500/15 text-amber-200"
                      : "border-white/10 bg-white/5 text-white/50"
                  }`}
                >
                  {method === "mtn" ? "MTN Mobile Money" : "Airtel Money"}
                </button>
              ))}
            </div>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Numéro de réception (+242)</span>
              <input className={field} value={draft.payoutPhone} onChange={(e) => update({ payoutPhone: e.target.value })} placeholder="+242 06 123 45 67" required />
            </label>
            <label className="flex items-start gap-3 text-xs text-white/60 cursor-pointer">
              <input type="checkbox" checked={draft.accepted} onChange={(e) => update({ accepted: e.target.checked })} className="mt-1 w-4 h-4 accent-purple-500" />
              <span>J&apos;accepte que la plateforme prélève 10 % sur chaque billet vendu et me reverse 90 % des ventes.</span>
            </label>
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button type="submit" className="w-full rounded-xl bg-purple-600 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-purple-500">
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
