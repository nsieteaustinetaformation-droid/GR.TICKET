import type { CSSProperties, JSX } from "react";
import {
  CalendarDays,
  MapPin,
  QrCode,
  Ticket as TicketIcon,
  type LucideIcon,
} from "lucide-react";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { RealisticTicket3D } from "@/components/grtk/RealisticTicket3D";
import { normalizeLocale, translate, type Locale } from "@/lib/international/messages";
import { cn } from "@/lib/utils";

interface Props {
  eventTitle: string;
  dateText: string;
  venue: string;
  city: string;
  category: string;
  priceText: string;
  primaryColor?: string;
  holderName?: string;
  ticketNumber?: string;
  locale?: string;
  className?: string;
}

const faceClass =
  "w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--grtk-border)] bg-[var(--grtk-surface)] text-[var(--grtk-text)]";

function Brand({ primaryColor }: { primaryColor: string }): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <TicketIcon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-xs font-black uppercase tracking-[0.2em]">GRTK</span>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">
        <Icon className="h-3.5 w-3.5 shrink-0 [color:var(--grtk-accent)]" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--grtk-text)]">{value}</p>
    </div>
  );
}

function QrPlaceholder(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-[var(--grtk-border-strong)] bg-[var(--grtk-surface)]"
    >
      <QrCode className="h-10 w-10 text-[var(--grtk-text-3)]" />
    </div>
  );
}

function AccessStub({ locale, flipHint = false }: { locale: Locale; flipHint?: boolean }): JSX.Element {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-3 border-t border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] p-5 md:w-64 md:border-l md:border-t-0">
      <p className="text-[10px] font-bold uppercase tracking-widest [color:var(--grtk-accent)]">
        {translate(locale, "trust.accessControl")}
      </p>
      <QrPlaceholder />
      <p className="text-center text-[10px] leading-snug text-[var(--grtk-text-3)]">
        {translate(locale, "trust.qrAfterPayment")}
      </p>
      {flipHint && (
        <p className="text-center text-[9px] font-bold uppercase tracking-wider [color:var(--grtk-accent)]">
          {translate(locale, "trust.flipHint")}
        </p>
      )}
    </div>
  );
}

export function TicketPreview3D({
  eventTitle,
  dateText,
  venue,
  city,
  category,
  priceText,
  primaryColor = "#7C3AED",
  holderName,
  ticketNumber,
  locale = "fr",
  className,
}: Props): JSX.Element {
  const resolved = normalizeLocale(locale);
  const holder = holderName?.trim() || translate(resolved, "trust.placeholderName");
  const number = ticketNumber?.trim() || translate(resolved, "trust.ticketNumberPending");
  const location = [venue, city].filter(Boolean).join(", ");
  const accentStyle = { "--grtk-accent": primaryColor } as CSSProperties;

  const front = (
    <div style={accentStyle} className={faceClass}>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--grtk-border)] pb-4 pr-10">
            <Brand primaryColor={primaryColor} />
            <GuaranteeBadge locale={resolved} compact withTooltip={false} />
          </div>

          <h3 className="mt-5 font-heading text-2xl font-black uppercase leading-tight sm:text-3xl">
            {eventTitle}
          </h3>
          <span className="mt-3 inline-flex rounded-md border border-[var(--grtk-violet-100)] bg-[var(--grtk-violet-50)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--grtk-violet-700)]">
            {category}
          </span>

          <div className="my-5 grid gap-4 border-y border-[var(--grtk-border)] py-4 text-xs sm:grid-cols-2">
            <Info
              icon={CalendarDays}
              label={translate(resolved, "trust.dateLabel")}
              value={dateText}
            />
            <Info icon={MapPin} label={translate(resolved, "trust.venueLabel")} value={location} />
            <div className="sm:col-span-2">
              <Info icon={TicketIcon} label={translate(resolved, "ticket.holder")} value={holder} />
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--grtk-text-3)]">
                {translate(resolved, "ticket.number")}
              </p>
              <p className="mt-1 font-mono text-sm font-bold tracking-wider [color:var(--grtk-accent)]">
                {number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-[var(--grtk-text-3)]">
                {translate(resolved, "ticket.price")}
              </p>
              <p className="font-mono text-2xl font-black">{priceText}</p>
            </div>
          </div>
        </div>

        <AccessStub locale={resolved} flipHint />
      </div>
    </div>
  );

  const back = (
    <div style={accentStyle} className={faceClass}>
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--grtk-border)] px-5 py-4 pr-12 sm:px-7 sm:pr-12">
        <Brand primaryColor={primaryColor} />
        <GuaranteeBadge locale={resolved} compact withTooltip={false} />
      </div>

      <div className="p-5 sm:p-7">
        <h3 className="font-heading text-xl font-black uppercase leading-tight sm:text-2xl">
          {eventTitle}
        </h3>
        <span className="mt-2 inline-flex rounded-md border border-[var(--grtk-violet-100)] bg-[var(--grtk-violet-50)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--grtk-violet-700)]">
          {category}
        </span>

        <div className="my-4 grid gap-3 border-y border-[var(--grtk-border)] py-4 text-xs sm:grid-cols-2">
          <Info icon={CalendarDays} label={translate(resolved, "trust.dateLabel")} value={dateText} />
          <Info icon={MapPin} label={translate(resolved, "trust.venueLabel")} value={location} />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 gap-3 text-xs sm:grid-cols-3">
            <Info icon={TicketIcon} label={translate(resolved, "ticket.holder")} value={holder} />
            <Info icon={QrCode} label={translate(resolved, "ticket.number")} value={number} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">
                {translate(resolved, "ticket.price")}
              </p>
              <p className="mt-1 font-mono text-sm font-bold">{priceText}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <QrPlaceholder />
            <p className="max-w-[190px] text-center text-[10px] font-semibold leading-snug text-[var(--grtk-text-2)]">
              {translate(resolved, "trust.presentQrInApp")}
            </p>
            <p className="text-center text-[9px] uppercase tracking-wider text-[var(--grtk-text-3)]">
              {translate(resolved, "trust.qrAfterPayment")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("mx-auto w-full max-w-3xl px-4 pb-10", className)}>
      <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--grtk-text-3)]">
        {translate(resolved, "trust.preview")}
      </p>
      <RealisticTicket3D edgeColor={primaryColor} flippable back={back}>
        {front}
      </RealisticTicket3D>
    </div>
  );
}
