"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Copy, MessageCircle, QrCode, Share2, ShieldCheck } from "lucide-react";
import { ProfessionalTicket } from "@/components/grtk/ProfessionalTicket";
import { RealisticTicket3D } from "@/components/grtk/RealisticTicket3D";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/motion/Skeleton";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { normalizeLocale, translate } from "@/lib/international/messages";
import { formatInZone } from "@/lib/international/time";
import { smsUrl, ticketLink, ticketShareMessage, whatsappUrl } from "@/lib/sharing";
import { getEventById, restoreLocalEvents } from "@/lib/store/events";
import type { EventItem, GrtkTicket } from "@/lib/types";

interface Flash { kind: "success" | "error"; message: string }

function TicketBack({ ticket, eventTitle, localDate }: { ticket: GrtkTicket; eventTitle: string; localDate: string }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[24px] border border-slate-200 bg-white p-6 text-slate-900 sm:p-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-700">Verso du billet</p>
        <h3 className="mt-2 font-heading text-2xl font-black uppercase tracking-tight">{eventTitle}</h3>
        <p className="mt-1 text-xs text-slate-500">{localDate}</p>
      </div>
      <div className="grid gap-3 border-y border-slate-200 py-5 text-xs sm:grid-cols-2">
        <div><p className="uppercase tracking-wider text-slate-500">Titulaire</p><p className="mt-1 font-semibold">{ticket.holderName}</p></div>
        <div><p className="uppercase tracking-wider text-slate-500">Numéro</p><p className="mt-1 font-mono font-semibold">{ticket.id.slice(0, 12).toUpperCase()}</p></div>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-4">
        <QrCode className="h-6 w-6 shrink-0 text-violet-700" aria-hidden />
        <p className="text-[11px] leading-relaxed text-violet-900">
          Présentez le QR dynamique depuis l&apos;application GR Ticket. Il change toutes les 30 secondes : une capture d&apos;écran ne passe pas.
        </p>
      </div>
      <GuaranteeBadge locale="fr" compact withTooltip />
    </div>
  );
}

function TicketView() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<GrtkTicket | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);

  useEffect(() => {
    fetch(`/api/v1/tickets/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return;
        setTicket(d.ticket);
        restoreLocalEvents();
        setEvent(getEventById(d.ticket.eventId) ?? null);
      })
      .catch(() => setFlash({ kind: "error", message: "Billet indisponible pour le moment." }));
  }, [id]);

  const locale = normalizeLocale(event?.locale ?? getCountryConfig(event?.countryCode ?? "").locale);
  const localDate = ticket
    ? formatInZone(event?.startAtUtc ?? ticket.createdAt, event?.timeZone ?? "UTC", locale === "fr" ? "fr-FR" : "en-US")
    : "";

  async function transfer() {
    if (!ticket || !transferTo.trim()) {
      setFlash({ kind: "error", message: "Indiquez le nom du nouveau titulaire." });
      return;
    }
    try {
      const res = await fetch(`/api/v1/tickets/${ticket.id}/transfer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fromAccountId: ticket.holderAccountId,
          toAccountId: `account-${transferTo.trim().toLowerCase()}`,
          toDeviceId: `device-${transferTo.trim().toLowerCase()}`,
          toHolderName: transferTo.trim(),
          resalePriceMinor: ticket.priceMinor,
        }),
      });
      const data = (await res.json()) as { ok: boolean; ticket?: GrtkTicket; error?: string };
      if (data.ok && data.ticket) {
        setTicket(data.ticket);
        setTransferTo("");
        setFlash({ kind: "success", message: `Billet transféré à ${data.ticket.holderName}. Ancien QR invalidé.` });
      } else {
        setFlash({ kind: "error", message: data.error ?? "Transfert refusé." });
      }
    } catch {
      setFlash({ kind: "error", message: "Erreur réseau. Réessayez." });
    }
  }

  if (!ticket) {
    return (
      <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </main>
    );
  }

  const link = ticketLink(ticket.id);
  const shareMessage = ticketShareMessage({
    locale,
    eventTitle: ticket.eventTitle,
    holderName: ticket.holderName,
    code: ticket.id.slice(0, 12).toUpperCase(),
    link,
  });

  async function copyTicketLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="link-underline text-xs text-[var(--grtk-text-3)] hover:text-violet-700">← Tableau de bord</Link>
          <ThemeToggle compact />
        </div>

        <RealisticTicket3D
          edgeColor={event?.branding?.primaryColor}
          flippable
          back={<TicketBack ticket={ticket} eventTitle={ticket.eventTitle} localDate={localDate} />}
        >
          <ProfessionalTicket
            ticket={ticket}
            branding={event?.branding}
            locale={locale}
            localDate={localDate}
            venue={event?.venue ?? ""}
            city={event?.city ?? ""}
          />
        </RealisticTicket3D>

        <Reveal delay={60}>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">
              Envoyer le billet
            </h2>
            <p className="mt-1 text-xs text-[var(--grtk-text-3)]">
              Le message est déjà rédigé avec le lien du billet. La photo apparaît dans l&apos;aperçu du lien.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => void copyTicketLink()}
                className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg border border-[var(--grtk-border)] px-3 py-2 text-[10px] font-bold uppercase hover:border-violet-600"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? translate(locale, "share.copied") : translate(locale, "share.copyLink")}
              </button>
              <a
                href={whatsappUrl(shareMessage)}
                target="_blank"
                rel="noreferrer"
                className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase text-white hover:bg-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {translate(locale, "share.whatsapp")}
              </a>
              <a
                href={smsUrl(shareMessage)}
                className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg border border-[var(--grtk-border)] px-3 py-2 text-[10px] font-bold uppercase hover:border-violet-600"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden /> {translate(locale, "share.sms")}
              </a>
            </div>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 text-sm shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">Transférer le billet</h2>
            <p className="mt-1 text-xs text-[var(--grtk-text-3)]">Transfert uniquement via GR Ticket, au prix d&apos;origine. L&apos;ancien QR est invalidé.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Nom du nouveau titulaire"
                aria-label="Nom du nouveau titulaire"
                className="min-touch-target flex-1 rounded-xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
              <button
                onClick={() => void transfer()}
                className="btn-neon-purple min-touch-target px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
              >
                Transférer
              </button>
            </div>
            {flash && <div className="mt-3"><StatusFlash kind={flash.kind} message={flash.message} onDone={() => setFlash(null)} /></div>}
            <Link href={`/reclamation?ticket=${ticket.id}`} className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase text-amber-700">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Le scan a échoué ? Déposer une réclamation →
            </Link>
          </section>
        </Reveal>
      </div>
    </main>
  );
}

export default function TicketPage() {
  return <Suspense fallback={<main className="min-h-screen bg-white" />}><TicketView /></Suspense>;
}
