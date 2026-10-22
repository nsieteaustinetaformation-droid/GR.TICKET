"use client";

import React from "react";
import Image from "next/image";
import { Mic2, Sparkles, QrCode as QrIcon } from "lucide-react";

export interface ConcertTicketCardProps {
  eventName?: string;
  category?: string;
  price?: string;
  ticketCode?: string;
  rotate?: string; // e.g. "-rotate-6", "rotate-3", "rotate-0"
  className?: string;
  onClick?: () => void;
}

export function ConcertTicketCard({
  eventName = "LIVE SONG REGISTRATION TICKET",
  category = "CONCERT PASS",
  price = "15 000 FCFA",
  ticketCode = "GR-89421-50284",
  rotate = "-rotate-6",
  className = "",
  onClick,
}: ConcertTicketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:rotate-0 ${rotate} ${className}`}
    >
      {/* Ombre portée 3D réaliste */}
      <div className="absolute inset-2 bg-blue-950/40 blur-2xl rounded-2xl -z-10 group-hover:blur-3xl transition-all" />

      {/* Corps du Billet avec découpe dentelée haut et bas */}
      <div className="relative w-[280px] sm:w-[320px] bg-[#070D1F] text-white rounded-xl overflow-hidden shadow-2xl border border-blue-400/30">
        
        {/* Encoche dentelée haut (SVG zigzag cut) */}
        <div className="absolute top-0 left-0 right-0 h-3 z-20 flex justify-between overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="w-4 h-3 bg-[#EDF3F9] -translate-y-2 rotate-45 shrink-0"
            />
          ))}
        </div>

        {/* IMAGE DE FOND FESTIVAL / CONCERT */}
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src="/images/ticket_bg.jpg"
            alt="Concert stage crowd"
            fill
            className="object-cover object-center opacity-85 group-hover:scale-110 transition-transform duration-700"
            priority
          />
          {/* Dégradé bleuté d'ambiance */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070D1F] via-[#0B1736]/40 to-transparent" />
          
          {/* LOGO VOICE / GODMAN STAGE */}
          <div className="relative z-10 pt-6 px-5 flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-blue-600/30 backdrop-blur-md border border-blue-300/40 flex items-center justify-center text-cyan-300 shadow-lg shadow-blue-500/30 mb-1">
              <Mic2 className="w-5 h-5" />
            </div>
            <span className="font-display tracking-widest text-xs uppercase text-blue-200">
              GODMAN STAGE
            </span>
          </div>

          {/* TITRE PRINCIPAL EN GROS CARACTÈRES */}
          <div className="absolute bottom-4 left-0 right-0 px-5 text-center z-10">
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wider text-white leading-tight drop-shadow-md">
              {eventName}
            </h3>
          </div>
        </div>

        {/* SECTION INFOS BILLET (LIGNE POINTILLÉE) */}
        <div className="px-5 py-4 bg-[#070D1F] space-y-3">
          
          {/* Slogan séparé par des barres */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest text-blue-300/80 uppercase font-semibold">
            <span>LIVE</span>
            <span>•</span>
            <span>EXPERIENCE</span>
            <span>•</span>
            <span>FEEL</span>
          </div>

          {/* Ligne de perforation horizontale */}
          <div className="relative my-2">
            <div className="border-t border-dashed border-blue-400/30 w-full" />
            {/* Encoches latérales du talon */}
            <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#EDF3F9]" />
            <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#EDF3F9]" />
          </div>

          {/* Catégorie */}
          <div className="text-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-200 font-bold block">
              {category}
            </span>
          </div>

          {/* CODE-BARRES & PRIX */}
          <div className="pt-2 flex items-center justify-between gap-3">
            
            {/* Faux Code-barres vertical style festival */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-end gap-[2px] h-9">
                <span className="w-[3px] h-9 bg-white" />
                <span className="w-[1px] h-9 bg-white" />
                <span className="w-[4px] h-9 bg-white" />
                <span className="w-[2px] h-9 bg-white" />
                <span className="w-[1px] h-9 bg-white" />
                <span className="w-[3px] h-9 bg-white" />
                <span className="w-[1px] h-9 bg-white" />
                <span className="w-[5px] h-9 bg-white" />
                <span className="w-[2px] h-9 bg-white" />
                <span className="w-[1px] h-9 bg-white" />
                <span className="w-[4px] h-9 bg-white" />
                <span className="w-[2px] h-9 bg-white" />
                <span className="w-[3px] h-9 bg-white" />
                <span className="w-[1px] h-9 bg-white" />
                <span className="w-[2px] h-9 bg-white" />
                <span className="w-[4px] h-9 bg-white" />
              </div>
              <span className="text-[9px] font-mono text-blue-300/70 tracking-wider">
                {ticketCode}
              </span>
            </div>

            {/* PRIX EN GROS */}
            <div className="text-right">
              <span className="font-display text-2xl sm:text-3xl font-black text-white tracking-wider block">
                {price}
              </span>
            </div>

          </div>

        </div>

        {/* Encoche dentelée bas (SVG zigzag cut) */}
        <div className="h-3 w-full flex justify-between overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="w-4 h-3 bg-[#EDF3F9] translate-y-1.5 rotate-45 shrink-0"
            />
          ))}
        </div>

      </div>
    </div>
  );
}
