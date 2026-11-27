"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FieldError } from "@/components/system/FieldError";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { validateClaim } from "@/lib/validation/claim";

function ClaimForm() {
  const params = useSearchParams();
  const [ticketId, setTicketId] = useState(params.get("ticket") ?? "");
  const [reason, setReason] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateClaim({ ticketId, reason, photoUrl: photoUrl ?? undefined });
    setErrors(validation.errors);
    if (!validation.valid) {
      const field = document.getElementById(`field-${validation.firstField ?? "ticketId"}`);
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus?.({ preventScroll: true });
      return;
    }
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/v1/claims", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ticketId, reason, photoUrl: photoUrl || undefined, autoDecide: auto }),
      });
      const data = (await res.json()) as {
        ok: boolean; error?: string; escalated?: boolean; decision?: { ok: boolean; paidMinor?: number };
      };
      if (!res.ok || !data.ok) {
        setFlash({ kind: "error", message: data.error ?? "Réclamation refusée." });
      } else if (data.escalated) {
        setFlash({ kind: "success", message: "Réclamation enregistrée. Un agent va l'examiner." });
      } else if (data.decision?.ok) {
        setFlash({ kind: "success", message: "Remboursement automatique effectué. Consultez votre billet pour le détail." });
      } else {
        setFlash({ kind: "error", message: "Réclamation transmise : le remboursement automatique n'a pas été accordé." });
      }
    } catch {
      setFlash({ kind: "error", message: "Erreur réseau. Votre demande n'a pas été envoyée : réessayez." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="link-underline text-xs text-[var(--grtk-text-3)] hover:text-violet-700">← Tableau de bord</Link>
          <ThemeToggle compact />
        </div>

        <Reveal>
          <section className="rounded-3xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50"><ShieldCheck className="h-6 w-6 text-emerald-700" aria-hidden /></span>
              <GuaranteeBadge locale="fr" withTooltip />
            </div>
            <h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight">Garantie GRTK</h1>
            <p className="mt-2 text-sm text-[var(--grtk-text-2)]">
              Ton billet entre à la porte, sinon tu es remboursé. Décrivez le problème : nous vérifions le scan et le statut du billet.
            </p>

            <form onSubmit={(e) => void submit(e)} className="mt-7 space-y-5">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Numéro de billet</span>
                <input
                  id="field-ticketId"
                  value={ticketId}
                  onChange={(e) => { setTicketId(e.target.value); setErrors((current) => ({ ...current, ticketId: "" })); }}
                  placeholder="GR-XXXXX-XXXXX"
                  className="field"
                />
                <FieldError message={errors.ticketId} />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Motif</span>
                <textarea
                  id="field-reason"
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setErrors((current) => ({ ...current, reason: "" })); }}
                  placeholder="Le scan a été refusé à l'entrée…"
                  rows={4}
                  className="field"
                />
                <FieldError message={errors.reason} />
              </label>

              <div id="field-photoUrl">
                <ImageUploader
                  value={photoUrl}
                  onChange={(url) => { setPhotoUrl(url); setErrors((current) => ({ ...current, photoUrl: "" })); }}
                  shape="square"
                  label="Photo du refus (facultatif)"
                  hint="JPG, PNG, WebP, HEIC · 5 Mo max · glissez, collez ou prenez une photo"
                  compact
                />
                <FieldError message={errors.photoUrl} />
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--grtk-border)] p-4 text-xs">
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-600" />
                Traitement automatique si le billet est valide et non utilisé. Sinon, un agent examine le dossier.
              </label>

              {flash && <StatusFlash kind={flash.kind} message={flash.message} onDone={() => setFlash(null)} />}

              <MagneticButton
                type="submit"
                disabled={busy}
                className="btn-neon-purple flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {busy ? "Envoi…" : "Déposer une réclamation"} <ArrowRight className="h-4 w-4" aria-hidden />
              </MagneticButton>
            </form>

            <Link href="/garantie" className="link-underline mt-5 inline-block text-xs font-bold uppercase tracking-wider text-violet-700">
              Lire les conditions de la garantie →
            </Link>
          </section>
        </Reveal>
      </div>
    </main>
  );
}

export default function ReclamationPage() {
  return <Suspense fallback={<main className="min-h-screen bg-white" />}><ClaimForm /></Suspense>;
}
