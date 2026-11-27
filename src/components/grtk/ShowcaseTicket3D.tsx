"use client";

import { Calendar, MapPin, ShieldCheck } from "lucide-react";
import { RealisticTicket3D } from "./RealisticTicket3D";

interface Props {
  title: string;
  category: string;
  holder: string;
  date: string;
  venue: string;
  price: string;
  number: string;
  color?: string;
  angle?: "left" | "flat" | "right";
}

const QR_CELLS = Array.from({ length: 81 }, (_, index) => {
  const x = index % 9;
  const y = Math.floor(index / 9);
  const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
  if (finder) return (x === 1 && y === 1) || (x === 7 && y === 1) || (x === 1 && y === 7) ? false : true;
  return (x * 3 + y * 5 + x * y) % 4 < 2;
});

/** Billet de démonstration, sans appel réseau : sert à montrer le rendu 3D. */
export function ShowcaseTicket3D({
  title,
  category,
  holder,
  date,
  venue,
  price,
  number,
  color = "#6D5CFF",
  angle = "flat",
}: Props) {
  return (
    <RealisticTicket3D angle={angle} edgeColor={color} className="mx-auto w-[300px] max-w-full">
      <div className="overflow-hidden rounded-3xl bg-white text-slate-900">
        <div
          className="relative h-24 overflow-hidden px-5 py-4 text-white"
          style={{ background: `linear-gradient(130deg, ${color}, #241559 75%)` }}
        >
          <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full border-[16px] border-white/10" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70">GR Ticket</p>
          <p className="mt-1 text-sm font-black uppercase leading-tight tracking-tight">{title}</p>
          <span className="mt-2 inline-block rounded-md bg-white/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
            {category}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_58px]">
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500">
              <Calendar className="h-3 w-3 text-violet-500" /> {date}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500">
              <MapPin className="h-3 w-3 text-violet-500" /> {venue}
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Titulaire</p>
              <p className="text-[11px] font-bold">{holder}</p>
            </div>
            <div className="flex items-end justify-between border-t border-slate-100 pt-2">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">N°</p>
                <p className="font-mono text-[9px] font-bold">{number}</p>
              </div>
              <p className="text-sm font-black text-violet-600">{price}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between border-l border-dashed border-slate-300 bg-slate-50 p-2">
            <div className="grid grid-cols-9 gap-[1px] rounded bg-white p-1 shadow-sm">
              {QR_CELLS.map((filled, index) => (
                <span
                  key={index}
                  className={`h-[5px] w-[5px] ${filled ? "bg-slate-900" : "bg-white"}`}
                />
              ))}
            </div>
            <span className="rotate-90 whitespace-nowrap text-[7px] font-black uppercase tracking-widest text-slate-400">
              Entrée
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 bg-emerald-50 py-2 text-[8px] font-black uppercase tracking-widest text-emerald-700">
          <ShieldCheck className="h-3 w-3" /> Billet garanti GR Ticket
        </div>
      </div>
    </RealisticTicket3D>
  );
}
