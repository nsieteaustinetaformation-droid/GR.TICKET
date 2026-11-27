"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, MessageCircle, Share2, ShieldCheck } from "lucide-react";
import { FieldError } from "@/components/system/FieldError";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/motion/Skeleton";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { normalizeLocale, paymentMethodLabel, translate, type Locale } from "@/lib/international/messages";
import { formatMoney } from "@/lib/international/money";
import { paymentInviteMessage, paymentLink, smsUrl, whatsappUrl } from "@/lib/sharing";
import type { GroupPayment, GroupShare } from "@/lib/types";

interface GroupData {
  group: GroupPayment;
  shares: GroupShare[];
  held: number;
}

interface PayResult {
  ok: boolean;
  ticket?: { id: string };
  replayed?: boolean;
  error?: string;
}

export default function PayerClient({ token, shareId }: { token: string; shareId: string }) {
  const [data, setData] = useState<GroupData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [method, setMethod] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nameError, setNameError] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/v1/groups/${token}`);
    if (!res.ok) {
      setNotFound(true);
      return;
    }
    const next = (await res.json()) as GroupData;
    setData(next);
    const share = next.shares.find((item) => item.id === shareId);
    if (share?.status === "paid" && share.ticketId) setTicketId(share.ticketId);
  }, [token, shareId]);

  useEffect(() => {
    // Diffère la lecture d'un tick : évite un setState synchrone dans l'effet.
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
        <div className="mx-auto max-w-xl rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-8 text-center shadow-sm">
          <h1 className="font-heading text-2xl font-black">Lien de paiement introuvable</h1>
          <p className="mt-2 text-sm text-[var(--grtk-text-2)]">
            Ce lien a expiré ou le groupe n&apos;est plus disponible. Demandez un nouveau lien à l&apos;organisateur.
          </p>
          <Link href="/" className="link-underline mt-5 inline-block text-xs font-bold uppercase text-violet-700">
            Retour à l&apos;accueil →
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-56 w-full" />
        </div>
      </main>
    );
  }

  const { group } = data;
  const share = data.shares.find((item) => item.id === shareId);
  const config = getCountryConfig(group.countryCode);
  const locale: Locale = normalizeLocale(config.locale);
  const paymentMethods = config.paymentMethods.length > 0 ? config.paymentMethods : ["card"];
  const defaultMethod = paymentMethods[0];
  const amount = share ? formatMoney(share.amountMinor, group.currency, locale) : "";
  const link = paymentLink(token, shareId);
  const invite = share
    ? paymentInviteMessage({
        locale,
        name: share.holderName ?? "à tous",
        initiator: group.initiatorName,
        amount,
        eventTitle: group.eventTitle,
        link,
      })
    : "";

  async function pay() {
    if (!share) return;
    if (name.trim().length < 2) {
      setNameError("Indiquez le nom du titulaire avant de payer.");
      return;
    }
    setNameError("");
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch(`/api/v1/groups/${token}/shares/${shareId}/pay`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          holderName: name.trim(),
          methodCode: method || defaultMethod,
          // Clé stable : elle voyage dans le lien, pas dans le stockage du navigateur.
          idempotencyKey: shareId,
        }),
      });
      const result = (await res.json()) as PayResult;
      if (!res.ok || !result.ok) {
        setFlash({ kind: "error", message: result.error ?? "Paiement refusé. Aucun montant débité." });
        return;
      }
      if (result.ticket?.id) {
        setTicketId(result.ticket.id);
      }
      await load();
      setFlash({
        kind: "success",
        message: result.replayed
          ? "Ce paiement a déjà été enregistré. Aucun second débit."
          : share.holderName === null && group.validationMode === "all_or_nothing"
            ? "Votre part est payée. En attente des autres participants."
            : "Votre part est payée. Votre billet est prêt.",
      });
    } catch {
      setFlash({ kind: "error", message: "Erreur réseau. Réessayez : la clé du lien évite un double débit." });
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const paid = share?.status === "paid";

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="link-underline text-xs text-[var(--grtk-text-3)] hover:text-violet-700">
            ← GR Ticket
          </Link>
          <ThemeToggle compact />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <GuaranteeBadge locale={locale} compact withTooltip />
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight">Payer ma place</h1>
          </div>
        </div>

        {flash && <StatusFlash kind={flash.kind} message={flash.message} onDone={() => setFlash(null)} />}

        <Reveal>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">
              {group.eventTitle}
            </p>
            <p className="mt-1 text-sm text-[var(--grtk-text-2)]">
              Organisé par {group.initiatorName} · place {share?.seatIndex ?? ""}
            </p>
            <p className="mt-3 font-heading text-4xl font-black text-violet-700">{amount}</p>
            <p className="mt-2 text-xs text-[var(--grtk-text-3)]">
              Règle du groupe :{" "}
              {group.validationMode === "all_or_nothing"
                ? "tout le monde paie, ou personne n'est débité"
                : "seules les places payées sont confirmées"}
              .
            </p>

            {ticketId ? (
              <Link
                href={`/billet/${ticketId}`}
                className="btn-neon-purple mt-5 inline-flex min-touch-target items-center gap-2 px-5 py-3 text-xs font-bold uppercase"
              >
                <Check className="h-4 w-4" aria-hidden /> Voir mon billet →
              </Link>
            ) : paid ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                <Check className="h-4 w-4" aria-hidden /> Place payée — billet en cours d&apos;émission
              </p>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nom du titulaire"
                    aria-label="Nom du titulaire"
                    className="field"
                  />
                  <FieldError message={nameError} />
                </div>
                <select
                  value={method || defaultMethod}
                  onChange={(event) => setMethod(event.target.value)}
                  aria-label="Moyen de paiement"
                  className="field"
                >
                  {paymentMethods.map((code) => (
                    <option key={code} value={code}>
                      {paymentMethodLabel(locale, code)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => void pay()}
                  disabled={busy}
                  className="btn-neon-purple min-touch-target sm:col-span-2 disabled:opacity-50"
                >
                  {busy ? "Paiement en cours…" : `Payer ${amount}`}
                </button>
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={60}>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--grtk-text-2)]">
              Transmettre ce lien
            </h2>
            <p className="mt-1 text-xs text-[var(--grtk-text-3)]">
              Le message est déjà rédigé. La photo de l&apos;événement apparaît automatiquement dans l&apos;aperçu du lien.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => void copyLink()}
                className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg border border-[var(--grtk-border)] px-3 py-2 text-[10px] font-bold uppercase hover:border-violet-600"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? translate(locale, "share.copied") : translate(locale, "share.copyLink")}
              </button>
              <a
                href={whatsappUrl(invite)}
                target="_blank"
                rel="noreferrer"
                className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase text-white hover:bg-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {translate(locale, "share.whatsapp")}
              </a>
              <a
                href={smsUrl(invite)}
                className="magnetic-btn inline-flex items-center gap-1.5 rounded-lg border border-[var(--grtk-border)] px-3 py-2 text-[10px] font-bold uppercase hover:border-violet-600"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden /> {translate(locale, "share.sms")}
              </a>
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
