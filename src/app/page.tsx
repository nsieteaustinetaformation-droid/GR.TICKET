"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventCard, EventCardProps } from "@/components/ui/EventCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ConcertTicketCard } from "@/components/ui/ConcertTicketCard";
import { formatXAF, generateTicketCode } from "@/lib/utils";
import {
  Mic2,
  Calendar,
  MapPin,
  Search,
  ShoppingCart,
  User,
  ArrowRight,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Music2,
  Trophy,
  Ticket as TicketIcon,
  Flame,
  Radio,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    title: string;
    venue: string;
    price: number;
    category: string;
  }>({
    title: "Godman Afro-Fusion Festival 2026",
    venue: "Palais des Congrès, Brazzaville",
    price: 15000,
    category: "Festival",
  });

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

  // LISTE DES ÉVÉNEMENTS CONGO-BRAZZAVILLE
  const eventsList: Array<Omit<EventCardProps, "onSelect">> = [
    {
      id: "ev-1",
      title: "Godman Afro-Fusion Festival 2026",
      category: "Festival",
      imageUrl: "/images/ticket_bg.jpg",
      venue: "Palais des Congrès",
      city: "Brazzaville",
      date: "28 Nov 2026 • 20h30",
      price: 15000,
    },
    {
      id: "ev-2",
      title: "Fally Ipupa & Guests Live",
      category: "Concert",
      imageUrl: "/images/concert_guitarist.jpg",
      venue: "Stade Alphonse Massamba-Débat",
      city: "Brazzaville",
      date: "15 Janv 2027 • 19h00",
      price: 10000,
    },
    {
      id: "ev-3",
      title: "Nuit de la Rumba Congolaise",
      category: "VIP Pass",
      imageUrl: "/images/artist_hero.jpg",
      venue: "Hôtel Atlantic Palace",
      city: "Pointe-Noire",
      date: "05 Déc 2026 • 21h00",
      price: 25000,
    },
    {
      id: "ev-4",
      title: "Festival Panafricain FESPAM",
      category: "Festival",
      imageUrl: "/images/festival_stadium.jpg",
      venue: "Esplanade CNRTV",
      city: "Brazzaville",
      date: "20 Fév 2027 • 18h00",
      price: 20000,
    },
    {
      id: "ev-5",
      title: "Gospel & Soul Celebration Live",
      category: "Concert",
      imageUrl: "/images/ticket_bg.jpg",
      venue: "Centre Culturel Russe",
      city: "Brazzaville",
      date: "12 Déc 2026 • 17h30",
      price: 5000,
    },
    {
      id: "ev-6",
      title: "Godman All-Stars New Year Showcase",
      category: "VIP Pass",
      imageUrl: "/images/concert_guitarist.jpg",
      venue: "Club 64 VIP Lounge",
      city: "Brazzaville",
      date: "31 Déc 2026 • 22h00",
      price: 30000,
    },
  ];

  const filteredEvents =
    selectedCategory === "Tous"
      ? eventsList
      : eventsList.filter((e) => e.category === selectedCategory);

  const openCheckoutForEvent = (event: {
    title: string;
    venue: string;
    price: number;
    category: string;
  }) => {
    setSelectedEvent(event);
    setIsPurchased(false);
    setIsCheckoutOpen(true);
  };

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    const code = generateTicketCode();
    setGeneratedTicket({
      code,
      name: buyerName || "Merveil Makosso",
      phone: buyerPhone || "+242 06 123 45 67",
      amount: selectedEvent.price * ticketQuantity,
    });
    setIsPurchased(true);
  };

  const shareWhatsApp = () => {
    if (!generatedTicket) return;
    const msg = encodeURIComponent(
      `🎉 *BILLET OFFICIEL GODMAN RECORDS TIKET* 🎉\n\nÉvénement : ${selectedEvent.title}\nLieu : ${selectedEvent.venue}\nTitulaire : ${generatedTicket.name}\nCode : ${generatedTicket.code}\nTarif payé : ${formatXAF(generatedTicket.amount)}\nMode : ${paymentMethod.toUpperCase()} Mobile Money\n\nConservez ce message, il servira au contrôle d'entrée !`
    );
    window.open(
      `https://wa.me/${generatedTicket.phone.replace(/[^0-9]/g, "")}?text=${msg}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#080412] text-white selection:bg-purple-600 selection:text-white">
      
      {/* 1. NAVBAR SUPÉRIEURE ÉLÉGANTE */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#080412]/85 border-b border-[#251846]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* LOGO ADRIEN / GODMAN TICKETS */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <TicketIcon className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <span className="font-heading font-black text-xl tracking-tight text-white block leading-none">
                GODMAN <span className="text-purple-400">TIKETS</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#A59EBF] uppercase">
                Congo-Brazzaville
              </span>
            </div>
          </Link>

          {/* LIENS NAV */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#A59EBF]">
            <a href="#events" className="hover:text-white transition-colors">Événements</a>
            <Link href="/guichet" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Guichet Express
            </Link>
            <Link href="/scanner" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Scanner
            </Link>
            <Link href="/dashboard" className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> Dashboard
            </Link>
            <Link href="/design-system" className="hover:text-white transition-colors">Design System</Link>
          </nav>

          {/* ACTIONS RAPIDES (SEARCH, CART, PROFILE) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openCheckoutForEvent(eventsList[0])}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-[#A59EBF] hover:text-white hover:border-purple-500/40 transition-colors"
              aria-label="Recherche rapide"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => openCheckoutForEvent(eventsList[0])}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-[#A59EBF] hover:text-white hover:border-purple-500/40 transition-colors relative"
              aria-label="Panier"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold flex items-center justify-center text-white">
                1
              </span>
            </button>

            <button
              onClick={() => openCheckoutForEvent(eventsList[0])}
              className="btn-neon-purple px-5 py-2.5 text-xs font-bold uppercase tracking-wider hidden sm:flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acheter Billet</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION CONCERT & SPORTS TICKETS */}
      <section id="hero" className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        
        {/* CARTE HERO AVEC FOND DE CONCERT ILLUMINÉ */}
        <div className="relative rounded-3xl overflow-hidden border border-[#261C47] shadow-2xl min-h-[540px] flex flex-col justify-center items-center text-center p-8 sm:p-16">
          
          {/* IMAGE DE FOND DU CONCERT SOUS PROJECTEURS VIOLETS */}
          <Image
            src="/images/ticket_bg.jpg"
            alt="Concert crowd under purple lights"
            fill
            priority
            className="object-cover object-center opacity-40 -z-10"
          />

          {/* DÉGRADÉ VIOLET PROFOND EN SURIMPRESSION */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#080412]/80 via-[#120B24]/75 to-[#080412] -z-10" />

          {/* HALO LUMINEUX D'AMBIANCE */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none -z-10 ambient-glow" />

          {/* TITRE PRINCIPAL EXACTEMENT COMME LE MODÈLE ADRIEN */}
          <div className="max-w-4xl mx-auto space-y-6">
            
            <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.08]">
              Réservez Vos Billets Pour Les <br className="hidden sm:inline" />
              <span className="text-purple-gradient">Meilleurs Concerts & Spectacles</span>
            </h1>

            <p className="text-sm sm:text-base text-[#A59EBF] max-w-2xl mx-auto leading-relaxed">
              Vivez l'adrénaline des concerts live et des grands festivals au Congo-Brazzaville.
              Paiement instantané par <strong>MTN Mobile Money</strong> et <strong>Airtel Money</strong> avec délivrance sécurisée sur <strong>WhatsApp</strong>.
            </p>

            {/* BOUTONS D'ACTION */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href="#events"
                className="btn-neon-purple px-8 py-3.5 text-sm font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <span>Explorer les Événements</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => openCheckoutForEvent(eventsList[0])}
                className="btn-glass-outline px-7 py-3.5 text-sm font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-purple-400" />
                <span>Guichet Rapide</span>
              </button>
            </div>

            {/* COMPTEUR DE STATISTIQUES */}
            <div className="pt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-white/10 mt-10">
              <div>
                <span className="font-heading font-black text-2xl sm:text-3xl text-white block">
                  50+
                </span>
                <span className="text-[11px] text-[#A59EBF] uppercase font-medium mt-1 block">
                  Événements
                </span>
              </div>

              <div>
                <span className="font-heading font-black text-2xl sm:text-3xl text-purple-400 block">
                  50K+
                </span>
                <span className="text-[11px] text-[#A59EBF] uppercase font-medium mt-1 block">
                  Billets Vendus
                </span>
              </div>

              <div>
                <span className="font-heading font-black text-2xl sm:text-3xl text-white block">
                  99%
                </span>
                <span className="text-[11px] text-[#A59EBF] uppercase font-medium mt-1 block">
                  Entrées Validées
                </span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 3. RUBAN DÉFILANT (MARQUEE RIBBON BANNER) */}
      <section className="ribbon-banner py-4 overflow-hidden relative">
        <div className="flex items-center gap-8 whitespace-nowrap text-xs font-bold uppercase tracking-widest text-purple-300 animate-pulse">
          <div className="flex items-center gap-8 shrink-0">
            <span>Concerts Live ☼</span>
            <span>Festivals Congo ☼</span>
            <span>Billets Vérifiés QR Code ☼</span>
            <span>MTN Mobile Money ☼</span>
            <span>Airtel Money ☼</span>
            <span>Envoi WhatsApp Instantané ☼</span>
            <span>Meilleur Prix XAF ☼</span>
            <span>Accès VIP Coupe-File ☼</span>
          </div>
          <div className="flex items-center gap-8 shrink-0" aria-hidden="true">
            <span>Concerts Live ☼</span>
            <span>Festivals Congo ☼</span>
            <span>Billets Vérifiés QR Code ☼</span>
            <span>MTN Mobile Money ☼</span>
            <span>Airtel Money ☼</span>
            <span>Envoi WhatsApp Instantané ☼</span>
            <span>Meilleur Prix XAF ☼</span>
            <span>Accès VIP Coupe-File ☼</span>
          </div>
        </div>
      </section>

      {/* 4. CARTES PLEINE LARGEUR DES CATÉGORIES (CONCERTS VS FESTIVALS) */}
      <section id="categories" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARTE 1 : CONCERTS LIVE */}
          <div
            onClick={() => {
              setSelectedCategory("Concert");
              const el = document.getElementById("events");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="relative h-64 rounded-3xl overflow-hidden border border-[#251846] cursor-pointer group shadow-xl"
          >
            <Image
              src="/images/concert_guitarist.jpg"
              alt="Concerts live guitar"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080412] via-[#080412]/50 to-transparent" />

            <div className="absolute inset-0 p-8 flex flex-col justify-end text-center items-center">
              <div className="w-11 h-11 rounded-full bg-purple-600/40 backdrop-blur-md border border-purple-400/50 flex items-center justify-center text-purple-200 mb-3 shadow-lg shadow-purple-600/40">
                <Music2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-2xl text-white">
                Concerts Live
              </h3>
              <p className="text-xs text-[#A59EBF] mt-1">
                Expériences musicales immersives et acoustiques de haut vol
              </p>
            </div>
          </div>

          {/* CARTE 2 : FESTIVALS & GRANDS STADES */}
          <div
            onClick={() => {
              setSelectedCategory("Festival");
              const el = document.getElementById("events");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="relative h-64 rounded-3xl overflow-hidden border border-[#251846] cursor-pointer group shadow-xl"
          >
            <Image
              src="/images/festival_stadium.jpg"
              alt="Festivals in stadium"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080412] via-[#080412]/50 to-transparent" />

            <div className="absolute inset-0 p-8 flex flex-col justify-end text-center items-center">
              <div className="w-11 h-11 rounded-full bg-indigo-600/40 backdrop-blur-md border border-indigo-400/50 flex items-center justify-center text-indigo-200 mb-3 shadow-lg shadow-indigo-600/40">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-2xl text-white">
                Festivals & Stades
              </h3>
              <p className="text-xs text-[#A59EBF] mt-1">
                Rassemblements géants, scènes internationales et feux d'artifice
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* 5. TOP ÉVÉNEMENTS (GRILLE DES CONCERTS EN VENTE) */}
      <section id="events" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* EN-TÊTE DE SECTION AVEC FILTRES */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-[#251846]">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
              BILLETTERIE EN TEMPS RÉEL
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
              Top Événements
            </h2>
            <p className="text-xs text-[#A59EBF] mt-1">
              Ne manquez aucune des plus grandes dates au Congo-Brazzaville.
            </p>
          </div>

          {/* SÉLECTEUR DE CATÉGORIES EN PILULE */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {["Tous", "Concert", "Festival", "VIP Pass"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                    : "bg-white/5 text-[#A59EBF] hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE DES ÉVÉNEMENTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              {...evt}
              onSelect={() => openCheckoutForEvent(evt)}
            />
          ))}
        </div>

      </section>

      {/* 6. BANNIÈRE PROMO MEMBRE VIP (BECOME A MEMBER) */}
      <section id="membership" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-purple-900/60 via-[#1C1138] to-indigo-950/60 border border-purple-500/30 shadow-2xl text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Club VIP Godman Records</span>
          </div>

          <h3 className="font-heading font-black text-2xl sm:text-4xl text-white">
            Devenez Membre VIP & Profitez d'Avantages Exclusifs
          </h3>

          <p className="text-xs sm:text-sm text-[#A59EBF] max-w-xl mx-auto">
            Adhérez pour bénéficier de 0 FCFA de frais de service sur tous vos billets,
            d'un accès prioritaire coupe-file et de rencontres exclusives avec les artistes.
          </p>

          <div className="pt-2">
            <button
              onClick={() => openCheckoutForEvent(eventsList[0])}
              className="btn-neon-purple px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <span>En Savoir Plus Sur Le Pass VIP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 7. MODALE DE COMMANDE INSTANTANÉE (MTN & AIRTEL MONEY CONGO +242) */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setIsPurchased(false);
        }}
        title={isPurchased ? "Billet Émis avec Succès !" : "Achat de Billet Sécurisé"}
        description={
          isPurchased
            ? "Votre billet officiel a été généré et est prêt pour l'envoi WhatsApp."
            : "Règlement instantané par MTN Mobile Money ou Airtel Money au Congo-Brazzaville."
        }
      >
        {!isPurchased ? (
          <form onSubmit={handleBuy} className="space-y-4">
            
            {/* RÉSUMÉ DE L'ÉVÉNEMENT SÉLECTIONNÉ */}
            <div className="p-4 rounded-2xl bg-[#090514] border border-[#251846] flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 block font-bold">
                  {selectedEvent.category}
                </span>
                <p className="font-heading text-lg font-bold text-white tracking-wide">
                  {selectedEvent.title}
                </p>
                <span className="text-xs text-[#A59EBF]">
                  {selectedEvent.venue}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-[#6E6589] block">Prix unitaire</span>
                <span className="font-heading text-2xl font-black text-white font-tabular">
                  {formatXAF(selectedEvent.price)}
                </span>
              </div>
            </div>

            {/* FORMULAIRE NOM & WHATSAPP */}
            <Input
              label="Nom et Prénom du titulaire"
              placeholder="Ex: Dieudonné Ondongo"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
            />

            <Input
              label="Numéro WhatsApp (Congo +242)"
              placeholder="+242 06 123 45 67"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-purple-400" />}
              helperText="Le billet officiel avec QR code sera expédié sur ce numéro."
              required
            />

            {/* SÉLECTION DU MODE DE PAIEMENT CONGOLAIS */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A59EBF] block mb-2">
                Choisir le mode de paiement mobile :
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mtn")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === "mtn"
                      ? "border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10"
                      : "border-[#251846] bg-[#090514] hover:bg-white/5"
                  }`}
                >
                  <span className="font-bold text-xs text-amber-400">MTN Mobile Money</span>
                  <span className="text-[10px] text-[#A59EBF] mt-0.5">+242 06 ...</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("airtel")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === "airtel"
                      ? "border-red-500 bg-red-500/15 shadow-md shadow-red-500/10"
                      : "border-[#251846] bg-[#090514] hover:bg-white/5"
                  }`}
                >
                  <span className="font-bold text-xs text-red-400">Airtel Money</span>
                  <span className="text-[10px] text-[#A59EBF] mt-0.5">+242 04 / 05 ...</span>
                </button>
              </div>
            </div>

            {/* QUANTITÉ */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090514] border border-[#251846]">
              <span className="text-xs font-semibold text-[#A59EBF]">Nombre de billets :</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-sm text-white transition-colors"
                >
                  -
                </button>
                <span className="font-mono font-bold text-sm text-white">{ticketQuantity}</span>
                <button
                  type="button"
                  onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 font-bold text-sm text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* TOTAL ET VALIDATION */}
            <div className="pt-3 flex items-center justify-between border-t border-[#251846]">
              <div>
                <span className="text-[10px] uppercase text-[#6E6589] block">Total net à payer</span>
                <span className="font-heading text-2xl font-black text-white font-tabular">
                  {formatXAF(selectedEvent.price * ticketQuantity)}
                </span>
              </div>

              <button
                type="submit"
                className="btn-neon-purple px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <span>Confirmer & Payer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        ) : (
          /* CONFIRMATION DE COMMANDE & BILLET */
          <div className="space-y-5 text-center">
            
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-heading text-2xl font-bold uppercase tracking-wide text-white">
                Félicitations, Paiement Confirmé !
              </h4>
              <p className="text-xs text-[#A59EBF] mt-1">
                Transaction validée via {paymentMethod.toUpperCase()} Mobile Money ({formatXAF(generatedTicket?.amount || 0)}).
              </p>
            </div>

            {/* APERÇU DU BILLET OFFICIEL */}
            <div className="p-4 rounded-2xl bg-[#090514] text-white border border-purple-500/40 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-300 font-bold uppercase tracking-wider">
                  {selectedEvent.title}
                </span>
                <Badge variant="success">Valide</Badge>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-[#6E6589] uppercase block">Titulaire</span>
                  <span className="font-semibold text-sm text-white">{generatedTicket?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6E6589] uppercase block">Code Sécurisé</span>
                  <span className="font-mono text-purple-300 font-bold text-sm tracking-wider">
                    {generatedTicket?.code}
                  </span>
                </div>
              </div>
            </div>

            {/* EXPÉDITION DIRECTE WHATSAPP */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={shareWhatsApp}
                className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Ouvrir & Envoyer sur WhatsApp (+242)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsPurchased(false);
                }}
                className="w-full py-2.5 rounded-full border border-white/15 text-[#A59EBF] hover:text-white hover:bg-white/5 text-xs font-semibold uppercase transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* 8. FOOTER NOIR ET VIOLET NEON */}
      <footer className="border-t border-[#251846] bg-[#06030E] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#A59EBF]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
                <TicketIcon className="w-4 h-4" />
              </div>
              <span className="font-heading font-black text-lg text-white">
                GODMAN TIKETS
              </span>
            </div>
            <p className="text-xs text-[#6E6589] leading-relaxed">
              La plateforme de billetterie nouvelle génération pour les concerts et festivals live en République du Congo.
            </p>
          </div>

          <div>
            <h5 className="font-heading font-bold text-white uppercase tracking-wider mb-3">
              Liens Rapides
            </h5>
            <ul className="space-y-2">
              <li><a href="#events" className="hover:text-white transition-colors">Tous les Événements</a></li>
              <li><Link href="/guichet" className="hover:text-amber-400 transition-colors">Guichet Express</Link></li>
              <li><Link href="/scanner" className="hover:text-cyan-400 transition-colors">Scanner de Contrôle</Link></li>
              <li><Link href="/dashboard" className="hover:text-purple-300 transition-colors">Tableau de Bord & Analytics</Link></li>
              <li><Link href="/design-system" className="hover:text-white transition-colors">Design System</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-heading font-bold text-white uppercase tracking-wider mb-3">
              Support & Sécurité
            </h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Paiement MTN & Airtel</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vérification QR Code</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Centre d'Aide WhatsApp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Conditions Générales</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-heading font-bold text-white uppercase tracking-wider mb-3">
              Communauté & Label
            </h5>
            <p className="text-xs text-[#6E6589] mb-3">
              Godman Records • Brazzaville & Pointe-Noire.
            </p>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-[10px] text-purple-300 font-mono">
                Brazzaville • +242
              </span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#1C1236] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6E6589]">
          <p>© 2026 Godman Records Tiket. Tous droits réservés.</p>
          <p className="font-mono">Paiements XAF • Billetterie Sécurisée • Conforme RLS</p>
        </div>
      </footer>

    </div>
  );
}
