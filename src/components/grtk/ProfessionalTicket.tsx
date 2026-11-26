"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Calendar, Download, MapPin, Printer, ShieldCheck, Ticket as TicketIcon, Wallet } from "lucide-react";
import type { EventBranding, GrtkTicket } from "@/lib/types";
import { formatMoney } from "@/lib/international/money";
import { normalizeLocale, translate } from "@/lib/international/messages";
import { GuaranteeBadge } from "./GuaranteeBadge";

interface Props {
  ticket: GrtkTicket;
  branding?: EventBranding;
  localDate?: string;
  venue?: string;
  city?: string;
  locale?: string;
}

export function ProfessionalTicket({ ticket, branding, localDate, venue, city, locale = "fr" }: Props) {
  const [qr, setQr] = useState("");
  const [token, setToken] = useState("");
  const [remaining, setRemaining] = useState(30);
  const [error, setError] = useState("");
  const qrRef = useRef<HTMLImageElement | null>(null);
  const l = normalizeLocale(locale);

  const refresh = useCallback(async () => {
    try {
      const challengeRes = await fetch(`/api/v1/tickets/${ticket.id}/qr/challenge`, {
        method: "POST",
        headers: { "x-scanner-id": ticket.deviceId },
      });
      if (!challengeRes.ok) throw new Error("challenge_failed");
      const challenge = (await challengeRes.json()) as { nonce: string; expiresAt: string };
      const tokenRes = await fetch(`/api/v1/tickets/${ticket.id}/qr/token?nonce=${challenge.nonce}`);
      if (!tokenRes.ok) throw new Error("token_failed");
      const data = (await tokenRes.json()) as { token: string };
      setToken(data.token);
      setQr(await QRCode.toDataURL(data.token, { errorCorrectionLevel: "M", margin: 1, width: 320 }));
      setRemaining(30);
      setError("");
    } catch {
      setError(l === "fr" ? "QR indisponible pour le moment." : "QR temporarily unavailable.");
    }
  }, [ticket.id, ticket.deviceId, l]);

  useEffect(() => {
    void refresh();
    const rotate = window.setInterval(() => void refresh(), 30_000);
    const tick = window.setInterval(() => setRemaining((value) => (value <= 1 ? 30 : value - 1)), 1_000);
    return () => {
      window.clearInterval(rotate);
      window.clearInterval(tick);
    };
  }, [refresh]);

  function downloadPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = branding?.backgroundColor ?? "#0A0A0B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = branding?.primaryColor ?? "#8B5CF6";
    ctx.fillRect(0, 0, 12, canvas.height);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(ticket.eventTitle.slice(0, 32), 40, 60);
    ctx.font = "18px sans-serif";
    ctx.fillText(`${translate(l, "ticket.holder")}: ${ticket.holderName}`, 40, 110);
    ctx.fillText(`${ticket.seatLabel} · ${localDate ?? ""}`, 40, 140);
    ctx.fillText(`${translate(l, "ticket.price")}: ${formatMoney(ticket.priceMinor, ticket.currency, l)}`, 40, 170);
    ctx.fillText(`${translate(l, "ticket.number")}: ${ticket.id.slice(0, 12).toUpperCase()}`, 40, 200);
    if (qrRef.current) ctx.drawImage(qrRef.current, 600, 70, 260, 260);
    ctx.fillStyle = "#34D399";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(translate(l, "guarantee.badge"), 40, 430);
    const link = document.createElement("a");
    link.download = `grtk-${ticket.id.slice(0, 8)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <article
      className="grtk-ticket relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0B] text-white shadow-2xl print:border-none"
      style={
        {
          "--grtk-primary": branding?.primaryColor ?? "#8B5CF6",
          "--grtk-secondary": branding?.secondaryColor ?? "#D4A22A",
          "--grtk-bg": branding?.backgroundColor ?? "#0A0A0B",
        } as React.CSSProperties
      }
    >
      {branding?.backgroundImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={branding.backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
      )}

      <div className="relative flex flex-col md:flex-row">
        <div className="relative flex-1 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              {branding?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoUrl} alt="Organisateur" className="h-9 w-9 rounded-lg object-contain" />
              ) : (
                <TicketIcon className="h-8 w-8 text-[var(--grtk-primary)]" />
              )}
              <span className="text-xs font-black uppercase tracking-[0.2em]">GRTK</span>
            </div>
            <GuaranteeBadge locale={l} compact />
          </div>

          <h2 className="mt-6 text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">{ticket.eventTitle}</h2>
          <span className="mt-3 inline-block rounded-md border border-[var(--grtk-secondary)]/40 bg-[var(--grtk-secondary)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--grtk-secondary)]">
            {ticket.seatLabel}
          </span>

          <div className="my-6 grid gap-4 border-y border-white/10 py-5 text-xs sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 uppercase tracking-wider text-white/40"><Calendar className="h-3.5 w-3.5" /> {l === "fr" ? "Date et heure" : "Date and time"}</p>
              <p className="mt-1 font-semibold">{localDate}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 uppercase tracking-wider text-white/40"><MapPin className="h-3.5 w-3.5" /> {l === "fr" ? "Lieu" : "Venue"}</p>
              <p className="mt-1 font-semibold">{[venue, city].filter(Boolean).join(", ")}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="flex items-center gap-1.5 uppercase tracking-wider text-white/40"><ShieldCheck className="h-3.5 w-3.5" /> {translate(l, "ticket.holder")}</p>
              <p className="mt-1 font-semibold">{ticket.holderName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">{translate(l, "ticket.number")}</p>
              <p className="font-mono text-sm font-bold tracking-wider text-[var(--grtk-secondary)]">{ticket.id.slice(0, 12).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-white/40">{translate(l, "ticket.price")}</p>
              <p className="font-mono text-2xl font-black">{formatMoney(ticket.priceMinor, ticket.currency, l)}</p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 md:w-64 md:border-l md:border-t-0">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--grtk-primary)]">{translate(l, "ticket.qr")}</p>
            <p className="mt-1 text-[10px] text-white/40">{remaining}s</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-lg">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img ref={qrRef} src={qr} alt="QR dynamique GRTK" className="h-40 w-40" />
            ) : (
              <div className="h-40 w-40 animate-pulse bg-white/70" />
            )}
          </div>
          {error && <p className="text-center text-[10px] text-red-300">{error}</p>}
          <p className="text-center text-[9px] uppercase leading-relaxed tracking-wider text-white/40">
            {l === "fr" ? "Présentez ce QR dans l'application GRTK. Une capture d'écran ne passe pas." : "Show this QR in the GRTK app. A screenshot will not work."}
          </p>
        </div>
      </div>

      <div className="relative flex flex-wrap gap-2 border-t border-white/10 bg-black/30 p-4 print:hidden">
        <button onClick={() => void refresh()} className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white/20">
          {l === "fr" ? "Actualiser le QR" : "Refresh QR"}
        </button>
        <button onClick={downloadPng} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white/20">
          <Download className="h-3.5 w-3.5" /> PNG
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white/20">
          <Printer className="h-3.5 w-3.5" /> PDF
        </button>
        <a href={`/api/v1/tickets/${ticket.id}/pass?kind=apple`} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white/20">
          <Wallet className="h-3.5 w-3.5" /> Apple Wallet
        </a>
        <a href={`/api/v1/tickets/${ticket.id}/pass?kind=google`} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white/20">
          <Wallet className="h-3.5 w-3.5" /> Google Wallet
        </a>
      </div>
    </article>
  );
}
