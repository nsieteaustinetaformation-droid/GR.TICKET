"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Ticket } from "@/components/ui/Ticket";
import { ConcertTicketCard } from "@/components/ui/ConcertTicketCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { generateTicketCode } from "@/lib/utils";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { formatMoney, toMinor } from "@/lib/international/money";
import {
  Phone,
  Search,
  Sparkles,
  Ticket as TicketIcon,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function DesignSystemPage() {
  const demoConfig = getCountryConfig("FR");
  const money = (amount: number) =>
    formatMoney(toMinor(amount, demoConfig.currency, demoConfig.locale), demoConfig.currency, demoConfig.locale);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testTicketCode, setTestTicketCode] = useState("GR-7K8MX-9P2TW");
  const [ticketStatus, setTicketStatus] = useState<"valide" | "utilise" | "annule">("valide");

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      
      {/* HEADER DE LA PAGE DESIGN SYSTEM */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-[var(--border-app)]">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[var(--gold-subtle)] border border-[var(--gold-primary)] text-[var(--gold-primary)] font-mono text-xs font-semibold uppercase tracking-wider">
              GRTK v1.0
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">
              WCAG AA Compliant
            </span>
          </div>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black font-display tracking-tight text-[var(--text-primary)]">
            DESIGN SYSTEM <span className="gold-gradient-text">NOIR & OR</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-2xl">
            Système visuel à très haut contraste, taillé pour une lisibilité parfaite en plein soleil
            et dans les salles de concert du monde entier.
          </p>
        </div>

        {/* CONTROLES THÈME & ACCÈS RAPIDE */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Accueil
            </Button>
          </Link>
        </div>
      </header>

      {/* SECTION 1 : PALETTE DE COULEURS ET CONTRASTES */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--gold-primary)]" />
            1. Palette Chromatique Fond & Or
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Spécification des variables CSS fondamentales et des contrastes minimaux garantis.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl border border-[var(--border-app)] bg-[#0A0A0B] text-white">
            <div className="text-xs font-mono font-bold text-[#F5F1E8]">Fond #0A0A0B</div>
            <div className="text-[10px] text-[#A8A39A] mt-1">Noir Profond</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-app)] bg-[#121214] text-white">
            <div className="text-xs font-mono font-bold text-[#F5F1E8]">Surface #121214</div>
            <div className="text-[10px] text-[#A8A39A] mt-1">Cartes de base</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-app)] bg-[#1A1A1D] text-white">
            <div className="text-xs font-mono font-bold text-[#F5F1E8]">Élevée #1A1A1D</div>
            <div className="text-[10px] text-[#A8A39A] mt-1">Modales & Popups</div>
          </div>
          <div className="p-4 rounded-xl border border-[#D4A22A] bg-[#D4A22A] text-black">
            <div className="text-xs font-mono font-bold text-[#0A0A0B]">Or Base #D4A22A</div>
            <div className="text-[10px] text-black/80 mt-1">Actions Primaires</div>
          </div>
          <div className="p-4 rounded-xl border border-[#F0C75E] bg-[#F0C75E] text-black">
            <div className="text-xs font-mono font-bold text-[#0A0A0B]">Or Survol #F0C75E</div>
            <div className="text-[10px] text-black/80 mt-1">Hover & Éclat</div>
          </div>
          <div className="p-4 rounded-xl border border-[#9C7416] bg-[#9C7416] text-white">
            <div className="text-xs font-mono font-bold text-[#F5F1E8]">Or Foncé #9C7416</div>
            <div className="text-[10px] text-white/80 mt-1">Dégradés & Ombres</div>
          </div>
        </div>

        {/* ÉTATS FONCTIONNELS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-[#3DD68C] bg-[var(--state-success-bg)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3DD68C]">
              <CheckCircle2 className="w-4 h-4" /> Succès #3DD68C
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1">Billet Valide / Payé</div>
          </div>
          <div className="p-4 rounded-xl border border-[#F5A524] bg-[var(--state-alert-bg)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5A524]">
              <AlertTriangle className="w-4 h-4" /> Alerte #F5A524
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1">Déjà Utilisé / Bientôt Complet</div>
          </div>
          <div className="p-4 rounded-xl border border-[#FF6B5E] bg-[var(--state-error-bg)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B5E]">
              <XCircle className="w-4 h-4" /> Erreur #FF6B5E
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1">Billet Inconnu / Annulé</div>
          </div>
          <div className="p-4 rounded-xl border border-[#6CB4FF] bg-[var(--state-info-bg)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6CB4FF]">
              <Info className="w-4 h-4" /> Information #6CB4FF
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1">Attente Webhook / Sync</div>
          </div>
        </div>
      </section>

      {/* SECTION 2 : TYPOGRAPHIES */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
            2. Typographies
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Hiérarchie visuelle stricte : Titres percutants en majuscules, corps lisible, chiffres tabulaires.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardDescription>Titres majuscules</CardDescription>
              <CardTitle className="font-display text-2xl uppercase tracking-wider text-[var(--gold-primary)]">
                BIG SHOULDERS DISPLAY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-display text-3xl font-black uppercase text-[var(--text-primary)]">
                FESTIVAL GRTK LIVE 2026
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Utilisé pour l'identité visuelle scénique, les affiches, les titres de billets et les en-têtes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Corps de texte & UI</CardDescription>
              <CardTitle className="font-sans text-xl font-bold text-[var(--text-primary)]">
                DM Sans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                Clarté maximale pour les formulaires de vente au guichet, les détails de paiement et les mentions légales.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Poids : 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Codes, Montants & Chiffres</CardDescription>
              <CardTitle className="font-mono text-xl font-bold text-[var(--text-primary)]">
                JetBrains Mono
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-mono text-lg font-bold text-[var(--gold-primary)] font-tabular">
                {money(25000)} • 14:30:00
              </p>
              <p className="font-mono text-sm text-[var(--text-secondary)] tracking-wider">
                GR-4K9NX-7B2QZ
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Chiffres à espacement fixe tabulaire pour aligner les recettes au centime près.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 3 : BOUTONS ET CIBLES TACTILES */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
            3. Boutons & Cibles Tactiles (Min. 44px)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Conformes aux règles tactiles sur smartphone sous conditions de forte affluence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
            Bouton Principal Dégradé Or
          </Button>
          <Button variant="outline" leftIcon={<TicketIcon className="w-4 h-4" />}>
            Bouton Contour Or
          </Button>
          <Button variant="secondary">
            Bouton Surface Secondaire
          </Button>
          <Button variant="danger" leftIcon={<XCircle className="w-4 h-4" />}>
            Annuler / Rembourser
          </Button>
          <Button variant="ghost">
            Bouton Discret Ghost
          </Button>
          <Button variant="primary" isLoading>
            Chargement...
          </Button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <span className="text-xs text-[var(--text-secondary)]">Tailles :</span>
          <Button size="sm" variant="outline">Petit (sm)</Button>
          <Button size="md" variant="outline">Standard (md 44px)</Button>
          <Button size="lg" variant="primary">Grand (lg 52px)</Button>
        </div>
      </section>

      {/* SECTION 4 : CHAMPS DE FORMULAIRE */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
            4. Champs de Saisie & Validation
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Indication claire d'erreur avec icône, libellé obligatoire et anneau or au focus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Numéro WhatsApp (indicatif international)"
            placeholder="+33 6 12 34 56 78"
            required
            leftIcon={<Phone className="w-4 h-4" />}
            helperText="Le billet numérique sera envoyé directement sur ce WhatsApp."
          />

          <Input
            label="Recherche de Billet ou Client"
            placeholder="Nom, e-mail ou code GR-XXXXX..."
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Input
            label="Référence Transaction MTN / Airtel"
            placeholder="Ex: MP2410221350"
            required
            error="La référence est obligatoire pour valider la vente au guichet."
          />
        </div>
      </section>

      {/* SECTION 5 : BADGES D'ÉTAT & ACCESSIBILITÉ */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
            5. Badges d'État (Double Encodage Icône + Texte)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Conforme à l'exigence : un état n'est jamais transmis par la couleur seule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success">Billet Valide</Badge>
          <Badge variant="alert">Déjà Utilisé (19h42)</Badge>
          <Badge variant="error">Billet Annulé / Inconnu</Badge>
          <Badge variant="info">Paiement MTN en Attente</Badge>
          <Badge variant="gold">VIP All-Access</Badge>
          <Badge variant="neutral">Porte Principale A</Badge>
        </div>
      </section>

      {/* SECTION 6 : ALERTES CONTEXTUELLES */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
            6. Alertes Contextuelles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert
            variant="success"
            title="Paiement MTN Money Confirmé"
            description="La transaction #TX-98421 a été validée avec succès. Le billet a été généré et expédié au +33 6 50 12 34 56."
          />

          <Alert
            variant="alert"
            title="Capacité Événement : 92% Atteinte"
            description="Il ne reste plus que 45 billets dans la catégorie VIP. Préparez la fermeture de la billetterie en ligne."
          />

          <Alert
            variant="error"
            title="Tentative de Double Scan Détectée"
            description="Le billet GR-9T7KR-4B2MX a déjà été scanné à 19h14 par le contrôleur #3 à la Porte Est."
          />

          <Alert
            variant="info"
            title="Mode Hors-Ligne Actif (PWA)"
            description="Les billets ont été synchronisés dans la mémoire locale. Vous pouvez scanner sans connexion internet."
          />
        </div>
      </section>

      {/* SECTION 7 : MODALE DE DÉMONSTRATION */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
            7. Modale Accessible
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Boîte de dialogue avec accentuation dorée, gestion du focus et fermeture par la touche Échap.
          </p>
        </div>

        <div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Ouvrir la Modale Démo
          </Button>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Confirmer la Vente au Guichet"
            description="Cette action débitera un billet sur le quota et générera l'envoi WhatsApp."
            footer={
              <>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirmer et Émettre
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-app)] space-y-2">
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Événement :</span>
                  <span className="font-bold text-[var(--text-primary)]">GRTK LIVE CONCERT</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Catégorie :</span>
                  <span className="font-bold text-[var(--gold-primary)]">VIP PASS</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Montant perçu :</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{money(15000)}</span>
                </div>
              </div>

              <Input
                label="Bénéficiaire"
                defaultValue="Alice Martin"
                placeholder="Nom complet"
              />
            </div>
          </Modal>
        </div>
      </section>

      {/* SECTION 8 : TABLEAU DE DONNÉES */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
            8. Tableaux de Données (Chiffres Tabulaires)
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Affichage des ventes récentes avec statuts clairs et montants alignés au franc CFA.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code Billet</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Mode de Paiement</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date / Heure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono font-bold text-[var(--gold-primary)]">
                GR-8K4MX-1A9TW
              </TableCell>
              <TableCell>Alice Martin</TableCell>
              <TableCell>
                <span className="font-medium">MTN Mobile Money</span>
              </TableCell>
              <TableCell className="font-mono font-bold font-tabular">
                {money(10000)}
              </TableCell>
              <TableCell>
                <Badge variant="success">Billet Émis</Badge>
              </TableCell>
              <TableCell className="text-xs text-[var(--text-secondary)] font-mono">
                22/10/2026 14:10
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-mono font-bold text-[var(--gold-primary)]">
                GR-3P9LZ-6V8NQ
              </TableCell>
              <TableCell>Bob Martin</TableCell>
              <TableCell>
                <span className="font-medium">Airtel Money</span>
              </TableCell>
              <TableCell className="font-mono font-bold font-tabular">
                {money(25000)}
              </TableCell>
              <TableCell>
                <Badge variant="success">Billet Émis</Badge>
              </TableCell>
              <TableCell className="text-xs text-[var(--text-secondary)] font-mono">
                22/10/2026 13:55
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-mono font-bold text-[var(--gold-primary)]">
                GR-7T2KQ-5D9XY
              </TableCell>
              <TableCell>Charlie Dupont</TableCell>
              <TableCell>
                <span className="font-medium">Espèces (Guichet)</span>
              </TableCell>
              <TableCell className="font-mono font-bold font-tabular">
                {money(5000)}
              </TableCell>
              <TableCell>
                <Badge variant="alert">Scanné Entrée</Badge>
              </TableCell>
              <TableCell className="text-xs text-[var(--text-secondary)] font-mono">
                22/10/2026 13:30
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* SECTION 9 : LE BILLET D'EXCEPTION GRTK */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-display uppercase tracking-wide text-[var(--text-primary)] flex items-center gap-2">
              <TicketIcon className="w-6 h-6 text-[var(--gold-primary)]" />
              9. Le Billet d'Exception « GRTK »
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Corps noir textile, talon or détachable avec QR signé HMAC, code Crockford anti-ambiguïté, filigrane du label.
            </p>
          </div>

          {/* Simulateur d'état du billet */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestTicketCode(generateTicketCode())}
            >
              Générer Nouveau Code
            </Button>
            <Button
              variant={ticketStatus === "valide" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTicketStatus("valide")}
            >
              Valide
            </Button>
            <Button
              variant={ticketStatus === "utilise" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTicketStatus("utilise")}
            >
              Utilisé
            </Button>
            <Button
              variant={ticketStatus === "annule" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTicketStatus("annule")}
            >
              Annulé
            </Button>
          </div>
        </div>

        {/* DUAL TICKETS DISPLAY: CONCERT PASS (VOICE STAGE STYLE) + BOARDING PASS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center pt-6">
          <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-100/70 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-4 block font-mono">
              ★ Format Pass Concert 3D (Éditorial)
            </span>
            <ConcertTicketCard
              eventName="GRTK LIVE PASS"
              category="VIP ALL-ACCESS"
              price={money(25000)}
              ticketCode={testTicketCode}
              rotate="-rotate-3"
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block font-mono">
              ★ Format Billet Nominatif (Fiche d'accès)
            </span>
            <Ticket
              ticketCode={testTicketCode}
              eventName="GRTK AFRO-FUSION NIGHT"
              category="VIP"
              price={25000}
              eventDate="2026-11-28T20:30:00+01:00"
              location="Palais des Congrès"
              city="Paris"
              buyerName="Alice Martin"
              buyerPhone="+33 6 61 23 45 67"
              status={ticketStatus}
              gate="Porte A - Accès VIP"
              onShareWhatsApp={() => {
                alert(`Lien WhatsApp simulé pour le billet ${testTicketCode}`);
              }}
            />
          </div>
        </div>
      </section>

      {/* PIED DE PAGE DESIGN SYSTEM */}
      <footer className="pt-10 border-t border-[var(--border-app)] text-center text-xs text-[var(--text-secondary)] space-y-2">
        <p className="font-display uppercase tracking-widest text-[var(--gold-primary)] text-sm font-bold">
          GRTK • BILLETTERIE INTERNATIONALE
        </p>
        <p>
          Conception UI/UX sur mesure • Noir & Or Haut Contraste • Conformité WCAG AA (4.5:1 minimum)
        </p>
      </footer>

    </div>
  );
}
