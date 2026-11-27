"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ticket as TicketIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";

type Mode = "login" | "signup";

export default function ConnexionPage() {
  const router = useRouter();
  const { signIn, signUp, isDemo, user } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") await signUp(fullName, phone, email, password);
      else await signIn(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12 text-slate-900">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700">
            <TicketIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-black uppercase tracking-tight">GRTK</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Billetterie internationale
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                mode === "login" ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                mode === "signup" ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Créer un compte
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              {mode === "login" ? "Bon retour" : "Devenir organisateur"}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {mode === "login"
                ? "Connectez-vous pour gérer vos événements et vos ventes."
                : `Créez vos événements, vendez des billets. La plateforme prélève ${DEFAULT_COMMISSION_PERCENT} % sur chaque vente.`}
            </p>
          </div>

          {isDemo && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-700">
              Mode démo : les comptes sont simulés sur cet appareil. Brancher Supabase pour activer les vrais comptes.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Nom complet</span>
                  <input className={field} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Alice Martin" required />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Téléphone WhatsApp (indicatif international)</span>
                  <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +33 6 12 34 56 78 (selon votre pays)" />
                </label>
              </>
            )}

            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Email</span>
              <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Mot de passe</span>
              <input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" required minLength={6} />
            </label>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {busy ? "Patientez…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-500">
            Vous êtes déjà inscrit ?{" "}
            <Link href="/connexion" className="text-violet-700 hover:underline">
              connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
