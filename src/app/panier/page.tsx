"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Users } from "lucide-react";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { applyTax, formatMoney, toMinor } from "@/lib/international/money";
import { getEventById, restoreLocalEvents } from "@/lib/store/events";
import type { EventItem } from "@/lib/types";

function Cart() {
  const params = useSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [quantity, setQuantity] = useState(2);
  const [initiator, setInitiator] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { restoreLocalEvents(); setEvent(getEventById(params.get("event") ?? "") ?? null); }, [params]);

  if (!event) return <main className="min-h-screen bg-white p-8 text-slate-900">Panier vide ou événement introuvable.</main>;

  const config = getCountryConfig(event.countryCode);
  const currency = event.currency ?? config.currency;
  const type = event.ticketTypes[0];
  const unit = toMinor(type?.price ?? 0, currency, config.locale);
  const subtotal = unit * quantity;
  const tax = applyTax(subtotal, config.taxRate, config.taxMode);
  const commission = Math.round(tax.grossMinor * (event.commissionPercent ?? DEFAULT_COMMISSION_PERCENT) / 100);
  const capacity = event.ticketTypes.reduce((sum, item) => sum + item.totalQuantity, 0);

  async function createGroup() {
    if (!initiator.trim()) { setError("Indiquez votre nom."); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/v1/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId: event!.id,
          eventTitle: event!.title,
          initiatorName: initiator.trim(),
          countryCode: config.countryCode,
          currency,
          validationMode: event!.groupValidationMode ?? "all_or_nothing",
          unitAmountMinor: tax.grossMinor,
          quantity,
          capacity,
          holdHours: event!.holdHours ?? 24,
        }),
      });
      const data = (await res.json()) as { ok: boolean; group?: { token: string }; error?: string };
      if (!res.ok || !data.group) { setError(data.error ?? "Impossible de créer le groupe."); return; }
      router.push(`/groupe/${data.group.token}`);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link href={`/evenements/${event.slug}`} className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-violet-700">
          <ArrowLeft className="h-4 w-4" /> Événement
        </Link>
        <h1 className="mt-6 text-3xl font-black uppercase tracking-tight">Panier</h1>
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
          <GuaranteeBadge locale={config.locale} />
          <h2 className="text-xl font-bold">{event.title}</h2>
          <p className="text-xs text-slate-500">{type?.name} · {type?.totalQuantity - type?.soldQuantity} places disponibles</p>

          <div className="flex items-center justify-between border-y border-slate-200 py-4">
            <span className="text-sm text-slate-600">Nombre de places</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">−</button>
              <span className="w-8 text-center font-mono font-bold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">+</button>
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Votre nom</span>
            <input value={initiator} onChange={(e) => setInitiator(e.target.value)} placeholder="Ex: Alice Martin" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
          </label>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500"><span>Sous-total</span><span>{formatMoney(subtotal, currency, config.locale)}</span></div>
            <div className="flex justify-between text-slate-500"><span>{config.taxLabel}</span><span>{formatMoney(tax.taxMinor, currency, config.locale)}</span></div>
            <div className="flex justify-between text-red-600"><span>Commission GRTK ({event.commissionPercent ?? DEFAULT_COMMISSION_PERCENT} %)</span><span>− {formatMoney(commission, currency, config.locale)}</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-black"><span>Total à collecter</span><span>{formatMoney(tax.grossMinor, currency, config.locale)}</span></div>
          </div>

          <p className="flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Chaque place est réservée {event.holdHours ?? 24} h. Les places non payées sont libérées automatiquement.
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}

          <button onClick={() => void createGroup()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-violet-700 disabled:opacity-50">
            <Users className="h-4 w-4" /> {busy ? "Création du lien…" : "Payer à plusieurs"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CartPage() {
  return <Suspense fallback={<main className="min-h-screen bg-white" />}><Cart /></Suspense>;
}
