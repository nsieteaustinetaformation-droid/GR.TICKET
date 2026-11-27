"use client";

import React from "react";
import { Calendar, ImageIcon, MapPin, Ticket as TicketIcon } from "lucide-react";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { formatMoney, toMinor } from "@/lib/international/money";

export interface EventCardProps {
  id: string;
  title: string;
  category: "Concert" | "Festival" | "VIP Pass" | "Sport";
  imageUrl: string;
  venue: string;
  city?: string;
  date: string;
  price: number;
  countryCode?: string;
  currency?: string;
  locale?: string;
  availableTickets?: number;
  onSelect: () => void;
}

export function EventCard({
  title,
  category,
  imageUrl,
  venue,
  city = "",
  date,
  price,
  countryCode,
  currency,
  locale,
  onSelect,
}: EventCardProps) {
  const config = getCountryConfig(countryCode);
  const resolvedCurrency = currency ?? config.currency;
  const resolvedLocale = locale ?? config.locale;
  const badgeColors = {
    Concert: "bg-violet-50 text-violet-700 border border-violet-200",
    Festival: "bg-pink-50 text-pink-700 border border-pink-200",
    "VIP Pass": "bg-amber-50 text-amber-800 border border-amber-200 font-bold",
    Sport: "bg-sky-50 text-sky-700 border border-sky-200",
  }[category];

  return (
    <div className="neon-card overflow-hidden flex flex-col justify-between group bg-white">
      {/* VIGNETTE IMAGE */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-violet-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <ImageIcon className="h-10 w-10 text-violet-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />

        {/* BADGE CATÉGORIE EN HAUT À DROITE */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${badgeColors}`}>
            {category}
          </span>
        </div>
      </div>

      {/* CONTENU INFOS */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <h4 className="font-heading font-bold text-base text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-1">
            {title}
          </h4>

          <div className="space-y-1 text-xs text-slate-500">
            <p className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span>{date}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span className="line-clamp-1">{venue}, {city}</span>
            </p>
          </div>
        </div>

        {/* PRIX ET BOUTON GET TICKETS */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-medium block">
              À partir de
            </span>
            <span className="font-heading font-black text-lg text-slate-900 font-tabular">
              {formatMoney(toMinor(price, resolvedCurrency, resolvedLocale), resolvedCurrency, resolvedLocale)}
            </span>
          </div>

          <button
            onClick={onSelect}
            className="px-4 py-2 rounded-full border border-violet-200 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <TicketIcon className="w-3.5 h-3.5" />
            <span>Prendre Billet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
