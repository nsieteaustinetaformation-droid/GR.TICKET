"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Clock, Copy, MessageCircle, Share2 } from "lucide-react";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { paymentMethodLabel, translate, type Locale } from "@/lib/international/messages";
import { formatMoney } from "@/lib/international/money";
import type { GroupPayment, GroupShare } from "@/lib/types";

interface GroupData {
  group: GroupPayment;
  shares: GroupShare[];
  held: number;
}

function idempotencyFor(shareId: string): string {
  const key = `grtk-idem-${shareId}`;
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
}

function GroupView() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<GroupData | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/v1/groups/${token}`);
    if (res.ok) setData((await res.json()) as GroupData);
  }, [token]);

  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 10_000); return () => window.clearInterval(timer); }, [load]);

  if (!data) return <main className="min-h-screen bg-[#080412] p-8 text-white">Chargement du groupe…</main>;
  const { group, shares } = data;
  const config = getCountryConfig(group.countryCode);
  const locale: Locale = config.locale;
  const paymentMethods = config.paymentMethods.length > 0 ? config.paymentMethods : ["card"];
  const defaultMethod = paymentMethods[0];
  const paid = shares.filter((s) => s.status === "paid").length;
  const link = typeof window !== "undefined" ? window.location.href : "";
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(translate(locale, "split.invite", { name: group.initiatorName, link }))}`;

  async function pay(share: GroupShare) {
    setBusy(share.id);
    setError("");
    try {
      const res = await fetch(`/api/v1/groups/${token}/shares/${share.id}/pay`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          holderName: names[share.id] ?? "",
          methodCode: methods[share.id] ?? defaultMethod,
          idempotencyKey: idempotencyFor(share.id),
        }),
      });
      const result = (await res.json()) as { ok: boolean; error?: string; ticket?: { id: string } };
      if (!res.ok || !result.ok) { setError(result.error ?? "Paiement refusé."); return; }
      await load();
      if (result.ticket) window.location.href = `/billet/${result.ticket.id}`;
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
  }

  return (
    <main className="min-h-screen bg-[#080412] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/dashboard" className="text-xs text-white/50 hover:text-white">← Tableau de bord</Link>
        <GuaranteeBadge locale={locale} />
        <h1 className="text-3xl font-black uppercase tracking-tight">Paiement de groupe</h1>
        <p className="text-sm text-white/60">Organisé par {group.initiatorName} · {shares.length} places · expiration {new Date(group.expiresAt).toLocaleString()}</p>

        <div className="rounded-2xl border border-white/10 bg-[#0E0A1C] p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Suivi du paiement</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-purple-500 transition-all" style={{ width: `${shares.length ? (paid / shares.length) * 100 : 0}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/60">{paid} payé(s) sur {shares.length} · règle : {group.validationMode === "all_or_nothing" ? "tout ou rien" : "places payées"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => void copyLink()} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold uppercase"><Copy className="h-3.5 w-3.5" /> Copier le lien</button>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
            <a href={`sms:?body=${encodeURIComponent(translate(locale, "split.sms", { link }))}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold uppercase"><Share2 className="h-3.5 w-3.5" /> SMS</a>
          </div>
        </div>

        {error && <p className="text-xs text-red-300">{error}</p>}

        <div className="space-y-3">
          {shares.map((share, index) => (
            <div key={share.id} className="rounded-2xl border border-white/10 bg-[#0E0A1C] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Place {index + 1}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${share.status === "paid" ? "text-emerald-300" : "text-amber-300"}`}>
                  {share.status === "paid" ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  {share.status}
                </span>
              </div>
              <p className="mt-1 font-mono text-lg">{formatMoney(share.amountMinor, group.currency, config.locale)}</p>
              {share.status === "pending" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input value={names[share.id] ?? ""} onChange={(e) => setNames({ ...names, [share.id]: e.target.value })} placeholder="Nom du titulaire" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-purple-400" />
                  <select value={methods[share.id] ?? defaultMethod} onChange={(e) => setMethods({ ...methods, [share.id]: e.target.value })} className="rounded-xl border border-white/10 bg-[#0E0A1C] px-3 py-2.5 text-sm">
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>{paymentMethodLabel(locale, method)}</option>
                    ))}
                  </select>
                  <button onClick={() => void pay(share)} disabled={busy === share.id} className="sm:col-span-2 rounded-xl bg-purple-600 py-3 text-[11px] font-bold uppercase tracking-wider hover:bg-purple-500 disabled:opacity-50">
                    {busy === share.id ? "Paiement…" : "Payer ma part"}
                  </button>
                </div>
              )}
              {share.ticketId && <Link href={`/billet/${share.ticketId}`} className="mt-3 inline-block text-[11px] font-bold uppercase text-emerald-300">Voir mon billet →</Link>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function GroupPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#080412]" />}><GroupView /></Suspense>;
}
