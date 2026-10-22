import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Sparkles,
  Ticket as TicketIcon,
  Smartphone,
  ShieldCheck,
  Zap,
  WifiOff,
  Music2,
  ArrowRight,
  Palette,
  CreditCard,
  QrCode,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg-app)]/90 border-b border-[var(--border-app)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F0C75E] via-[#D4A22A] to-[#9C7416] flex items-center justify-center text-black font-black shadow-[var(--shadow-gold)]">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black font-display tracking-wider text-[var(--text-primary)] block leading-none">
                GODMAN RECORDS
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[var(--gold-primary)] uppercase">
                TIKET • CONGO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/design-system">
              <Button variant="primary" size="sm" leftIcon={<Palette className="w-4 h-4" />}>
                Voir le Design System
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-8">
          
          {/* Filigrane d'ambiance */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--gold-primary)]/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Badge statut */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--gold-subtle)] border border-[var(--gold-primary)]/50 text-[var(--gold-primary)] text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS Billetterie Nouvelle Génération • République du Congo</span>
          </div>

          {/* Titre Principal */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-[var(--text-primary)] uppercase leading-[1.05]">
            LA BILLETTERIE ÉVÉNEMENTIELLE <br />
            <span className="gold-gradient-text">NOIR & OR HAUTE PRÉCISION</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
            Spécialement conçue pour le label <strong>Godman Records</strong> et les producteurs de concerts au Congo-Brazzaville.
            Vente par <strong>MTN Mobile Money</strong> et <strong>Airtel Money</strong>, délivrance instantanée sur <strong>WhatsApp</strong> et contrôle d'entrée <strong>PWA sans internet</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/design-system">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explorer le Design System (Étape 1)
              </Button>
            </Link>
          </div>

          {/* Points forts rapides */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface)]">
              <CreditCard className="w-5 h-5 text-[var(--gold-primary)] mb-2" />
              <div className="font-bold text-sm text-[var(--text-primary)]">MTN & Airtel</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">XAF / FCFA + Guichet</div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface)]">
              <Smartphone className="w-5 h-5 text-[var(--gold-primary)] mb-2" />
              <div className="font-bold text-sm text-[var(--text-primary)]">WhatsApp Direct</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">Lien wa.me + API Cloud</div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface)]">
              <WifiOff className="w-5 h-5 text-[var(--gold-primary)] mb-2" />
              <div className="font-bold text-sm text-[var(--text-primary)]">Scan Hors-Ligne</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">PWA & Sync IndexedDB</div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface)]">
              <ShieldCheck className="w-5 h-5 text-[var(--gold-primary)] mb-2" />
              <div className="font-bold text-sm text-[var(--text-primary)]">Anti-Fraude HMAC</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">Anti-double scan strict</div>
            </div>
          </div>
        </section>

        {/* SECTION ARCHITECTURE & FONCTIONNALITÉS */}
        <section className="py-16 border-t border-[var(--border-app)] bg-[var(--bg-surface)]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="gold">Architecture Robuste</Badge>
              <h2 className="text-3xl sm:text-4xl font-display font-black uppercase text-[var(--text-primary)]">
                Taillé pour les conditions réelles du terrain
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Zéro compromis sur la sécurité, le temps de réponse et la lisibilité sous forte chaleur ou faible luminosité.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="interactive">
                <CardHeader>
                  <QrCode className="w-6 h-6 text-[var(--gold-primary)] mb-2" />
                  <CardTitle>Billet Unique Infalsifiable</CardTitle>
                  <CardDescription>
                    Code lisible court (alphabet Crockford anti-ambiguïté) couplé à un jeton QR signé par HMAC-SHA256. Verrou SQL empêchant le double scan même en millisecondes concurrentes.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card variant="interactive">
                <CardHeader>
                  <Smartphone className="w-6 h-6 text-[var(--gold-primary)] mb-2" />
                  <CardTitle>Distribution WhatsApp Instantanée</CardTitle>
                  <CardDescription>
                    Deux modes d'envoi intégrés : lien instantané wa.me avec préremplissage sans surcoût opérateur, et connecteur WhatsApp Cloud API automatisé pour les grands volumes.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card variant="interactive">
                <CardHeader>
                  <Zap className="w-6 h-6 text-[var(--gold-primary)] mb-2" />
                  <CardTitle>Vente au Guichet Ultra-Rapide</CardTitle>
                  <CardDescription>
                    Interface guichet simplifiée pour enregistrer un paiement en espèces ou mobile en moins de 30 secondes, avec contrôle d'unicité de la référence de transaction.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-8 border-t border-[var(--border-app)] bg-[var(--bg-app)] text-center text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm text-[var(--gold-primary)] uppercase">
              GODMAN RECORDS TIKET
            </span>
            <span>• Congo-Brazzaville</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Next.js 16</span>
            <span>TypeScript Strict</span>
            <span>Tailwind CSS</span>
            <span>Supabase RLS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
