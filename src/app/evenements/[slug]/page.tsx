"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { formatMoney, toMinor, applyTax } from "@/lib/international/money";
import { formatInZone } from "@/lib/international/time";
import type { Locale } from "@/lib/international/messages";
import { getEventBySlug, restoreLocalEvents } from "@/lib/store/events";
import type { EventItem } from "@/lib/types";

function EventView() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => { restoreLocalEvents(); setEvent(getEventBySlug(slug) ?? null); }, [slug]);
  if (!event) return <main className="min-h-screen bg-[#080412] p-8 text-white">Événement introuvable.</main>;

  const config = getCountryConfig(event.countryCode);
  const currency = event.currency ?? config.currency;
  const timeZone = event.timeZone ?? config.timeZone;
  const unit = event.ticketTypes.reduce((min, t) => Math.min(min, t.price), Infinity);
  const priceMinor = toMinor(Number.isFinite(unit) ? unit : 0, currency, config.locale);
  const tax = applyTax(priceMinor, config.taxRate, config.taxMode);
  const dateText = event.startAtUtc
    ? formatInZone(event.startAtUtc, timeZone, locale === "fr" ? "fr-FR" : "en-US")
    : `${event.date} ${event.startTime}`;

  return (
    <main className="min-h-screen bg-[#080412] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Tableau de bord
          </Link>
          <div className="flex gap-1 rounded-lg border border-white/10 p-1 text-[10px] font-bold uppercase">
            {(["fr", "en"] as Locale[]).map((item) => (
              <button key={item} onClick={() => setLocale(item)} className={`rounded px-2 py-1 ${locale === item ? "bg-white/20" : "text-white/40"}`}>{item}</button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0E0A1C]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.imageUrl} alt={event.title} className="h-56 w-full object-cover opacity-80" />
          <div className="space-y-5 p-6 sm:p-8">
            <GuaranteeBadge locale={locale} />
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">{event.title}</h1>
            <p className="text-sm text-white/60">{event.description}</p>
            <div className="flex flex-wrap gap-5 text-sm text-white/70">
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-purple-300" /> {dateText}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-purple-300" /> {event.venue}, {event.city}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/40">{locale === "fr" ? "À partir de" : "From"}</p>
                <p className="text-2xl font-black">{formatMoney(tax.grossMinor, currency, locale === "fr" ? "fr-FR" : "en-US")}</p>
                <p className="text-[10px] text-white/40">{config.taxLabel} {config.taxRate > 0 ? `${(config.taxRate * 100).toFixed(0)}%` : ""} · {currency}</p>
              </div>
              <button
                onClick={() => router.push(`/panier?event=${event.id}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-purple-500"
              >
                <Users className="h-4 w-4" /> {locale === "fr" ? "Payer à plusieurs" : "Split payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EventPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#080412]" />}><EventView /></Suspense>;
}
