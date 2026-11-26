"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Ticket as TicketIcon, ArrowLeft, CheckCircle2, Share2,
  User, Phone, Banknote, Plus, Minus, Search, RefreshCw,
  Shield
} from "lucide-react";
import { getEventsByCategory } from "@/lib/store/events";
import { useStoreVersion } from "@/lib/store/subscribe";
import { addOrder } from "@/lib/store/orders";
import { createOrderFromPurchase, buildWhatsAppMessage, formatWhatsAppUrl } from "@/lib/ticket-engine";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { paymentMethodLabel, type Locale } from "@/lib/international/messages";
import { formatMoney } from "@/lib/international/money";
import type { EventItem, TicketType, PaymentMethod, Order } from "@/lib/types";
import { RequireAuth } from "@/components/system/RequireAuth";

type Step = "select_event" | "select_type" | "buyer_info" | "payment" | "confirm";

function GuichetPageInner() {
  useStoreVersion();
  const [step, setStep] = useState<Step>("select_event");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedType, setSelectedType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [elapsed, setElapsed] = useState<number | null>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  const config = getCountryConfig(selectedEvent?.countryCode);
  const locale: Locale = config.locale;
  const money = (amount: number) => formatMoney(amount, selectedEvent?.currency ?? config.currency, locale);
  const paymentOptions = config.paymentMethods.length > 0 ? config.paymentMethods : ["card"];

  const filteredEvents = getEventsByCategory("Tous").filter(e =>
    e.status === "published" &&
    (e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function handleSelectEvent(ev: EventItem) {
    setSelectedEvent(ev);
    setSelectedType(null);
    setQuantity(1);
    setStep("select_type");
  }

  function handleSelectType(tt: TicketType) {
    setSelectedType(tt);
    setStep("buyer_info");
  }

  function handleBuyerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("payment");
  }

  function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvent || !selectedType) return;
    const order = createOrderFromPurchase({
      event: selectedEvent, ticketType: selectedType, buyerName: buyerName || "Client Guichet",
      buyerPhone: buyerPhone || "—", paymentMethod, quantity,
    });
    addOrder(order);
    const now = Date.now();
    const diff = startTime.current > 0 ? Math.round((now - startTime.current) / 1000) : null;
    setElapsed(diff);
    setCompletedOrder(order);
    setStep("confirm");
  }

  function handleReset() {
    setStep("select_event");
    setSelectedEvent(null);
    setSelectedType(null);
    setQuantity(1);
    setBuyerName("");
    setBuyerPhone("");
    setPaymentMethod("card");
    setCompletedOrder(null);
    setSearchQuery("");
    setElapsed(null);
    startTime.current = Date.now();
  }

  function sendWhatsApp(ticket: typeof completedOrder extends null ? never : Order["tickets"][0]) {
    const msg = buildWhatsAppMessage(ticket);
    window.open(formatWhatsAppUrl(ticket.buyerPhone, msg), "_blank");
  }

  return (
    <div className="min-h-screen bg-[#080412] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#080412]/90 border-b border-[#251846] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#A59EBF]" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <TicketIcon className="w-4 h-4 text-amber-950" />
            </div>
            <div>
              <span className="font-heading font-black text-base text-white block leading-none">GUICHET EXPRESS</span>
              <span className="text-[10px] font-mono text-[#A59EBF] uppercase tracking-wider">Vente Rapide Tactile</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-semibold">Connexion Securisee</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Progress Steps */}
        {step !== "confirm" && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {(["select_event", "select_type", "buyer_info", "payment"] as Step[]).map((s, i) => {
              const labels = ["Evenement", "Type Billet", "Acheteur", "Paiement"];
              const stepNums = { select_event: 0, select_type: 1, buyer_info: 2, payment: 3 };
              const currentNum = stepNums[step as keyof typeof stepNums] ?? 0;
              const isDone = i < currentNum;
              const isActive = i === currentNum;
              return (
                <React.Fragment key={s}>
                  <div className={
                    "flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all " +
                    (isActive ? "bg-purple-600 text-white" : isDone ? "bg-emerald-600/30 text-emerald-400" : "bg-white/5 text-[#6E6589]")
                  }>
                    <span className={
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black " +
                      (isActive ? "bg-white text-purple-700" : isDone ? "bg-emerald-500 text-white" : "bg-white/10 text-[#6E6589]")
                    }>
                      {isDone ? "✓" : i + 1}
                    </span>
                    {labels[i]}
                  </div>
                  {i < 3 && <div className={"h-px w-6 shrink-0 " + (i < currentNum ? "bg-emerald-500" : "bg-[#251846]")} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* STEP 1: Select Event */}
        {step === "select_event" && (
          <div className="space-y-4">
            <div>
              <h1 className="font-heading font-black text-2xl text-white">Choisir un Evenement</h1>
              <p className="text-sm text-[#A59EBF] mt-1">Selectionnez l evenement pour la vente.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E6589]" />
              <input
                type="text" placeholder="Rechercher un evenement..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#120B24] border border-[#251846] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-[#6E6589] focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="space-y-3">
              {filteredEvents.map(ev => {
                const sold = ev.ticketTypes.reduce((s, t) => s + t.soldQuantity, 0);
                const total = ev.ticketTypes.reduce((s, t) => s + t.totalQuantity, 0);
                const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
                const minPrice = Math.min(...ev.ticketTypes.map(t => t.price));
                return (
                  <button key={ev.id} onClick={() => handleSelectEvent(ev)}
                    className="w-full text-left bg-[#120B24] border border-[#251846] rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all group active:scale-[0.99]">
                    <div className="flex items-start gap-4 p-4">
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0A0716]">
                        <Image src={ev.imageUrl} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">{ev.category}</span>
                        <h3 className="font-heading font-bold text-sm text-white leading-tight mt-0.5 line-clamp-1">{ev.title}</h3>
                        <p className="text-xs text-[#A59EBF] mt-1">{ev.date} — {ev.venue}, {ev.city}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-1.5 bg-[#251846] rounded-full overflow-hidden">
                            <div className={"h-full rounded-full transition-all " + (pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500")}
                              style={{ width: pct + "%" }} />
                          </div>
                          <span className="text-[10px] font-mono text-[#6E6589] shrink-0">{pct}% vendu</span>
                          <span className="text-xs font-heading font-black text-white shrink-0">des {money(minPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredEvents.length === 0 && (
                <div className="text-center py-12 text-[#6E6589]">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucun evenement trouve</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Select Ticket Type */}
        {step === "select_type" && selectedEvent && (
          <div className="space-y-4">
            <div>
              <button onClick={() => setStep("select_event")} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mb-3">
                <ArrowLeft className="w-3 h-3" /> Retour
              </button>
              <h1 className="font-heading font-black text-2xl text-white">{selectedEvent.title}</h1>
              <p className="text-sm text-[#A59EBF] mt-1">{selectedEvent.date} — {selectedEvent.venue}</p>
            </div>
            <div className="space-y-3">
              {selectedEvent.ticketTypes.map(tt => {
                const remaining = tt.totalQuantity - tt.soldQuantity;
                const isSoldOut = remaining <= 0;
                return (
                  <button key={tt.id} onClick={() => !isSoldOut && handleSelectType(tt)} disabled={isSoldOut}
                    className={"w-full text-left rounded-2xl border p-5 transition-all " +
                      (isSoldOut ? "opacity-40 cursor-not-allowed border-[#251846] bg-[#0A0716]" :
                        "border-[#251846] bg-[#120B24] hover:border-purple-500 hover:bg-[#1B1136] active:scale-[0.99] group")}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-black text-lg text-white">{tt.name}</h3>
                        {tt.benefits && (
                          <ul className="mt-2 space-y-1">
                            {tt.benefits.map((b, i) => (
                              <li key={i} className="text-xs text-[#A59EBF] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />{b}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className={"text-xs mt-3 font-semibold " + (remaining < 20 ? "text-red-400" : "text-emerald-400")}>
                          {isSoldOut ? "COMPLET" : remaining < 20 ? remaining + " places restantes" : remaining + " disponibles"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-heading font-black text-2xl text-white">{money(tt.price)}</span>
                        <span className="block text-[10px] text-[#6E6589] uppercase font-medium mt-0.5">par billet</span>
                        {!isSoldOut && (
                          <span className="mt-3 inline-flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-purple-500 transition-colors">
                            <TicketIcon className="w-3 h-3" /> Choisir
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Buyer Info */}
        {step === "buyer_info" && selectedEvent && selectedType && (
          <div className="space-y-4">
            <div>
              <button onClick={() => setStep("select_type")} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mb-3">
                <ArrowLeft className="w-3 h-3" /> Retour
              </button>
              <h1 className="font-heading font-black text-2xl text-white">Informations Acheteur</h1>
              <p className="text-sm text-[#A59EBF] mt-1">{selectedEvent.title} — {selectedType.name}</p>
            </div>
            <form onSubmit={handleBuyerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A59EBF] uppercase tracking-wider mb-2">
                  <User className="inline w-3.5 h-3.5 mr-1" />Nom Complet
                </label>
                <input
                  type="text" placeholder="Ex: Alice Martin"
                  value={buyerName} onChange={e => setBuyerName(e.target.value)}
                  className="w-full bg-[#120B24] border border-[#251846] rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6E6589] focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A59EBF] uppercase tracking-wider mb-2">
                  <Phone className="inline w-3.5 h-3.5 mr-1" />Numéro WhatsApp (indicatif international)
                </label>
                <input
                  type="tel" placeholder="Ex: +33 6 12 34 56 78"
                  value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)}
                  className="w-full bg-[#120B24] border border-[#251846] rounded-xl px-4 py-3.5 text-sm text-white placeholder-[#6E6589] focus:outline-none focus:border-purple-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A59EBF] uppercase tracking-wider mb-3">Nombre de billets</label>
                <div className="flex items-center gap-4 bg-[#120B24] border border-[#251846] rounded-xl p-4">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-[#251846] hover:bg-[#3B2C6E] flex items-center justify-center transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-heading font-black text-2xl text-white flex-1 text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-10 h-10 rounded-xl bg-[#251846] hover:bg-[#3B2C6E] flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0D0820] border border-[#251846] rounded-xl">
                <span className="text-sm text-[#A59EBF]">Total a payer</span>
                <span className="font-heading font-black text-xl text-white">{money(selectedType.price * quantity)}</span>
              </div>
              <button type="submit" className="btn-neon-purple w-full py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2">
                Continuer vers Paiement
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: Payment */}
        {step === "payment" && selectedEvent && selectedType && (
          <div className="space-y-4">
            <div>
              <button onClick={() => setStep("buyer_info")} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mb-3">
                <ArrowLeft className="w-3 h-3" /> Retour
              </button>
              <h1 className="font-heading font-black text-2xl text-white">Mode de Paiement</h1>
              <p className="text-sm text-[#A59EBF] mt-1">Selectionnez le moyen de paiement</p>
            </div>
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {paymentOptions.map(method => (
                  <button key={method} type="button" onClick={() => setPaymentMethod(method)}
                    className={"w-full p-4 rounded-2xl border flex items-center gap-4 transition-all " +
                      (paymentMethod === method
                        ? "border-purple-400 bg-purple-500/10"
                        : "border-[#251846] bg-[#120B24] hover:border-white/20")}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 bg-purple-500 text-white">
                      {paymentMethodLabel(locale, method).slice(0, 1)}
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-sm text-white">{paymentMethodLabel(locale, method)}</span>
                      <span className="block text-xs text-[#A59EBF]">{config.currency} · {config.countryCode}</span>
                    </div>
                    {paymentMethod === method && <CheckCircle2 className="w-5 h-5 ml-auto text-purple-400" />}
                  </button>
                ))}
              </div>
              <div className="p-5 bg-[#0D0820] border border-[#251846] rounded-2xl space-y-3">
                <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wide">Recapitulatif</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#A59EBF]"><span>Evenement</span><span className="text-white font-medium text-right max-w-[60%] truncate">{selectedEvent.title}</span></div>
                  <div className="flex justify-between text-[#A59EBF]"><span>Type</span><span className="text-white font-medium">{selectedType.name}</span></div>
                  <div className="flex justify-between text-[#A59EBF]"><span>Acheteur</span><span className="text-white font-medium">{buyerName || "—"}</span></div>
                  <div className="flex justify-between text-[#A59EBF]"><span>Telephone</span><span className="text-white font-mono">{buyerPhone}</span></div>
                  <div className="flex justify-between text-[#A59EBF]"><span>Billets</span><span className="text-white font-medium">{quantity}</span></div>
                  <div className="flex justify-between pt-2 border-t border-[#251846]">
                    <span className="text-[#A59EBF] font-semibold">TOTAL</span>
                    <span className="font-heading font-black text-base text-white">{money(selectedType.price * quantity)}</span>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-neon-purple w-full py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2">
                <Banknote className="w-4 h-4" /> Confirmer le Paiement & Generer Billets
              </button>
            </form>
          </div>
        )}

        {/* STEP 5: Confirmation */}
        {step === "confirm" && completedOrder && (
          <div className="space-y-5">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="font-heading font-black text-2xl text-white">Vente Confirmee !</h1>
              {elapsed !== null && (
                <p className="text-xs text-emerald-400 font-mono mt-1">Traite en {elapsed}s</p>
              )}
              <p className="text-sm text-[#A59EBF] mt-2">
                {completedOrder.ticketCount} billet(s) genere(s) — {money(completedOrder.totalAmount)} via {completedOrder.paymentMethod.toUpperCase()}
              </p>
            </div>

            <div className="space-y-3">
              {completedOrder.tickets.map((ticket, i) => (
                <div key={ticket.id} className="bg-[#0D0820] border border-purple-500/30 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 bg-purple-600/10 border-b border-purple-500/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Billet #{i + 1} — {ticket.ticketTypeName}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">VALIDE</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#6E6589] uppercase block">Titulaire</span>
                      <span className="text-white font-semibold mt-0.5 block">{ticket.buyerName}</span>
                    </div>
                    <div>
                      <span className="text-[#6E6589] uppercase block">Code Billet</span>
                      <span className="text-purple-300 font-mono font-bold mt-0.5 block tracking-wider">{ticket.code}</span>
                    </div>
                    <div>
                      <span className="text-[#6E6589] uppercase block">Evenement</span>
                      <span className="text-white font-medium mt-0.5 block line-clamp-1">{ticket.eventTitle}</span>
                    </div>
                    <div>
                      <span className="text-[#6E6589] uppercase block">Prix Paye</span>
                      <span className="text-white font-heading font-black mt-0.5 block">{money(ticket.price)}</span>
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <button onClick={() => sendWhatsApp(ticket)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20">
                      <Share2 className="w-3.5 h-3.5" /> Envoyer sur WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleReset}
              className="w-full py-4 rounded-2xl border border-[#251846] text-[#A59EBF] hover:text-white hover:bg-white/5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" /> Nouvelle Vente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuichetPage() {
  return <RequireAuth><GuichetPageInner /></RequireAuth>;
}