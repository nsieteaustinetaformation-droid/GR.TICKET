"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

function ClaimForm() {
  const params = useSearchParams();
  const [ticketId, setTicketId] = useState(params.get("ticket") ?? "");
  const [reason, setReason] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [auto, setAuto] = useState(true);
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult("");
    try {
      const res = await fetch("/api/v1/claims", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticketId, reason, photoUrl: photoUrl || undefined, autoDecide: auto }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; escalated?: boolean; decision?: { ok: boolean; paidMinor?: number } };
      if (!res.ok || !data.ok) setResult(data.error ?? "Réclamation refusée.");
      else if (data.escalated) setResult("Réclamation enregistrée. Un agent va l'examiner.");
      else setResult(`Remboursement automatique effectué : ${data.decision?.paidMinor ?? 0} (unités mineures).`);
    } catch {
      setResult("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080412] px-4 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <Link href="/dashboard" className="text-xs text-white/50 hover:text-white">← Tableau de bord</Link>
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0E0A1C] p-6 sm:p-8">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight">Garantie GRTK</h1>
          <p className="mt-2 text-sm text-white/60">Ton billet entre à la porte, sinon tu es remboursé.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Numéro de billet</span>
              <input value={ticketId} onChange={(e) => setTicketId(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-400" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Motif</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-400" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Photo (URL)</span>
              <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-purple-400" />
            </label>
            <label className="flex items-center gap-2 text-xs text-white/60">
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Traitement automatique si le billet est valide et non utilisé
            </label>
            {result && <p className="text-xs text-emerald-300">{result}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 disabled:opacity-50">
              {busy ? "Envoi…" : "Déposer une réclamation"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ReclamationPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#080412]" />}><ClaimForm /></Suspense>;
}
