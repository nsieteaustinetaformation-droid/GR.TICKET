"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProfessionalTicket } from "@/components/grtk/ProfessionalTicket";
import { RealisticTicket3D } from "@/components/grtk/RealisticTicket3D";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { normalizeLocale } from "@/lib/international/messages";
import { formatInZone } from "@/lib/international/time";
import { getEventById, restoreLocalEvents } from "@/lib/store/events";
import type { EventItem, GrtkTicket } from "@/lib/types";

function TicketView() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<GrtkTicket | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/v1/tickets/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return;
        setTicket(d.ticket);
        restoreLocalEvents();
        setEvent(getEventById(d.ticket.eventId) ?? null);
      });
  }, [id]);

  if (!ticket) return <main className="min-h-screen bg-white p-8 text-slate-900">Chargement du billet…</main>;

  const locale = normalizeLocale(event?.locale ?? getCountryConfig(event?.countryCode ?? "").locale);
  const localDate = formatInZone(
    event?.startAtUtc ?? ticket.createdAt,
    event?.timeZone ?? "UTC",
    locale === "fr" ? "fr-FR" : "en-US",
  );

  async function transfer() {
    if (!transferTo.trim()) return;
    const res = await fetch(`/api/v1/tickets/${ticket!.id}/transfer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fromAccountId: ticket!.holderAccountId,
        toAccountId: `account-${transferTo.trim().toLowerCase()}`,
        toDeviceId: `device-${transferTo.trim().toLowerCase()}`,
        toHolderName: transferTo.trim(),
        resalePriceMinor: ticket!.priceMinor,
      }),
    });
    const data = (await res.json()) as { ok: boolean; ticket?: GrtkTicket; error?: string };
    setMessage(data.ok && data.ticket ? `Billet transféré à ${data.ticket.holderName}. Ancien QR invalidé.` : (data.error ?? "Transfert refusé."));
    if (data.ok && data.ticket) setTicket(data.ticket);
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/dashboard" className="text-xs text-slate-500 hover:text-violet-700">← Tableau de bord</Link>
        <RealisticTicket3D edgeColor={event?.branding?.primaryColor}>
          <ProfessionalTicket
            ticket={ticket}
            branding={event?.branding}
            locale={locale}
            localDate={localDate}
            venue={event?.venue ?? ""}
            city={event?.city ?? ""}
          />
        </RealisticTicket3D>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Transférer le billet</h2>
          <p className="mt-1 text-xs text-slate-500">Transfert uniquement via GRTK, au prix d&apos;origine. L&apos;ancien QR est invalidé.</p>
          <div className="mt-3 flex gap-2">
            <input value={transferTo} onChange={(e) => setTransferTo(e.target.value)} placeholder="Nom du nouveau titulaire" className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
            <button onClick={() => void transfer()} className="rounded-xl bg-violet-600 px-4 py-3 text-[11px] font-bold uppercase text-white hover:bg-violet-700">Transférer</button>
          </div>
          {message && <p className="mt-3 text-xs text-emerald-700">{message}</p>}
          <Link href={`/reclamation?ticket=${ticket.id}`} className="mt-4 inline-block text-[11px] font-bold uppercase text-amber-700">Le scan a échoué ? Déposer une réclamation →</Link>
        </div>
      </div>
    </main>
  );
}

export default function TicketPage() {
  return <Suspense fallback={<main className="min-h-screen bg-white" />}><TicketView /></Suspense>;
}
