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
    <div className="mx-auto min-h-screen max-w-7xl space-y-16 bg-white px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      
      {/* HEADER DE LA PAGE DESIGN SYSTEM */}
      <header className="flex flex-col items-start justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-violet-700">
              GR Ticket v1.0
            </span>
            <span className="font-mono text-xs text-slate-500">
              WCAG AA Compliant
            </span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            DESIGN SYSTEM <span className="text-violet-600">BLANC & VIOLET</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Système visuel clair et contrasté, taillé pour une lisibilité parfaite en plein soleil
            et dans les salles de concert du monde entier.
          </p>
        </div>

        {/* ACCÈS RAPIDE */}
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-violet-200 bg-white px-3 py-1 font-mono text-xs font-semibold text-violet-700 shadow-sm">
            Thème clair GR Ticket
          </span>
          <Link href="/maquette-3d">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Maquette 3D
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Accueil
            </Button>
          </Link>
        </div>
      </header>

      {/* SECTION 1 : PALETTE DE COULEURS ET CONTRASTES */}
      <section className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
            <Layers className="h-5 w-5 text-violet-600" />
            1. Palette Chromatique Fond & Violet
          </h2>
          <p className="text-xs text-slate-500">
            Spécification des couleurs claires et des contrastes minimaux garantis.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
            <div className="font-mono text-xs font-bold">Fond #FFFFFF</div>
            <div className="mt-1 text-[10px] text-slate-500">Blanc Principal</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-[#F6F7FB] p-4 text-slate-900 shadow-sm">
            <div className="font-mono text-xs font-bold">Surface #F6F7FB</div>
            <div className="mt-1 text-[10px] text-slate-500">Cartes & panneaux</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-slate-900 shadow-sm">
            <div className="font-mono text-xs font-bold">Élevée #F1F5F9</div>
            <div className="mt-1 text-[10px] text-slate-500">Modales & Popups</div>
          </div>
          <div className="rounded-xl border border-violet-600 bg-violet-600 p-4 text-white shadow-sm">
            <div className="font-mono text-xs font-bold">Violet #7C3AED</div>
            <div className="mt-1 text-[10px] text-white/80">Actions Primaires</div>
          </div>
          <div className="rounded-xl border border-violet-700 bg-violet-700 p-4 text-white shadow-sm">
            <div className="font-mono text-xs font-bold">Violet Survol #6D28D9</div>
            <div className="mt-1 text-[10px] text-white/80">Hover & Éclat</div>
          </div>
          <div className="rounded-xl border border-violet-800 bg-violet-800 p-4 text-white shadow-sm">
            <div className="font-mono text-xs font-bold">Violet Foncé #5B21B6</div>
            <div className="mt-1 text-[10px] text-white/80">Dégradés & Ombres</div>
          </div>
        </div>

        {/* ÉTATS FONCTIONNELS */}
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" /> Succès #047857
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Billet Valide / Payé</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <AlertTriangle className="h-4 w-4" /> Alerte #B45309
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Déjà Utilisé / Bientôt Complet</div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <XCircle className="h-4 w-4" /> Erreur #BE123C
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Billet Inconnu / Annulé</div>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
              <Info className="h-4 w-4" /> Information #0369A1
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Attente Webhook / Sync</div>
          </div>
        </div>
      </section>

      {/* SECTION 2 : TYPOGRAPHIES */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
            2. Typographies
          </h2>
          <p className="text-xs text-slate-500">
            Hiérarchie visuelle stricte : Titres percutants en majuscules, corps lisible, chiffres tabulaires.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Titres majuscules</CardDescription>
              <CardTitle className="font-display text-2xl uppercase tracking-wider text-violet-700">
                BIG SHOULDERS DISPLAY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-display text-3xl font-black uppercase text-slate-900">
                FESTIVAL GR Ticket LIVE 2026
              </p>
              <p className="text-xs text-slate-500">
                Utilisé pour l'identité visuelle scénique, les affiches, les titres de billets et les en-têtes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Corps de texte & UI</CardDescription>
              <CardTitle className="font-sans text-xl font-bold text-slate-900">
                DM Sans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm leading-relaxed text-slate-900">
                Clarté maximale pour les formulaires de vente au guichet, les détails de paiement et les mentions légales.
              </p>
              <p className="text-xs text-slate-500">
                Poids : 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Codes, Montants & Chiffres</CardDescription>
              <CardTitle className="font-mono text-xl font-bold text-slate-900">
                JetBrains Mono
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-mono text-lg font-bold text-violet-700 font-tabular">
                {money(25000)} • 14:30:00
              </p>
              <p className="font-mono text-sm tracking-wider text-slate-500">
                GR-4K9NX-7B2QZ
              </p>
              <p className="text-xs text-slate-500">
                Chiffres à espacement fixe tabulaire pour aligner les recettes au centime près.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 3 : BOUTONS ET CIBLES TACTILES */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
            3. Boutons & Cibles Tactiles (Min. 44px)
          </h2>
          <p className="text-xs text-slate-500">
            Conformes aux règles tactiles sur smartphone sous conditions de forte affluence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" leftIcon={<Sparkles className="h-4 w-4" />}>
            Bouton Principal Violet
          </Button>
          <Button variant="outline" leftIcon={<TicketIcon className="h-4 w-4" />}>
            Bouton Contour Violet
          </Button>
          <Button variant="secondary">
            Bouton Surface Secondaire
          </Button>
          <Button variant="danger" leftIcon={<XCircle className="h-4 w-4" />}>
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
          <span className="text-xs text-slate-500">Tailles :</span>
          <Button size="sm" variant="outline">Petit (sm)</Button>
          <Button size="md" variant="outline">Standard (md 44px)</Button>
          <Button size="lg" variant="primary">Grand (lg 52px)</Button>
        </div>
      </section>

      {/* SECTION 4 : CHAMPS DE FORMULAIRE */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
            4. Champs de Saisie & Validation
          </h2>
          <p className="text-xs text-slate-500">
            Indication claire d'erreur avec icône, libellé obligatoire et anneau violet au focus.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Numéro WhatsApp (indicatif international)"
            placeholder="+33 6 12 34 56 78"
            required
            leftIcon={<Phone className="h-4 w-4" />}
            helperText="Le billet numérique sera envoyé directement sur ce WhatsApp."
          />

          <Input
            label="Recherche de Billet ou Client"
            placeholder="Nom, e-mail ou code GR-XXXXX..."
            leftIcon={<Search className="h-4 w-4" />}
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
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
            5. Badges d'État (Double Encodage Icône + Texte)
          </h2>
          <p className="text-xs text-slate-500">
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
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
            6. Alertes Contextuelles
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
            7. Modale Accessible
          </h2>
          <p className="text-xs text-slate-500">
            Boîte de dialogue avec accentuation violette, gestion du focus et fermeture par la touche Échap.
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
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Événement :</span>
                  <span className="font-bold text-slate-900">GR Ticket LIVE CONCERT</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Catégorie :</span>
                  <span className="font-bold text-violet-700">VIP PASS</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Montant perçu :</span>
                  <span className="font-mono font-bold text-slate-900">{money(15000)}</span>
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
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
            8. Tableaux de Données (Chiffres Tabulaires)
          </h2>
          <p className="text-xs text-slate-500">
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
              <TableCell className="font-mono font-bold text-violet-700">
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
              <TableCell className="font-mono text-xs text-slate-500">
                22/10/2026 14:10
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-mono font-bold text-violet-700">
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
              <TableCell className="font-mono text-xs text-slate-500">
                22/10/2026 13:55
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell className="font-mono font-bold text-violet-700">
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
              <TableCell className="font-mono text-xs text-slate-500">
                22/10/2026 13:30
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* SECTION 9 : LE BILLET D'EXCEPTION GR Ticket */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-3xl font-bold uppercase tracking-wide text-slate-900">
              <TicketIcon className="h-6 w-6 text-violet-600" />
              9. Le Billet d'Exception « GR Ticket »
            </h2>
            <p className="text-xs text-slate-500">
              Corps blanc textile, talon violet détachable avec QR signé HMAC, code Crockford anti-ambiguïté, filigrane du label.
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
        <div className="grid grid-cols-1 items-center gap-8 pt-6 lg:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <span className="mb-4 block font-mono text-xs font-bold uppercase tracking-wider text-violet-700">
              ★ Format Pass Concert 3D (Éditorial)
            </span>
            <ConcertTicketCard
              eventName="GR Ticket LIVE PASS"
              category="VIP ALL-ACCESS"
              price={money(25000)}
              ticketCode={testTicketCode}
              rotate="-rotate-3"
            />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <span className="block font-mono text-xs font-bold uppercase tracking-wider text-violet-700">
              ★ Format Billet Nominatif (Fiche d'accès)
            </span>
            <Ticket
              ticketCode={testTicketCode}
              eventName="GR Ticket AFRO-FUSION NIGHT"
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
      <footer className="space-y-2 border-t border-slate-200 pt-10 text-center text-xs text-slate-500">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-violet-700">
          GR Ticket • BILLETTERIE INTERNATIONALE
        </p>
        <p>
          Conception UI/UX sur mesure • Blanc & Violet Haut Contraste • Conformité WCAG AA (4.5:1 minimum)
        </p>
      </footer>

    </div>
  );
}
