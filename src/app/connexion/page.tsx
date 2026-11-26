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
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-400";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#080412] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center">
            <TicketIcon className="w-5 h-5 text-purple-200" />
          </div>
          <div>
            <p className="font-black uppercase tracking-tight">GRTK</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Billetterie internationale
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0E0A1C] p-6 sm:p-8 space-y-6">
          <div className="flex rounded-xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                mode === "login" ? "bg-purple-600 text-white" : "text-white/50"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                mode === "signup" ? "bg-purple-600 text-white" : "text-white/50"
              }`}
            >
              Créer un compte
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              {mode === "login" ? "Bon retour" : "Devenir organisateur"}
            </h1>
            <p className="text-xs text-white/50 mt-1">
              {mode === "login"
                ? "Connectez-vous pour gérer vos événements et vos ventes."
                : `Créez vos événements, vendez des billets. La plateforme prélève ${DEFAULT_COMMISSION_PERCENT} % sur chaque vente.`}
            </p>
          </div>

          {isDemo && (
            <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-[11px] text-amber-200">
              Mode démo : les comptes sont simulés sur cet appareil. Brancher Supabase pour activer les vrais comptes.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Nom complet</span>
                  <input className={field} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Alice Martin" required />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Téléphone WhatsApp (indicatif international)</span>
                  <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +33 6 12 34 56 78 (selon votre pays)" />
                </label>
              </>
            )}

            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Email</span>
              <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Mot de passe</span>
              <input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" required minLength={6} />
            </label>

            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-purple-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-purple-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? "Patientez…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
              {!busy && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-[11px] text-white/40">
            Vous êtes déjà inscrit ?{" "}
            <Link href="/connexion" className="text-purple-300 hover:underline">
              connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
