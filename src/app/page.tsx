import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BadgePercent, Globe2, QrCode, ShieldCheck, Users,
} from "lucide-react";
import { BrandMark } from "@/components/system/BrandMark";
import { SiteFooter } from "@/components/system/SiteFooter";
import { GuaranteeBadge } from "@/components/grtk/GuaranteeBadge";
import { HeroTicket } from "@/components/grtk/HeroTicket";
import { RealisticTicket3D } from "@/components/grtk/RealisticTicket3D";
import { CursorHalo } from "@/components/motion/CursorHalo";
import { Reveal } from "@/components/motion/Reveal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";

export const metadata: Metadata = {
  title: "GR Ticket — Billetterie internationale, billets garantis et paiement à plusieurs",
  description:
    "Créez vos événements, vendez vos billets dans la devise locale, laissez chaque participant payer sa place et recevez un billet garanti avec QR dynamique.",
};

const features = [
  {
    icon: Users,
    title: "Paiement à plusieurs",
    text: "Un seul lien par place. Chaque participant paie sa part, avec un message déjà rédigé et un aperçu avec photo.",
  },
  {
    icon: QrCode,
    title: "QR dynamique",
    text: "Le QR change toutes les 30 secondes : une capture d'écran ne passe pas au contrôle.",
  },
  {
    icon: ShieldCheck,
    title: "Billet garanti",
    text: "Si votre billet valide ne vous ouvre pas les portes, la garantie vous rembourse.",
  },
  {
    icon: Globe2,
    title: "International",
    text: "Chaque événement affiche sa devise et son fuseau horaire. Vos acheteurs voient un prix familier.",
  },
  {
    icon: BadgePercent,
    title: "Commission claire",
    text: `La plateforme prélève ${DEFAULT_COMMISSION_PERCENT} % sur chaque vente. Aucun frais caché ajouté au calcul.`,
  },
];

/** Première page de GR Ticket : toujours publique, jamais un tableau de bord. */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--grtk-bg)] text-[var(--grtk-text)]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--grtk-border)] bg-[var(--grtk-surface)]/95 px-4 backdrop-blur-xl sm:px-6">
        <BrandMark />
        <nav className="flex items-center gap-2 sm:gap-5">
          <Link href="/comment-ca-marche" className="hidden text-xs font-bold text-[var(--grtk-text-2)] hover:text-violet-700 sm:block">
            Comment ça marche
          </Link>
          <Link href="/garantie" className="hidden text-xs font-bold text-[var(--grtk-text-2)] hover:text-violet-700 sm:block">
            Garantie
          </Link>
          <ThemeToggle compact />
          <Link href="/connexion" className="btn-neon-purple inline-flex min-touch-target items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase">
            Connexion <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative isolate overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
          <CursorHalo />
          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <Reveal className="space-y-6">
              <span className="inline-flex rounded-full border border-[var(--grtk-violet-100)] bg-[var(--grtk-violet-50)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--grtk-violet-700)]">
                Billetterie internationale
              </span>
              <h1 className="font-heading text-4xl font-black uppercase leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Vos billets, garantis. Votre argent, protégé.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-[var(--grtk-text-2)] sm:text-base">
                Créez un événement, vendez dans la devise locale et envoyez à chaque acheteur un lien de paiement
                clair. Le billet et son QR dynamique arrivent automatiquement après le paiement.
              </p>
              <GuaranteeBadge locale="fr" withTooltip />
              <div className="flex flex-wrap gap-3">
                <Link href="/connexion?mode=signup" className="btn-neon-purple inline-flex min-touch-target items-center gap-2 px-6 py-3 text-xs font-bold uppercase">
                  Créer mon compte <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link href="/comment-ca-marche" className="magnetic-btn inline-flex min-touch-target items-center gap-2 rounded-xl border border-[var(--grtk-border)] px-6 py-3 text-xs font-bold uppercase hover:border-violet-600">
                  Découvrir le fonctionnement
                </Link>
              </div>
              <p className="text-xs text-[var(--grtk-text-3)]">
                Aucun compte requis pour consulter les événements publics.
              </p>
            </Reveal>

            <Reveal delay={80} className="hidden justify-center lg:flex">
              <div className="animate-float w-full max-w-md">
                <RealisticTicket3D flippable back={<HeroTicket />}>
                  <HeroTicket />
                </RealisticTicket3D>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-y border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Tout ce qu&apos;il faut pour vendre sereinement
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Reveal key={feature.title} className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--grtk-violet-50)] text-[var(--grtk-violet-700)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-heading text-sm font-black uppercase tracking-wide">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--grtk-text-2)]">{feature.text}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-20">
          <Reveal className="mx-auto max-w-3xl rounded-3xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-8 text-center shadow-sm sm:p-12">
            <ShieldCheck className="mx-auto h-8 w-8 text-violet-700" aria-hidden />
            <h2 className="mt-4 font-heading text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Prêt à créer votre premier événement ?
            </h2>
            <p className="mt-3 text-sm text-[var(--grtk-text-2)]">
              Un guide de démarrage vous accompagne, sans événement ni donnée fictive pré-remplie.
            </p>
            <Link href="/connexion?mode=signup" className="btn-neon-purple mt-6 inline-flex min-touch-target items-center gap-2 px-6 py-3 text-xs font-bold uppercase">
              Commencer <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
