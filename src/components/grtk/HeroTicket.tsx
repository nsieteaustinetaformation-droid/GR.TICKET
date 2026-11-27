"use client";

import type { JSX } from "react";
import { CalendarDays, MapPin, QrCode, ShieldCheck, Ticket as TicketIcon } from "lucide-react";

/**
 * Billet de démonstration pour l'accueil : aucune photo stock, aucun faux QR.
 * Les informations affichées sont neutres et servent uniquement de support au rendu 3D.
 */
export function HeroTicket(): JSX.Element {
  return (
    <div className="relative w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 text-slate-900 sm:p-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white">
            <TicketIcon className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-heading text-sm font-black uppercase tracking-[0.2em]">GRTK</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
          <ShieldCheck className="h-3 w-3" aria-hidden /> Billet garanti
        </span>
      </div>

      <div className="mt-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-700">Votre prochain événement</p>
        <h3 className="mt-2 font-heading text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
          La place
          <br />
          qui vous attend
        </h3>
      </div>

      <div className="mt-7 grid gap-4 border-y border-slate-200 py-5 text-xs sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
            <CalendarDays className="h-3.5 w-3.5 text-violet-600" aria-hidden /> Date
          </p>
          <p className="mt-1 font-semibold">Au bon moment</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-violet-600" aria-hidden /> Lieu
          </p>
          <p className="mt-1 font-semibold">Au bon endroit</p>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Numéro</p>
          <p className="font-mono text-sm font-bold tracking-wider text-violet-700">APRÈS PAIEMENT</p>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <QrCode className="h-8 w-8 text-slate-300" aria-hidden />
          <span className="sr-only">Le QR dynamique est généré après le paiement</span>
        </div>
      </div>
    </div>
  );
}
