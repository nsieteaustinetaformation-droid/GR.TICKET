"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, ImageIcon, MapPin, Rocket, ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { WizardSteps } from "@/components/system/WizardSteps";
import { FieldError } from "@/components/system/FieldError";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { TicketPreview3D } from "@/components/grtk/TicketPreview3D";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { Confetti } from "@/components/motion/Confetti";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { useAuth } from "@/lib/auth";
import { clearDraft, formatDraftDate, loadDraft, type EventDraft } from "@/lib/draft";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { addEvent } from "@/lib/store/events";
import { persistEvent } from "@/lib/supabase/write";
import { formatMoney, toMinor } from "@/lib/international/money";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { localDateTimeToUtc } from "@/lib/international/time";
import { validateEventForPublish } from "@/lib/validation/event";
import { useStepGuard } from "@/lib/validation/useStepGuard";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [published, setPublished] = useState(false);

  useEffect(() => { setDraft(loadDraft()); }, []);
  useStepGuard(4, draft !== null);

  const validation = useMemo(() => validateEventForPublish(draft ?? {}), [draft]);

  if (!draft) return <main className="min-h-screen bg-[var(--grtk-bg)]" />;

  const config = getCountryConfig(draft.countryCode);
  const currency = draft.currency || config.currency;
  const timeZone = draft.timeZone || config.timeZone;
  const gross = draft.ticketTypes.reduce((sum, t) => sum + toMinor(t.price, currency) * t.quantity, 0);
  const commission = Math.round(gross * DEFAULT_COMMISSION_PERCENT / 100);
  const net = gross - commission;
  const money = (amountMinor: number) => formatMoney(amountMinor, currency, config.locale);
  const dateText = `${formatDraftDate(draft.date, timeZone, config.locale)} à ${draft.startTime}`;

  async function publish() {
    setErrors({});
    setFlash(null);
    if (!validation.valid || !user) {
      setErrors(validation.errors);
      const field = validation.firstField;
      const node = field ? document.getElementById(`field-${field}`) : null;
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlash({ kind: "error", message: "Votre dossier est incomplet. Corrigez les champs signalés." });
      return;
    }

    setBusy(true);
    try {
      // Vérification serveur : même une requête directe contournant l'UI est refusée.
      const guard = await fetch("/api/v1/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const guardData = (await guard.json()) as { ok: boolean; errors?: Record<string, string>; firstField?: string | null };
      if (!guard.ok || !guardData.ok) {
        setErrors(guardData.errors ?? { form: "Publication refusée par le serveur." });
        setFlash({ kind: "error", message: "Le serveur a refusé la publication : corrigez les champs signalés." });
        return;
      }

      const current = draft;
      if (!current) return;
      const id = crypto.randomUUID();
      const event: EventItem = {
        id,
        title: current.title.trim(),
        slug: `${slugify(current.title)}-${id.slice(0, 6)}`,
        category: current.category as EventCategory,
        description: current.description.trim(),
        venue: current.venue.trim(),
        city: current.city.trim(),
        address: current.address.trim(),
        countryCode: config.countryCode,
        currency,
        timeZone,
        locale: config.locale,
        date: formatDraftDate(current.date, timeZone, config.locale),
        startAtUtc: localDateTimeToUtc(current.date, current.startTime, timeZone),
        doorsOpenTime: current.doorsOpenTime || "",
        startTime: current.startTime,
        imageUrl: current.imageUrl,
        gallery: current.gallery ?? [],
        artistName: current.title.trim(),
        organizer: user.fullName || user.email,
        status: "published",
        ticketTypes: current.ticketTypes.map((t) => ({
          id: crypto.randomUUID(),
          eventId: id,
          name: t.name.trim(),
          price: t.price,
          totalQuantity: t.quantity,
          soldQuantity: 0,
          benefits: [],
        })),
        ownerId: user.id,
        commissionPercent: DEFAULT_COMMISSION_PERCENT,
        payoutMethod: current.payoutMethod,
        payoutPhone: current.payoutPhone.trim(),
        guaranteeEnabled: true,
        splitEnabled: true,
        groupValidationMode: "all_or_nothing",
        holdHours: 24,
        branding: {
          logoUrl: current.organizerLogoUrl,
          backgroundImageUrl: current.ticketBackgroundUrl,
          primaryColor: "#7C3AED",
          secondaryColor: "#D4A22A",
          backgroundColor: "#FFFFFF",
        },
      };

      addEvent(event);
      await persistEvent(event);
      clearDraft();
      setPublished(true);
      setFlash({ kind: "success", message: "Événement publié. Redirection vers votre tableau de bord…" });
      window.setTimeout(() => router.replace("/dashboard"), 1200);
    } catch {
      setFlash({ kind: "error", message: "Publication interrompue. Votre brouillon est conservé : réessayez." });
    } finally {
      setBusy(false);
    }
  }

  const editLinks = [
    { href: "/evenements/nouveau/infos", label: "Modifier les informations", valid: validateEventForPublish(draft).errors.title === undefined },
    { href: "/evenements/nouveau/billets", label: "Modifier les billets", valid: validation.errors.ticketTypes === undefined },
    { href: "/evenements/nouveau/commission", label: "Modifier la commission", valid: validation.errors.payoutMethod === undefined },
  ];

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="relative mx-auto max-w-4xl space-y-5">
        <Confetti active={published} count={16} />
        <div className="flex items-center justify-between gap-3">
          <Link href="/evenements/nouveau/commission" className="link-underline inline-flex items-center gap-2 text-xs text-[var(--grtk-text-3)] hover:text-violet-700">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Étape précédente
          </Link>
          <ThemeToggle compact />
        </div>
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">Dernière vérification</h1>
        <p className="text-sm text-[var(--grtk-text-3)]">Étape 4 sur 4 — votre événement sera publié immédiatement après validation serveur.</p>
        <div><WizardSteps current={4} /></div>

        {flash && <StatusFlash kind={flash.kind} message={flash.message} onDone={() => setFlash(null)} />}

        <Reveal>
          <section className="overflow-hidden rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] shadow-sm">
            <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-violet-50 via-white to-violet-100">
              {draft.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img id="field-imageUrl" src={draft.imageUrl} alt="Aperçu de l'événement" className="h-full w-full object-cover" />
              ) : (
                <div id="field-imageUrl"><ImagePlaceholder icon={ImageIcon} label="Aucune couverture fournie" className="h-full w-full border-0" /></div>
              )}
            </div>
            <div className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">{draft.category || "Catégorie"}</span>
                <Link href="/evenements/nouveau/infos" className="link-underline text-[11px] font-bold uppercase tracking-wider text-violet-700">Modifier les informations</Link>
              </div>
              <h2 className="font-heading text-2xl font-black uppercase tracking-tight">{draft.title || "Nom de l'événement"}</h2>
              <p className="text-sm text-[var(--grtk-text-2)]">{draft.description || "Description"}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--grtk-text-2)]">
                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-violet-600" aria-hidden /> {dateText}</span>
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-600" aria-hidden /> {draft.venue}, {draft.city}</span>
              </div>
              <FieldError message={errors.title ?? errors.description ?? errors.imageUrl} />
            </div>
          </section>
        </Reveal>

        <Reveal delay={60}>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">Vos billets</h3>
              <Link href="/evenements/nouveau/billets" className="link-underline text-[11px] font-bold uppercase tracking-wider text-violet-700">Modifier les billets</Link>
            </div>
            {draft.ticketTypes.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 border-b border-[var(--grtk-border)] py-2 text-sm last:border-0 last:pb-0">
                <span>{t.name || "Sans nom"}</span>
                <span className="font-mono text-[var(--grtk-text-2)]">{t.quantity} × {money(toMinor(t.price, currency))}</span>
              </div>
            ))}
            <FieldError message={errors.ticketTypes} />
          </section>
        </Reveal>

        <Reveal delay={100}>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">Votre reversement</h3>
              <Link href="/evenements/nouveau/commission" className="link-underline text-[11px] font-bold uppercase tracking-wider text-violet-700">Modifier la commission</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><p className="text-[11px] uppercase text-[var(--grtk-text-3)]">Ventes potentielles</p><p className="mt-1 font-heading text-lg font-black">{money(gross)}</p></div>
              <div><p className="text-[11px] uppercase text-rose-700">Commission {DEFAULT_COMMISSION_PERCENT} %</p><p className="mt-1 font-heading text-lg font-black text-rose-700">− {money(commission)}</p></div>
              <div><p className="text-[11px] uppercase text-emerald-700">Vous recevez</p><p className="mt-1 font-heading text-lg font-black text-emerald-700">{money(net)}</p></div>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-[var(--grtk-text-2)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              Reversement prévu via {draft.payoutMethod} vers <strong>{draft.payoutPhone || "numéro non renseigné"}</strong>.
            </p>
            <FieldError message={errors.payoutMethod ?? errors.payoutPhone ?? errors.accepted} />
          </section>
        </Reveal>

        <Reveal delay={140}>
          <section className="rounded-3xl border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] p-4 sm:p-6">
            <TicketPreview3D
              eventTitle={draft.title || "Nom de l'événement"}
              dateText={dateText}
              venue={draft.venue}
              city={draft.city}
              category={draft.category || "Événement"}
              priceText={money(toMinor(draft.ticketTypes[0]?.price ?? 0, currency))}
              primaryColor="#7C3AED"
              locale={config.locale}
            />
          </section>
        </Reveal>

        <div className="flex flex-wrap gap-2">
          {editLinks.filter((link) => !link.valid).map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-[11px] font-bold uppercase text-amber-800">
              {link.label} — à compléter
            </Link>
          ))}
        </div>

        {!validation.valid && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800">
            {Object.keys(validation.errors).length} point(s) à corriger avant publication : {Object.values(validation.errors).slice(0, 3).join(" ")}
          </p>
        )}

        <MagneticButton
          onClick={() => void publish()}
          disabled={busy || !validation.valid}
          className={`btn-neon-purple flex w-full items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider ${busy || !validation.valid ? "opacity-50" : ""}`}
        >
          {published ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Rocket className="h-4 w-4" aria-hidden />}
          {busy ? "Publication en cours…" : published ? "Événement publié" : "Publier mon événement"}
          {!busy && !published && <ArrowRight className="h-4 w-4" aria-hidden />}
        </MagneticButton>
      </div>
    </main>
  );
}

export default function ApercuPage() {
  return <RequireAuth><ApercuWizard /></RequireAuth>;
}
