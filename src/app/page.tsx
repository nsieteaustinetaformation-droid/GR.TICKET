"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ConcertTicketCard } from "@/components/ui/ConcertTicketCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatXAF, generateTicketCode } from "@/lib/utils";
import {
  Mic2,
  Headphones,
  ArrowRight,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Ticket as TicketIcon,
  CreditCard,
  QrCode,
} from "lucide-react";

export default function Home() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("+242 06 ");
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "airtel">("mtn");
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isPurchased, setIsPurchased] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<{
    code: string;
    name: string;
    phone: string;
    amount: number;
  } | null>(null);

  const unitPrice = 15000;
  const totalPrice = unitPrice * ticketQuantity;

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    const code = generateTicketCode();
    setGeneratedTicket({
      code,
      name: buyerName || "Merveil Makosso",
      phone: buyerPhone || "+242 06 123 45 67",
      amount: totalPrice,
    });
    setIsPurchased(true);
  };

  const shareWhatsApp = () => {
    if (!generatedTicket) return;
    const msg = encodeURIComponent(
      `🎉 *BILLET OFFICIEL GODMAN STAGE* 🎉\n\nÉvénement : GODMAN LIVE FESTIVAL 2026\nTitulaire : ${generatedTicket.name}\nCode : ${generatedTicket.code}\nTarif : ${formatXAF(generatedTicket.amount)}\nPaiement : ${paymentMethod.toUpperCase()} Mobile Money\n\nPrésentez ce message et votre QR code au scan à l'entrée !`
    );
    window.open(`https://wa.me/${generatedTicket.phone.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <div className="relative min-h-screen bg-[#EDF3F9] text-[#0F172A] overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* 1. MOT-CLÉ EN FILIGRANE GÉANT EN HAUT (VOICE STAGE WATERMARK) */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none select-none z-0 flex justify-center">
        <h1 className="text-[14vw] font-display font-black tracking-tight text-white/70 uppercase leading-none mt-2 opacity-60">
          GODMAN STAGE
        </h1>
      </div>

      {/* 2. NAVBAR MINIMALISTE ÉLÉGANTE */}
      <header className="relative z-30 max-w-6xl mx-auto pt-6 px-4 sm:px-6 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0B132B] text-white flex items-center justify-center shadow-md">
            <Mic2 className="w-4 h-4 text-cyan-300" />
          </div>
          <span className="font-display text-2xl uppercase tracking-wider text-[#0B132B]">
            GODMAN <span className="text-blue-600">STAGE</span>
          </span>
        </div>

        {/* LIENS NAV */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#0B132B]">
          <a href="#about" className="hover:text-blue-600 transition-colors">À Propos</a>
          <a href="#experience" className="hover:text-blue-600 transition-colors">Expérience</a>
          <a href="#tickets" className="hover:text-blue-600 transition-colors">Billetterie</a>
          <Link href="/design-system" className="hover:text-blue-600 transition-colors">Design System</Link>
        </nav>

        {/* BOUTON SUPPORT / GUICHET */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="px-5 py-2.5 rounded-full border border-[#0B132B]/20 bg-white/70 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-[#0B132B] hover:bg-white hover:border-[#0B132B] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600" />
            <span>Support</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION EXACTE STYLE VOICE STAGE */}
      <section className="relative z-20 max-w-6xl mx-auto pt-8 sm:pt-14 pb-20 px-4 sm:px-6">
        
        {/* CARTE CENTRALE BLANCHE ARRONDIR */}
        <div className="relative rounded-3xl bg-white/95 shadow-xl shadow-blue-900/5 border border-white/80 p-6 sm:p-12 lg:p-16 overflow-hidden">
          
          {/* BADGES FLOTTANTS EXTÉRIEURS */}
          <div className="absolute top-10 left-8 z-30 hidden sm:block">
            <div className="glass-pill px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest text-[#0B132B] shadow-sm -rotate-3">
              CONGO-BRAZZAVILLE
            </div>
          </div>

          <div className="absolute top-14 right-8 z-30 hidden sm:block">
            <div className="glass-pill-rainbow px-4 py-2 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="w-9 h-9 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500">
                GR
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#0B132B] leading-none">Godman Live</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Label Officiel</p>
              </div>
            </div>
          </div>

          {/* COMPOSITION ARTISTE ET TYPOGRAPHIE GÉANTE */}
          <div className="relative flex flex-col items-center justify-center my-4 sm:my-8 text-center">
            
            {/* LIGNE 1 : GODMAN */}
            <h2 className="font-display font-black text-[22vw] sm:text-[180px] lg:text-[220px] uppercase tracking-tighter text-[#0B132B] leading-[0.82] select-none">
              GODMAN
            </h2>

            {/* IMAGE DE L'ARTISTE QUI COUPE LE TEXTE (CENTRE) */}
            <div className="relative -my-16 sm:-my-32 z-20 w-64 sm:w-80 lg:w-[380px] h-[340px] sm:h-[420px] lg:h-[480px]">
              <Image
                src="/images/artist_hero.jpg"
                alt="Artiste en concert live"
                fill
                priority
                className="object-contain object-bottom drop-shadow-2xl"
              />
            </div>

            {/* LIGNE 2 : STAGE + SCRIPT MANUSCRIT */}
            <div className="relative z-10 w-full flex items-center justify-center">
              <h2 className="font-display font-black text-[22vw] sm:text-[180px] lg:text-[220px] uppercase tracking-tighter text-[#0B132B] leading-[0.82] select-none">
                STAGE
              </h2>

              {/* TEXTE MANUSCRIT "Stage Stories" */}
              <div className="absolute -bottom-2 right-4 sm:right-16 z-30">
                <span className="font-script text-3xl sm:text-5xl text-[#0B132B] -rotate-12 block drop-shadow-sm font-bold">
                  Stage Stories
                </span>
              </div>
            </div>

          </div>

          {/* TEXTE D'ACCOMPAGNEMENT ET BOUTONS CTA */}
          <div className="mt-8 text-center max-w-md mx-auto space-y-6 relative z-30">
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Là où les voix s'élèvent, les souvenirs s'écrivent et la nuit appartient au son.
              Paiements instantanés par MTN & Airtel Money au Congo-Brazzaville.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="pill-btn-dark px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Prendre Mon Billet</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#ticket-section"
                className="pill-btn-outline px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider"
              >
                Explorer Les Détails
              </a>
            </div>
          </div>

        </div>

      </section>

      {/* 4. DEUXIÈME SECTION : LE BILLET FLOTTANT 3D (GET YOUR TICKET / YOUR NIGHT AWAITS) */}
      <section id="ticket-section" className="relative z-20 max-w-6xl mx-auto pt-6 pb-28 px-4 sm:px-6">
        
        {/* EN-TÊTE DE LA SECTION AVEC SOCIAL PROOF */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8">
          
          <div className="glass-pill px-3 py-1 rounded-full text-[11px] font-semibold text-slate-700">
            FESTIVAL EN PLEIN AIR
          </div>

          <div className="text-xs text-slate-600 max-w-xs">
            Musique live, ambiance électrique et délivrance instantanée du billet sur votre WhatsApp.
          </div>

          {/* SOCIAL PROOF : 1.5K ACHETEURS */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                MK
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-700 flex items-center justify-center text-white text-[10px] font-bold">
                AO
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                GL
              </div>
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-[#0B132B] block leading-none">
                1.5k Personnes
              </span>
              <span className="text-[10px] text-slate-500">
                ont déjà réservé leur pass
              </span>
            </div>
          </div>

        </div>

        {/* CONTENEUR TITRE GÉANT AVEC BILLET FLOTTANT TILTÉ DESSUS */}
        <div className="relative my-8 py-12 flex flex-col items-center justify-center text-center">
          
          {/* TITRE GÉANT EN ARRIÈRE-PLAN */}
          <div className="w-full select-none pointer-events-none">
            <h2 className="font-display font-black text-[12vw] sm:text-[90px] lg:text-[115px] uppercase tracking-tight text-blue-900/20 leading-[0.88]">
              GET YOUR TICKET
            </h2>
            <h2 className="font-display font-black text-[12vw] sm:text-[90px] lg:text-[115px] uppercase tracking-tight text-blue-900/20 leading-[0.88]">
              YOUR NIGHT AWAITS
            </h2>
          </div>

          {/* BILLET DE CONCERT EN 3D FLOTTANT EXACTEMENT COMME SUR L'IMAGE */}
          <div className="absolute z-30">
            <ConcertTicketCard
              eventName="LIVE SONG REGISTRATION TICKET"
              category="CONCERT PASS"
              price="15 000 FCFA"
              ticketCode="GR-89421-50284"
              rotate="-rotate-6"
              onClick={() => setIsCheckoutOpen(true)}
            />
          </div>

        </div>

        {/* BOUTON SOUS LE BILLET */}
        <div className="pt-24 text-center">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="pill-btn-dark px-9 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 mx-auto"
          >
            <span>Réserver Mon Billet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>

      {/* 5. MODALE DE COMMANDE INSTANTANÉE (MTN & AIRTEL MONEY CONGO +242) */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setIsPurchased(false);
        }}
        title={isPurchased ? "Billet Émis avec Succès !" : "Achat de Billet • Godman Stage"}
        description={
          isPurchased
            ? "Votre billet officiel a été généré et est prêt pour l'envoi WhatsApp."
            : "Règlement sécurisé par MTN Mobile Money ou Airtel Money (XAF / FCFA)."
        }
      >
        {!isPurchased ? (
          <form onSubmit={handleBuy} className="space-y-4">
            
            {/* RÉSUMÉ DU BILLET */}
            <div className="p-4 rounded-2xl bg-[#0B132B] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-300 block">
                  Événement Sélectionné
                </span>
                <p className="font-display text-lg tracking-wide uppercase">
                  GODMAN LIVE FESTIVAL
                </p>
                <span className="text-xs text-slate-300">
                  Palais des Congrès • Brazzaville
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block">Tarif unitaire</span>
                <span className="font-display text-2xl font-bold text-white">
                  {formatXAF(unitPrice)}
                </span>
              </div>
            </div>

            {/* FORMULAIRE NOM & WHATSAPP */}
            <Input
              label="Nom et Prénom du titulaire"
              placeholder="Ex: Merveil Makosso"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
            />

            <Input
              label="Numéro WhatsApp (Congo +242)"
              placeholder="+242 06 123 45 67"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Le billet avec QR code sera envoyé directement sur ce WhatsApp."
              required
            />

            {/* SÉLECTION DU MODE DE PAIEMENT CONGOLAIS */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-2">
                Choisir le mode de paiement mobile :
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mtn")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    paymentMethod === "mtn"
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="font-bold text-xs text-amber-700">MTN Mobile Money</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">+242 06 ...</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("airtel")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    paymentMethod === "airtel"
                      ? "border-red-500 bg-red-50 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="font-bold text-xs text-red-700">Airtel Money</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">+242 04 / 05 ...</span>
                </button>
              </div>
            </div>

            {/* SÉLECTION QUANTITÉ */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100">
              <span className="text-xs font-semibold text-slate-700">Nombre de billets :</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-[#0B132B]"
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm">{ticketQuantity}</span>
                <button
                  type="button"
                  onClick={() => setTicketQuantity(Math.min(5, ticketQuantity + 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-[#0B132B]"
                >
                  +
                </button>
              </div>
            </div>

            {/* TOTAL ET VALIDATION */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Total à payer</span>
                <span className="font-display text-2xl font-black text-[#0B132B]">
                  {formatXAF(totalPrice)}
                </span>
              </div>

              <button
                type="submit"
                className="pill-btn-dark px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <span>Payer et Obtenir Mon Billet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        ) : (
          /* ÉCRAN DE CONFIRMATION AVEC BILLET GÉNÉRÉ */
          <div className="space-y-5 text-center">
            
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-display text-2xl uppercase tracking-wider text-[#0B132B]">
                Félicitations, Billet Confirmé !
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Paiement validé via {paymentMethod.toUpperCase()} Mobile Money ({formatXAF(generatedTicket?.amount || 0)}).
              </p>
            </div>

            {/* MINIATURE DU BILLET ÉMIS */}
            <div className="p-4 rounded-2xl bg-[#070D1F] text-white border border-blue-500/30 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-cyan-300 font-bold uppercase tracking-wider">GODMAN LIVE CONCERT</span>
                <Badge variant="success">Valide</Badge>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Titulaire</span>
                  <span className="font-semibold text-sm">{generatedTicket?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Code Sécurisé</span>
                  <span className="font-mono text-cyan-300 font-bold text-sm tracking-wider">
                    {generatedTicket?.code}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS : EXPÉDITION WHATSAPP */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={shareWhatsApp}
                className="w-full py-3 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Ouvrir dans WhatsApp (+242)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsPurchased(false);
                }}
                className="w-full py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-semibold uppercase hover:bg-slate-100 transition-colors"
              >
                Fermer
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* FOOTER */}
      <footer className="relative z-20 border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm text-[#0B132B] uppercase">
              GODMAN STAGE
            </span>
            <span>• Billetterie Officielle Congo-Brazzaville</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link href="/design-system" className="hover:text-blue-600">Design System</Link>
            <span>•</span>
            <span>MTN & Airtel Money</span>
            <span>•</span>
            <span>WhatsApp Connect</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
