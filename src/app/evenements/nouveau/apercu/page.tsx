"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Rocket, ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { useAuth } from "@/lib/auth";
import { clearDraft, formatDraftDate, loadDraft, type EventDraft } from "@/lib/draft";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { addEvent } from "@/lib/store/events";
import { persistEvent } from "@/lib/supabase/write";
import { formatMoney, toMinor } from "@/lib/international/money";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { localDateTimeToUtc } from "@/lib/international/time";
import type { EventCategory, EventItem } from "@/lib/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "evenement";
}

function ApercuWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<EventDraft | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setDraft(loadDraft()); }, []);

  if (!draft) return <main className="min-h-screen bg-white" />;

  const config = getCountryConfig(draft.countryCode);
  const currency = draft.currency || config.currency;
  const timeZone = draft.timeZone || config.timeZone;
  const gross = draft.ticketTypes.reduce((sum, t) => sum + toMinor(t.price, currency) * t.quantity, 0);
  const commission = Math.round(gross * DEFAULT_COMMISSION_PERCENT / 100);
  const net = gross - commission;
  const money = (amountMinor: number) => formatMoney(amountMinor, currency, config.locale);
  const incomplete = !draft.title.trim() || !draft.category || !draft.city || !draft.date || !draft.startTime || !draft.venue.trim();

  async function publish() {
    if (!draft || !user || incomplete || !draft.accepted) {
      setError("Votre dossier est incomplet. Revenez aux étapes précédentes.");
      return;
    }

    setBusy(true);
    const id = crypto.randomUUID();
    const event: EventItem = {
      id,
      title: draft.title.trim(),
      slug: `${slugify(draft.title)}-${id.slice(0, 6)}`,
      category: draft.category as EventCategory,
      description: draft.description.trim(),
      venue: draft.venue.trim(),
      city: draft.city.trim(),
      address: draft.address.trim(),
      countryCode: config.countryCode,
      currency,
      timeZone,
      locale: config.locale,
      date: formatDraftDate(draft.date, timeZone, config.locale),
      startAtUtc: localDateTimeToUtc(draft.date, draft.startTime, timeZone),
      doorsOpenTime: draft.doorsOpenTime || "",
      startTime: draft.startTime,
      imageUrl: draft.imageUrl,
      artistName: draft.title.trim(),
      organizer: user.fullName || user.email,
      status: "published",
      ticketTypes: draft.ticketTypes.map((t) => ({
        id: crypto.randomUUID(),
        eventId: id,
        name: t.name.trim(),
        price: t.price,
        totalQuantity: t.quantity,
        soldQuantity: 0,
        benefits: [],
      })),
      ownerId: user.id,
      commissionPercent: 10,
      payoutMethod: draft.payoutMethod,
      payoutPhone: draft.payoutPhone.trim(),
      guaranteeEnabled: true,
      splitEnabled: true,
      groupValidationMode: "all_or_nothing",
      holdHours: 24,
      branding: {
        primaryColor: "#8B5CF6",
        secondaryColor: "#D4A22A",
        backgroundColor: "#FFFFFF",
      },
    };

    addEvent(event);
    await persistEvent(event);
    clearDraft();
    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/evenements/nouveau/commission" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Étape précédente
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-6">Dernière vérification</h1>
        <p className="text-sm text-slate-500 mt-1">Étape 4 sur 4 — votre événement sera publié immédiatement.</p>
        <div className="mt-8"><WizardSteps current={4} /></div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draft.imageUrl} alt="Aperçu de l'événement" className="h-40 w-full object-cover opacity-80" />
            <div className="p-6 sm:p-8 space-y-4">
              <span className="inline-block rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                {draft.category || "Catégorie"}
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">{draft.title || "Nom de l'événement"}</h2>
              <p className="text-sm text-slate-600">{draft.description || "Description"}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-violet-600" /> {formatDraftDate(draft.date)} à {draft.startTime}</span>
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-600" /> {draft.venue}, {draft.city}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 sm:p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Vos billets</h3>
            {draft.ticketTypes.map((t) => (
              <div key={t.id} className="flex items-center justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0 text-sm">
                <span>{t.name || "Sans nom"}</span>
                <span className="font-mono text-slate-600">{t.quantity} × {money(toMinor(t.price, currency))}</span>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase text-slate-500">Ventes potentielles</p>
              <p className="text-lg font-black mt-1 text-slate-900">{money(gross)}</p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-[11px] uppercase text-red-600">Commission {DEFAULT_COMMISSION_PERCENT} %</p>
              <p className="text-lg font-black mt-1 text-red-600">− {money(commission)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[11px] uppercase text-emerald-700">Vous recevez</p>
              <p className="text-lg font-black mt-1 text-emerald-700">{money(net)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>
              Reversement prévu via {draft.payoutMethod.toUpperCase()} vers{" "}
              <strong className="text-slate-900">{draft.payoutPhone || "numéro non renseigné"}</strong>.
              Vous pourrez vendre des billets depuis le Guichet Express et contrôler les entrées avec le Scanner.
            </span>
          </div>

          {incomplete && (
            <p className="text-xs text-amber-700">Certaines informations manquent. Retournez à l’étape 1 pour les compléter.</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="button"
            onClick={publish}
            disabled={busy || incomplete}
            className="w-full rounded-xl bg-violet-600 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            <Rocket className="w-4 h-4" />
            {busy ? "Publication en cours…" : "Publier mon événement"}
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ApercuPage() {
  return <RequireAuth><ApercuWizard /></RequireAuth>;
}
