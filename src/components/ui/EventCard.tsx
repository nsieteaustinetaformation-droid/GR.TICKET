"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";
import { formatXAF } from "@/lib/utils";

export interface EventCardProps {
  id: string;
  title: string;
  category: "Concert" | "Festival" | "VIP Pass" | "Sport";
  imageUrl: string;
  venue: string;
  city?: string;
  date: string;
  price: number;
  availableTickets?: number;
  onSelect: () => void;
}

export function EventCard({
  title,
  category,
  imageUrl,
  venue,
  city = "Brazzaville",
  date,
  price,
  availableTickets = 150,
  onSelect,
}: EventCardProps) {
  const badgeColors = {
    Concert: "bg-purple-600/80 text-purple-100 border border-purple-400/40",
    Festival: "bg-pink-600/80 text-pink-100 border border-pink-400/40",
    "VIP Pass": "bg-amber-500/80 text-amber-950 border border-amber-300 font-bold",
    Sport: "bg-blue-600/80 text-blue-100 border border-blue-400/40",
  }[category];

  return (
    <div className="neon-card overflow-hidden flex flex-col justify-between group">
      
      {/* VIGNETTE IMAGE */}
      <div className="relative h-44 w-full overflow-hidden bg-[#0A0716]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120B24] via-transparent to-black/30" />

        {/* BADGE CATÉGORIE EN HAUT À DROITE */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider backdrop-blur-md shadow-sm ${badgeColors}`}>
            {category}
          </span>
        </div>
      </div>

      {/* CONTENU INFOS */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-1.5">
          <h4 className="font-heading font-bold text-base text-white group-hover:text-purple-300 transition-colors line-clamp-1">
            {title}
          </h4>

          <div className="space-y-1 text-xs text-[#A59EBF]">
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{date}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="line-clamp-1">{venue}, {city}</span>
            </p>
          </div>
        </div>

        {/* PRIX ET BOUTON GET TICKETS */}
        <div className="pt-3 border-t border-[#251846] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase text-[#6E6589] font-medium block">
              À partir de
            </span>
            <span className="font-heading font-black text-lg text-white font-tabular">
              {formatXAF(price)}
            </span>
          </div>

          <button
            onClick={onSelect}
            className="px-4 py-2 rounded-full border border-purple-500/50 bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <TicketIcon className="w-3.5 h-3.5" />
            <span>Prendre Billet</span>
          </button>
        </div>

      </div>

    </div>
  );
}
