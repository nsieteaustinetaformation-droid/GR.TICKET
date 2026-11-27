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

  if (!data) return <main className="min-h-screen bg-white p-8 text-slate-900">Chargement du groupe…</main>;
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
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/dashboard" className="text-xs text-slate-500 hover:text-violet-700">← Tableau de bord</Link>
        <GuaranteeBadge locale={locale} />
        <h1 className="text-3xl font-black uppercase tracking-tight">Paiement de groupe</h1>
        <p className="text-sm text-slate-500">Organisé par {group.initiatorName} · {shares.length} places · expiration {new Date(group.expiresAt).toLocaleString()}</p>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Suivi du paiement</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-violet-600 transition-all" style={{ width: `${shares.length ? (paid / shares.length) * 100 : 0}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">{paid} payé(s) sur {shares.length} · règle : {group.validationMode === "all_or_nothing" ? "tout ou rien" : "places payées"}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => void copyLink()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase text-slate-700 hover:bg-slate-50"><Copy className="h-3.5 w-3.5" /> Copier le lien</button>
            <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase text-white hover:bg-emerald-700"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
            <a href={`sms:?body=${encodeURIComponent(translate(locale, "split.sms", { link }))}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase text-slate-700 hover:bg-slate-50"><Share2 className="h-3.5 w-3.5" /> SMS</a>
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="space-y-3">
          {shares.map((share, index) => (
            <div key={share.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Place {index + 1}</p>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${share.status === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                  {share.status === "paid" ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  {share.status}
                </span>
              </div>
              <p className="mt-1 font-mono text-lg">{formatMoney(share.amountMinor, group.currency, config.locale)}</p>
              {share.status === "pending" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input value={names[share.id] ?? ""} onChange={(e) => setNames({ ...names, [share.id]: e.target.value })} placeholder="Nom du titulaire" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                  <select value={methods[share.id] ?? defaultMethod} onChange={(e) => setMethods({ ...methods, [share.id]: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>{paymentMethodLabel(locale, method)}</option>
                    ))}
                  </select>
                  <button onClick={() => void pay(share)} disabled={busy === share.id} className="sm:col-span-2 rounded-xl bg-violet-600 py-3 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-violet-700 disabled:opacity-50">
                    {busy === share.id ? "Paiement…" : "Payer ma part"}
                  </button>
                </div>
              )}
              {share.ticketId && <Link href={`/billet/${share.ticketId}`} className="mt-3 inline-block text-[11px] font-bold uppercase text-emerald-700">Voir mon billet →</Link>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function GroupPage() {
  return <Suspense fallback={<main className="min-h-screen bg-white" />}><GroupView /></Suspense>;
}
