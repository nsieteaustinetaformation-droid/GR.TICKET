"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, CreditCard, ShieldCheck, Users,
} from "lucide-react";
import { FieldError } from "@/components/system/FieldError";
import { TrustPanel } from "@/components/trust/TrustPanel";
import { PriceBreakdown } from "@/components/trust/PriceBreakdown";
import { TicketPreview3D } from "@/components/grtk/TicketPreview3D";
import { Confetti } from "@/components/motion/Confetti";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/motion/Skeleton";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { createOrderFromPurchase } from "@/lib/ticket-engine";
import { addOrder } from "@/lib/store/orders";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { applyTax, formatMoney, toMajor, toMinor } from "@/lib/international/money";
import { formatInZone } from "@/lib/international/time";
import { normalizeLocale } from "@/lib/international/messages";
import { getEventById, restoreLocalEvents } from "@/lib/store/events";
import type { EventItem } from "@/lib/types";

type Step = 1 | 2 | 3;
type Errors = Record<string, string>;

const STEP_FIELDS: Record<Step, string[]> = {
  1: ["ticketTypeId", "quantity"],
  2: ["buyerName", "buyerPhone", "email"],
  3: ["paymentMethod", "accepted"],
};

function Cart() {
  const params = useSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [groupInitiator, setGroupInitiator] = useState("");
  const [groupError, setGroupError] = useState("");

  useEffect(() => {
    restoreLocalEvents();
    const found = getEventById(params.get("event") ?? "") ?? null;
    setEvent(found);
    if (found?.ticketTypes[0]) setTicketTypeId(found.ticketTypes[0].id);
  }, [params]);

  const config = getCountryConfig(event?.countryCode);
  const currency = event?.currency ?? config.currency;
  const intlLocale = normalizeLocale(event?.locale ?? config.locale) === "fr" ? "fr-FR" : "en-US";
  const selectedType = useMemo(
    () => event?.ticketTypes.find((t) => t.id === ticketTypeId) ?? event?.ticketTypes[0],
    [event, ticketTypeId]
  );
  const unitMinor = toMinor(selectedType?.price ?? 0, currency, intlLocale);
  const subtotal = unitMinor * quantity;
  const tax = applyTax(subtotal, config.taxRate, config.taxMode);
  const commission = Math.round(tax.grossMinor * (event?.commissionPercent ?? DEFAULT_COMMISSION_PERCENT) / 100);
  const available = selectedType ? selectedType.totalQuantity - selectedType.soldQuantity : 0;
  const dateText = event?.startAtUtc
    ? formatInZone(event.startAtUtc, event.timeZone ?? config.timeZone, intlLocale)
    : `${event?.date ?? ""} ${event?.startTime ?? ""}`;

  function validateCurrent(target: Step): Errors {
    const next: Errors = {};
    if (target >= 1) {
      if (!ticketTypeId) next.ticketTypeId = "Choisissez un type de billet.";
      if (!Number.isInteger(quantity) || quantity < 1) next.quantity = "Choisissez au moins 1 place.";
      else if (selectedType && quantity > available) next.quantity = `Plus que ${available} place(s) disponible(s).`;
    }
    if (target >= 2) {
      if (buyerName.trim().length < 2) next.buyerName = "Indiquez le nom du titulaire.";
      if (!/^[+0-9 ().-]{6,}$/.test(buyerPhone.trim())) next.buyerPhone = "Indiquez un numéro valide.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Indiquez une adresse e-mail valide.";
    }
    if (target >= 3) {
      if (!config.paymentMethods.some((m) => m.toLowerCase() === paymentMethod.toLowerCase())) {
        next.paymentMethod = "Choisissez un moyen de paiement disponible.";
      }
      if (!accepted) next.accepted = "Acceptez les conditions d'achat et la garantie.";
    }
    return next;
  }

  function revealFirstError(next: Errors): void {
    const field = STEP_FIELDS[step].find((name) => next[name]);
    const node = field ? document.getElementById(`field-${field}`) : null;
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    node?.focus?.({ preventScroll: true });
  }

  function continueTo(nextStep: Step): void {
    const next = validateCurrent(step);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      revealFirstError(next);
      return;
    }
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function pay(): Promise<void> {
    const next = validateCurrent(3);
    setErrors(next);
    if (Object.keys(next).length > 0 || !event || !selectedType) {
      revealFirstError(next);
      return;
    }
    setBusy(true);
    setFlash(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const order = createOrderFromPurchase({
        event,
        ticketType: { ...selectedType, price: toMajor(tax.grossMinor, currency, intlLocale) },
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        paymentMethod,
        quantity,
      });
      addOrder(order);
      setOrderId(order.tickets[0]?.id ?? null);
      setFlash({ kind: "success", message: `Paiement accepté. ${quantity} billet(s) généré(s).` });
    } catch {
      setFlash({ kind: "error", message: "Le paiement a échoué. Aucun montant n'a été débité. Réessayez." });
    } finally {
      setBusy(false);
    }
  }

  async function createGroup(): Promise<void> {
    if (!event || groupInitiator.trim().length < 2) {
      setGroupError("Indiquez votre nom pour créer le groupe.");
      return;
    }
    setGroupError("");
    try {
      const res = await fetch("/api/v1/groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          initiatorName: groupInitiator.trim(),
          countryCode: config.countryCode,
          currency,
          validationMode: event.groupValidationMode ?? "all_or_nothing",
          unitAmountMinor: tax.grossMinor,
          quantity,
          capacity: event.ticketTypes.reduce((sum, item) => sum + item.totalQuantity, 0),
          holdHours: event.holdHours ?? 24,
        }),
      });
      const data = (await res.json()) as { ok: boolean; group?: { token: string }; error?: string };
      if (!res.ok || !data.group) {
        setGroupError(data.error ?? "Impossible de créer le groupe.");
        return;
      }
      router.push(`/groupe/${data.group.token}`);
    } catch {
      setGroupError("Erreur réseau. Réessayez.");
    }
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  const steps: Array<{ n: Step; label: string }> = [
    { n: 1, label: "Billets" },
    { n: 2, label: "Coordonnées" },
    { n: 3, label: "Paiement" },
  ];
  const progress = Math.round(((step - 1) / 3) * 100) + (orderId ? 33 : 0);

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="relative mx-auto max-w-5xl space-y-6">
        <Confetti active={Boolean(orderId)} count={18} />
        <div className="flex items-center justify-between gap-3">
          <Link href={`/evenements/${event.slug}`} className="link-underline inline-flex items-center gap-2 text-xs text-[var(--grtk-text-3)] hover:text-violet-700">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Événement
          </Link>
          <ThemeToggle compact />
        </div>

        <h1 className="font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">Panier</h1>

        <nav aria-label="Étapes de l'achat" className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 shadow-sm">
          <div className="mb-2 flex justify-between text-[11px] font-bold uppercase tracking-wider">
            <span>Progression</span>
            <span>{Math.min(100, progress)} %</span>
          </div>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, progress)} className="h-2 overflow-hidden rounded-full bg-[var(--grtk-surface-2)]">
            <div className="h-full rounded-full bg-violet-600 transition-[width] duration-300" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <ol className="mt-4 flex flex-wrap gap-2">
            {steps.map((item) => (
              <li key={item.n} className={`inline-flex min-touch-target items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${item.n === step ? "border-violet-600 bg-violet-600 text-white" : item.n < step ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-[var(--grtk-border)] text-[var(--grtk-text-3)]"}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                  {item.n < step ? <Check className="h-3 w-3" aria-hidden /> : item.n}
                </span>
                {item.label}
              </li>
            ))}
          </ol>
        </nav>

        {flash && <StatusFlash kind={flash.kind} message={flash.message} onDone={() => setFlash(null)} />}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm">
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-heading text-lg font-bold uppercase">1. Choisissez vos billets</h2>
                <p className="text-xs text-[var(--grtk-text-3)]">{event.title} · {dateText}</p>
                <div className="space-y-2">
                  {event.ticketTypes.map((type) => (
                    <button
                      key={type.id}
                      id={type.id === ticketTypeId ? "field-ticketTypeId" : undefined}
                      onClick={() => { setTicketTypeId(type.id); setErrors((e) => ({ ...e, ticketTypeId: "" })); }}
                      aria-pressed={type.id === ticketTypeId}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${type.id === ticketTypeId ? "border-violet-600 bg-violet-50" : "border-[var(--grtk-border)] hover:border-violet-400"}`}
                    >
                      <span>
                        <span className="block text-sm font-bold">{type.name}</span>
                        <span className="text-[11px] text-[var(--grtk-text-3)]">{type.totalQuantity - type.soldQuantity} disponible(s)</span>
                      </span>
                      <span className="font-mono font-black text-violet-700">{formatMoney(toMinor(type.price, currency, intlLocale), currency, intlLocale)}</span>
                    </button>
                  ))}
                </div>
                <FieldError message={errors.ticketTypeId} />
                <div className="flex items-center justify-between border-y border-[var(--grtk-border)] py-4">
                  <label htmlFor="field-quantity" className="text-sm font-semibold">Nombre de places</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="min-touch-target h-10 w-10 rounded-lg border border-[var(--grtk-border)] text-lg" aria-label="Retirer une place">−</button>
                    <input id="field-quantity" type="number" min={1} max={available} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-14 rounded-lg border border-[var(--grtk-border)] bg-transparent px-2 py-2 text-center font-mono font-bold" />
                    <button onClick={() => setQuantity((q) => Math.min(available, q + 1))} className="min-touch-target h-10 w-10 rounded-lg border border-[var(--grtk-border)] text-lg" aria-label="Ajouter une place">+</button>
                  </div>
                </div>
                <FieldError message={errors.quantity} />
                <MagneticButton onClick={() => continueTo(2)} className="btn-neon-purple inline-flex w-full items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider">
                  Continuer <ArrowRight className="h-4 w-4" aria-hidden />
                </MagneticButton>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-heading text-lg font-bold uppercase">2. Vos coordonnées</h2>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Nom du titulaire</span>
                  <input id="field-buyerName" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Ex : Alice Martin" className="field" />
                  <FieldError message={errors.buyerName} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Téléphone</span>
                  <input id="field-buyerPhone" type="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="field" />
                  <FieldError message={errors.buyerPhone} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">E-mail</span>
                  <input id="field-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alice@example.com" className="field" />
                  <FieldError message={errors.email} />
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="magnetic-btn rounded-xl border border-[var(--grtk-border)] px-5 py-3 text-xs font-bold uppercase">Retour</button>
                  <MagneticButton onClick={() => continueTo(3)} className="btn-neon-purple flex-1 py-3 text-xs font-bold uppercase tracking-wider">Continuer vers le paiement</MagneticButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-heading text-lg font-bold uppercase">3. Paiement sécurisé</h2>
                <div className="space-y-2">
                  {config.paymentMethods.map((method) => (
                    <button
                      key={method}
                      id={method.toLowerCase() === paymentMethod ? "field-paymentMethod" : undefined}
                      onClick={() => { setPaymentMethod(method.toLowerCase()); setErrors((e) => ({ ...e, paymentMethod: "" })); }}
                      aria-pressed={method.toLowerCase() === paymentMethod}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors ${method.toLowerCase() === paymentMethod ? "border-violet-600 bg-violet-50" : "border-[var(--grtk-border)] hover:border-violet-400"}`}
                    >
                      <CreditCard className="h-4 w-4 text-violet-600" aria-hidden />
                      <span className="font-semibold">{method}</span>
                      {method.toLowerCase() === paymentMethod && <Check className="ml-auto h-4 w-4 text-violet-700" aria-hidden />}
                    </button>
                  ))}
                </div>
                <FieldError message={errors.paymentMethod} />
                <label className="flex items-start gap-3 rounded-xl border border-[var(--grtk-border)] p-4 text-xs">
                  <input id="field-accepted" type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); setErrors((er) => ({ ...er, accepted: "" })); }} className="mt-0.5 h-4 w-4 accent-violet-600" />
                  <span>J&apos;accepte les conditions d&apos;achat et la garantie GRTK : si mon billet ne passe pas, je suis remboursé.</span>
                </label>
                <FieldError message={errors.accepted} />
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="magnetic-btn rounded-xl border border-[var(--grtk-border)] px-5 py-3 text-xs font-bold uppercase">Retour</button>
                  <MagneticButton onClick={() => void pay()} disabled={busy} className="btn-neon-purple flex-1 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50">
                    {busy ? "Paiement en cours…" : `Payer ${formatMoney(tax.grossMinor, currency, intlLocale)}`}
                  </MagneticButton>
                </div>
                {orderId && (
                  <Link href={`/billet/${orderId}`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-xs font-bold uppercase text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Voir mon billet
                  </Link>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <PriceBreakdown
              currency={currency}
              locale={intlLocale}
              subtotalMinor={subtotal}
              taxMinor={tax.taxMinor}
              taxLabel={config.taxLabel}
              totalMinor={tax.grossMinor}
              commissionMinor={commission}
              commissionLabel={`Commission reversée à l'organisateur (${event.commissionPercent ?? DEFAULT_COMMISSION_PERCENT} %)`}
            />
            <TrustPanel
              countryCode={event.countryCode}
              paymentMethods={config.paymentMethods}
              organizerName={event.organizer}
              organizerVerified={Boolean(event.ownerId)}
              organizerLogoUrl={event.branding?.logoUrl}
              locale={intlLocale}
            />
            <Reveal>
              <TicketPreview3D
                eventTitle={event.title}
                dateText={dateText}
                venue={event.venue}
                city={event.city}
                category={event.category}
                priceText={formatMoney(tax.grossMinor, currency, intlLocale)}
                primaryColor={event.branding?.primaryColor}
                locale={intlLocale}
              />
            </Reveal>
          </aside>
        </div>

        {event.splitEnabled !== false && (
          <Reveal delay={120}>
            <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6">
              <h2 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
                <Users className="h-4 w-4 text-violet-600" aria-hidden /> Payer à plusieurs
              </h2>
              <p className="mt-1 text-xs text-[var(--grtk-text-3)]">
                Chaque participant paie sa part. Les places sont réservées {event.holdHours ?? 24} h, puis libérées si le groupe ne paie pas.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  id="field-groupInitiator"
                  value={groupInitiator}
                  onChange={(e) => setGroupInitiator(e.target.value)}
                  placeholder="Votre nom"
                  aria-label="Votre nom pour le paiement de groupe"
                  className="field flex-1"
                />
                <button onClick={() => void createGroup()} className="magnetic-btn rounded-xl border border-violet-600 px-5 py-3 text-xs font-bold uppercase text-violet-700 hover:bg-violet-50">
                  Créer le lien de groupe
                </button>
              </div>
              {groupError && <FieldError message={groupError} />}
              <p className="mt-3 flex items-center gap-2 text-[11px] text-[var(--grtk-text-3)]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> Mode par défaut : tout le monde paie, ou personne n&apos;est débité.
              </p>
            </section>
          </Reveal>
        )}
      </div>
    </main>
  );
}

export default function CartPage() {
  return <Suspense fallback={<main className="min-h-screen bg-white" />}><Cart /></Suspense>;
}
