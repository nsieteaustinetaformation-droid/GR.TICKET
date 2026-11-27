"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Check, ImageIcon, MapPin, ShieldCheck, Ticket as TicketIcon, Users,
} from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { TicketPreview3D } from "@/components/grtk/TicketPreview3D";
import { TrustPanel } from "@/components/trust/TrustPanel";
import { CursorHalo } from "@/components/motion/CursorHalo";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/motion/Skeleton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { formatMoney, toMinor, applyTax } from "@/lib/international/money";
import { formatInZone } from "@/lib/international/time";
import { normalizeLocale, translate, type Locale } from "@/lib/international/messages";
import { getEventBySlug, restoreLocalEvents } from "@/lib/store/events";
import type { EventItem } from "@/lib/types";

function EventView() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [locale, setLocale] = useState<Locale>("fr");

  useEffect(() => {
    restoreLocalEvents();
    const found = getEventBySlug(slug) ?? null;
    setEvent(found);
    if (found?.locale) setLocale(normalizeLocale(found.locale));
  }, [slug]);

  if (!event) {
    return (
      <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </main>
    );
  }

  const config = getCountryConfig(event.countryCode);
  const currency = event.currency ?? config.currency;
  const timeZone = event.timeZone ?? config.timeZone;
  const resolvedLocale = normalizeLocale(locale);
  const intlLocale = resolvedLocale === "fr" ? "fr-FR" : "en-US";
  const unit = event.ticketTypes.reduce((min, t) => Math.min(min, t.price), Infinity);
  const priceMinor = toMinor(Number.isFinite(unit) ? unit : 0, currency, config.locale);
  const tax = applyTax(priceMinor, config.taxRate, config.taxMode);
  const dateText = event.startAtUtc
    ? formatInZone(event.startAtUtc, timeZone, intlLocale)
    : `${event.date} ${event.startTime}`;
  const gallery = event.gallery ?? [];
  const primaryColor = event.branding?.primaryColor ?? "#7C3AED";

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="link-underline inline-flex items-center gap-2 text-xs text-[var(--grtk-text-3)] hover:text-violet-700">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Tableau de bord
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-1 text-[10px] font-bold uppercase text-[var(--grtk-text-3)]">
              {(["fr", "en"] as Locale[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setLocale(item)}
                  aria-pressed={locale === item}
                  className={`rounded-lg px-2 py-1 transition-colors ${locale === item ? "bg-violet-600 text-white" : "hover:text-violet-700"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <ThemeToggle compact />
          </div>
        </div>

        <section className="relative isolate overflow-hidden rounded-3xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] shadow-[var(--shadow-2)]">
          <CursorHalo />
          <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-violet-100 sm:h-72">
            {event.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.imageUrl}
                alt={event.title}
                className={`h-full w-full object-cover ${event.branding?.backgroundImageUrl ? "opacity-90" : ""}`}
              />
            ) : (
              <ImagePlaceholder icon={ImageIcon} label="Aucune couverture fournie" className="h-full w-full border-0" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
            {event.branding?.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.branding.logoUrl} alt="Logo de l'événement" className="absolute left-5 top-5 h-14 w-14 rounded-xl bg-white object-contain p-1 shadow-md" />
            )}
          </div>
          <div className="relative z-10 space-y-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <GuaranteeBadge locale={resolvedLocale} withTooltip />
              <span className="rounded-full border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">
                {event.category}
              </span>
            </div>
            <h1 className="font-heading text-3xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
              {event.title}
            </h1>
            {event.subtitle && <p className="text-sm font-semibold text-violet-700">{event.subtitle}</p>}
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--grtk-text-2)]">{event.description}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--grtk-text-2)]">
              <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-violet-600" aria-hidden /> {dateText}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-600" aria-hidden /> {event.venue}, {event.city}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-[var(--grtk-border)] pt-5">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[var(--grtk-text-3)]">
                  {translate(resolvedLocale, "event.from")}
                </p>
                <p className="font-heading text-3xl font-black tracking-tight" style={{ color: primaryColor }}>
                  {formatMoney(tax.grossMinor, currency, intlLocale)}
                </p>
                <p className="text-[10px] text-[var(--grtk-text-3)]">
                  {config.taxLabel} {config.taxRate > 0 ? `${(config.taxRate * 100).toFixed(0)} %` : ""} · {currency}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <MagneticButton
                  onClick={() => router.push(`/panier?event=${event.id}`)}
                  className="btn-neon-purple inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider"
                >
                  <TicketIcon className="h-4 w-4" aria-hidden /> {translate(resolvedLocale, "event.buy")}
                </MagneticButton>
                {event.splitEnabled !== false && (
                  <button
                    onClick={() => router.push(`/groupe/nouveau?event=${event.id}`)}
                    className="magnetic-btn inline-flex min-touch-target items-center gap-2 rounded-xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] px-5 py-3 text-xs font-bold uppercase tracking-wider hover:border-violet-600 hover:text-violet-700"
                  >
                    <Users className="h-4 w-4" aria-hidden /> {translate(resolvedLocale, "event.split")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <Reveal delay={60}>
          <section aria-label="Aperçu du billet" className="rounded-3xl border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] p-4 sm:p-6">
            <TicketPreview3D
              eventTitle={event.title}
              dateText={dateText}
              venue={event.venue}
              city={event.city}
              category={event.category}
              priceText={formatMoney(tax.grossMinor, currency, intlLocale)}
              primaryColor={primaryColor}
              locale={resolvedLocale}
            />
          </section>
        </Reveal>

        {gallery.length > 0 && (
          <Reveal delay={100}>
            <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5">
              <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide">Galerie</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gallery.map((url, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${url.slice(0, 32)}-${index}`} src={url} alt={`${event.title} — photo ${index + 1}`} className="aspect-video w-full rounded-xl border border-[var(--grtk-border)] object-cover" />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal delay={140}>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5">
            <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden /> Vos billets, vos garanties
            </h2>
            <ul className="grid gap-3 text-xs text-[var(--grtk-text-2)] sm:grid-cols-3">
              {[
                "Prix affiché sans frais cachés",
                "QR dynamique généré après paiement",
                "Réclamation possible en cas de scan refusé",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden /> {item}
                </li>
              ))}
            </ul>
            <Link href="/comment-ca-marche" className="link-underline mt-4 inline-block text-xs font-bold uppercase tracking-wider text-violet-700">
              Comment ça marche →
            </Link>
          </section>
        </Reveal>

        <Reveal delay={180}>
          <TrustPanel
            countryCode={event.countryCode}
            paymentMethods={config.paymentMethods}
            organizerName={event.organizer}
            organizerVerified={Boolean(event.ownerId)}
            organizerLogoUrl={event.branding?.logoUrl}
            locale={resolvedLocale}
          />
        </Reveal>
      </div>
    </main>
  );
}

export default function EventPage() {
  return <Suspense fallback={<main className="min-h-screen bg-white" />}><EventView /></Suspense>;
}
