"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/system/BrandMark";
import { FieldError } from "@/components/system/FieldError";
import { RealisticTicket3D } from "@/components/grtk/RealisticTicket3D";
import { HeroTicket } from "@/components/grtk/HeroTicket";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/lib/auth";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { validateAuth } from "@/lib/validation/auth";

type Mode = "login" | "signup";

function loginErrors(email: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Indiquez une adresse e-mail valide.";
  if (password.length < 6) errors.password = "Le mot de passe doit contenir au moins 6 caractères.";
  return errors;
}

export default function ConnexionPage() {
  const router = useRouter();
  const { signIn, signUp, isDemo, user } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [flash, setFlash] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Retour à la page demandée après connexion (validation du chemin local).
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("next");
      setNextPath(requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard");
      if (params.get("mode") === "signup") setMode("signup");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && nextPath) router.replace(nextPath);
  }, [user, nextPath, router]);

  const validation = mode === "signup"
    ? validateAuth({ fullName, email, password, phone: phone || undefined })
    : { valid: Object.keys(loginErrors(email, password)).length === 0, errors: loginErrors(email, password), firstField: null as string | null };
  const errors = showErrors ? validation.errors : {};
  const canSubmit = validation.valid;

  function fieldId(name: string): string {
    return `field-${name}`;
  }

  function reveal(): void {
    const field = validation.firstField ?? Object.keys(validation.errors)[0];
    const node = field ? document.getElementById(fieldId(field)) : null;
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    node?.focus?.({ preventScroll: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    setFlash(null);
    if (!validation.valid) {
      reveal();
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") await signUp(fullName, phone, email, password);
      else await signIn(email, password);
      setFlash({ kind: "success", message: "Connexion réussie. Redirection…" });
      router.replace(nextPath ?? "/dashboard");
    } catch (err) {
      setFlash({ kind: "error", message: err instanceof Error ? err.message : "Une erreur est survenue. Réessayez." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[var(--grtk-bg)] text-[var(--grtk-text)] lg:grid-cols-2">
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-between gap-3">
            <BrandMark />
            <ThemeToggle compact />
          </div>

          <div className="space-y-5 rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-[var(--shadow-2)] sm:p-8">
            <div className="flex rounded-xl bg-[var(--grtk-surface-2)] p-1">
              {(["login", "signup"] as Mode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setMode(item); setShowErrors(false); setFlash(null); }}
                  aria-pressed={mode === item}
                  className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${mode === item ? "bg-violet-600 text-white" : "text-[var(--grtk-text-3)] hover:text-violet-700"}`}
                >
                  {item === "login" ? "Connexion" : "Créer un compte"}
                </button>
              ))}
            </div>

            <div>
              <h1 className="font-heading text-2xl font-black uppercase tracking-tight">
                {mode === "login" ? "Bon retour" : "Devenir organisateur"}
              </h1>
              <p className="mt-1 text-xs text-[var(--grtk-text-3)]">
                {mode === "login"
                  ? "Connectez-vous pour gérer vos événements et vos ventes."
                  : `Créez vos événements, vendez des billets. La plateforme prélève ${DEFAULT_COMMISSION_PERCENT} % sur chaque vente.`}
              </p>
            </div>

            {isDemo && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
                Mode démo : les comptes sont simulés sur cet appareil. Branchez Supabase pour activer les vrais comptes.
              </p>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
              {mode === "signup" && (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Nom complet *</span>
                    <input id={fieldId("fullName")} className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex : Alice Martin" />
                    <FieldError message={errors.fullName} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Téléphone WhatsApp (format international)</span>
                    <input id={fieldId("phone")} className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33612345678" />
                    <FieldError message={errors.phone} />
                  </label>
                </>
              )}

              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">E-mail *</span>
                <input id={fieldId("email")} type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
                <FieldError message={errors.email} />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Mot de passe *</span>
                <input id={fieldId("password")} type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" />
                <FieldError message={errors.password} />
              </label>

              {flash && <StatusFlash kind={flash.kind} message={flash.message} onDone={() => setFlash(null)} />}

              <MagneticButton
                type="submit"
                aria-disabled={!canSubmit}
                className={`btn-neon-purple flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider ${canSubmit ? "" : "opacity-60"}`}
              >
                {busy ? "Patientez…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
                {!busy && <ArrowRight className="h-4 w-4" aria-hidden />}
              </MagneticButton>
            </form>

            <p className="flex items-center justify-center gap-2 text-center text-[11px] text-[var(--grtk-text-3)]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
              Vos données restent sur cet appareil en mode démo.
            </p>
            <Link href="/comment-ca-marche" className="link-underline block text-center text-[11px] font-bold uppercase tracking-wider text-violet-700">
              Comment ça marche
            </Link>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="relative hidden items-center justify-center overflow-hidden border-l border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] p-10 lg:flex">
          <div className="animate-float w-full max-w-lg">
            <RealisticTicket3D flippable back={<HeroTicket />}>
              <HeroTicket />
            </RealisticTicket3D>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
