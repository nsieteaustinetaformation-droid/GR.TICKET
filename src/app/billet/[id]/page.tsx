"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProfessionalTicket } from "@/components/grtk/ProfessionalTicket";
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

  if (!ticket) return <main className="min-h-screen bg-[#080412] p-8 text-white">Chargement du billet…</main>;

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
    <main className="min-h-screen bg-[#080412] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/dashboard" className="text-xs text-white/50 hover:text-white">← Tableau de bord</Link>
        <ProfessionalTicket
          ticket={ticket}
          branding={event?.branding}
          locale={locale}
          localDate={localDate}
          venue={event?.venue ?? ""}
          city={event?.city ?? ""}
        />

        <div className="rounded-2xl border border-white/10 bg-[#0E0A1C] p-5 text-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Transférer le billet</h2>
          <p className="mt-1 text-xs text-white/40">Transfert uniquement via GRTK, au prix d&apos;origine. L&apos;ancien QR est invalidé.</p>
          <div className="mt-3 flex gap-2">
            <input value={transferTo} onChange={(e) => setTransferTo(e.target.value)} placeholder="Nom du nouveau titulaire" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-purple-400" />
            <button onClick={() => void transfer()} className="rounded-xl bg-purple-600 px-4 text-[11px] font-bold uppercase">Transférer</button>
          </div>
          {message && <p className="mt-3 text-xs text-emerald-300">{message}</p>}
          <Link href={`/reclamation?ticket=${ticket.id}`} className="mt-4 inline-block text-[11px] font-bold uppercase text-amber-300">Le scan a échoué ? Déposer une réclamation →</Link>
        </div>
      </div>
    </main>
  );
}

export default function TicketPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#080412]" />}><TicketView /></Suspense>;
}
