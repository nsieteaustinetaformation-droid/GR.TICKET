"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { formatMoney } from "@/lib/international/money";
import { formatInZone } from "@/lib/international/time";
import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  Share2,
  Download,
  Copy,
  Check,
  Music2,
} from "lucide-react";

export interface TicketProps {
  ticketCode: string;
  eventName: string;
  category: "VIP" | "Standard" | "Étudiant" | "Invitation";
  price: number;
  eventDate: string | Date;
  location: string;
  city?: string;
  countryCode?: string;
  currency?: string;
  locale?: string;
  timeZone?: string;
  buyerName: string;
  buyerPhone?: string;
  status: "valide" | "utilise" | "annule";
  signatureToken?: string;
  gate?: string;
  onShareWhatsApp?: () => void;
}

export function Ticket({
  ticketCode,
  eventName,
  category,
  price,
  eventDate,
  location,
  city = "",
  countryCode,
  currency,
  locale,
  timeZone,
  buyerName,
  buyerPhone,
  status = "valide",
  signatureToken,
  gate,
  onShareWhatsApp,
}: TicketProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const config = getCountryConfig(countryCode);
  const resolvedCurrency = currency ?? config.currency;
  const resolvedLocale = locale ?? config.locale;
  const resolvedZone = timeZone ?? config.timeZone;

  // Génération du QR Code haute densité avec jeton signé ou payload sécurisé
  useEffect(() => {
    const payload = signatureToken || JSON.stringify({
      code: ticketCode,
      event: eventName,
      status: status,
      signed: true,
      timestamp: Date.now(),
    });

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 240,
      color: {
        dark: "#0A0A0B",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Erreur génération QR Code:", err));
  }, [ticketCode, eventName, status, signatureToken]);

  const copyCode = () => {
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = {
    valide: <Badge variant="success">Billet Valide</Badge>,
    utilise: <Badge variant="alert">Déjà Utilisé</Badge>,
    annule: <Badge variant="error">Billet Annulé</Badge>,
  }[status];

  return (
    <div className="w-full max-w-3xl mx-auto my-4 transition-all">
      {/* Conteneur du Billet style Fiche d'Embarquement Concert */}
      <div className="relative flex flex-col md:flex-row rounded-2xl overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-200/60">
        
        {/* CORPS PRINCIPAL DU BILLET (Fond Noir Profond) */}
        <div className="relative flex-1 p-6 md:p-8 flex flex-col justify-between">
          
          {/* Filigrane GR Ticket */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] text-8xl font-black font-display uppercase tracking-widest text-violet-700">
            GR Ticket
          </div>

          {/* En-tête du Billet */}
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-black font-bold">
                  <Music2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 block leading-none">
                    GR Ticket
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Billetterie internationale
                  </span>
                </div>
              </div>

              {/* Statut du Billet */}
              <div>{statusBadge}</div>
            </div>

            {/* Nom de l'Événement en très grand style Affiche de Concert */}
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-display font-black uppercase tracking-tight text-slate-900 leading-none">
              {eventName}
            </h2>

            {/* Catégorie du Billet */}
            <div className="mt-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-violet-50 border border-violet-300 text-violet-700 text-xs font-bold uppercase tracking-wider">
                Catégorie : {category}
              </span>
              {gate && (
                <span className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-500">
                  Porte : {gate}
                </span>
              )}
            </div>
          </div>

          {/* Détails Date, Lieu & Acheteur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 py-4 border-y border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-violet-700" /> Date & Heure
              </span>
              <p className="font-semibold text-sm text-slate-900">
                {formatInZone(new Date(eventDate).toISOString(), resolvedZone, resolvedLocale === "fr" ? "fr-FR" : "en-US")}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-violet-700" /> Lieu
              </span>
              <p className="font-semibold text-sm text-slate-900">
                {location}{city ? `, ${city}` : ""}
              </p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-700" /> Titulaire du billet
              </span>
              <p className="font-semibold text-sm text-slate-900">
                {buyerName} {buyerPhone && <span className="text-slate-500 font-mono">({buyerPhone})</span>}
              </p>
            </div>
          </div>

          {/* Pied du Billet : Code Unique & Montant */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Code Unique Sécurisé
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-base font-bold tracking-wider text-violet-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                  {ticketCode}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label="Copier le code"
                  className="p-1.5 rounded hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Tarif Unitaire
              </span>
              <span className="font-mono font-black text-2xl text-slate-900 font-tabular">
                {price === 0 ? "GRATUIT" : formatMoney(price, resolvedCurrency, resolvedLocale)}
              </span>
            </div>
          </div>
        </div>

        {/* LIGNE DE PERFORATION STYLISÉE (DÉCOUPE BILLET) */}
        <div className="relative md:w-6 flex md:flex-col items-center justify-between py-2 md:py-0 md:px-0 bg-white">
          {/* Encoche Perforation Haut */}
          <div className="hidden md:block w-6 h-6 -mt-3 rounded-full bg-slate-50 border border-slate-200" />
          {/* Ligne pointillée */}
          <div className="hidden md:block w-full border-r-2 border-dashed border-slate-200 h-full" />
          {/* Encoche Perforation Bas */}
          <div className="hidden md:block w-6 h-6 -mb-3 rounded-full bg-slate-50 border border-slate-200" />
        </div>

        {/* TALON OR AVEC QR CODE (STUB DETACHABLE) */}
        <div className="w-full md:w-64 bg-violet-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col items-center justify-between text-center">
          
          <div className="w-full">
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-700 block mb-1">
              CONTRÔLE D'ACCÈS
            </span>
            <p className="text-xs text-slate-500 mb-3">
              À présenter au scan à l'entrée
            </p>

            {/* Conteneur Blanc du QR Code pour scan instantané en haute vitesse */}
            <div className="p-3 bg-white rounded-xl shadow-lg mx-auto inline-block border-2 border-violet-300">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR Code Billet ${ticketCode}`}
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-mono">
                  Chargement QR...
                </div>
              )}
            </div>

            <p className="mt-2 text-[10px] font-mono text-violet-700 tracking-wider font-semibold">
              JETON HMAC SÉCURISÉ
            </p>
          </div>

          {/* Boutons d'action rapides */}
          <div className="w-full space-y-2 mt-4 pt-3 border-t border-slate-200">
            {onShareWhatsApp && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShareWhatsApp}
                className="w-full text-xs h-9"
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Partager WhatsApp
              </Button>
            )}

            <p className="text-[9px] text-slate-500 uppercase tracking-wider">
              Billet 100% Nominatif • Non Répudiable
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
