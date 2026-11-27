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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <TicketIcon className="w-4 h-4 text-amber-950" />
            </div>
            <div>
              <span className="font-heading font-black text-base text-slate-900 block leading-none">GUICHET EXPRESS</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Vente Rapide Tactile</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="text-xs text-emerald-600 font-semibold">Connexion Securisee</span>
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
                    "flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border " +
                    (isActive ? "bg-violet-600 border-violet-600 text-white" : isDone ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500")
                  }>
                    <span className={
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black " +
                      (isActive ? "bg-white text-violet-700" : isDone ? "bg-emerald-600 text-white" : "bg-white text-slate-400")
                    }>
                      {isDone ? "✓" : i + 1}
                    </span>
                    {labels[i]}
                  </div>
                  {i < 3 && <div className={"h-px w-6 shrink-0 " + (i < currentNum ? "bg-emerald-500" : "bg-slate-200")} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* STEP 1: Select Event */}
        {step === "select_event" && (
          <div className="space-y-4">
            <div>
              <h1 className="font-heading font-black text-2xl text-slate-900">Choisir un Evenement</h1>
              <p className="text-sm text-slate-500 mt-1">Selectionnez l evenement pour la vente.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" placeholder="Rechercher un evenement..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors"
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
                    className="w-full text-left rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-violet-400 hover:shadow-lg hover:shadow-slate-200/50 transition-all group active:scale-[0.99]">
                    <div className="flex items-start gap-4 p-4">
                      <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        <Image src={ev.imageUrl} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-violet-600 tracking-wider">{ev.category}</span>
                        <h3 className="font-heading font-bold text-sm text-slate-900 leading-tight mt-0.5 line-clamp-1">{ev.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{ev.date} — {ev.venue}, {ev.city}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={"h-full rounded-full transition-all " + (pct > 80 ? "bg-rose-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500")}
                              style={{ width: pct + "%" }} />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">{pct}% vendu</span>
                          <span className="text-xs font-heading font-black text-slate-900 shrink-0">des {money(minPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredEvents.length === 0 && (
                <div className="text-center py-12 text-slate-500">
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
              <button onClick={() => setStep("select_event")} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 mb-3">
                <ArrowLeft className="w-3 h-3" /> Retour
              </button>
              <h1 className="font-heading font-black text-2xl text-slate-900">{selectedEvent.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{selectedEvent.date} — {selectedEvent.venue}</p>
            </div>
            <div className="space-y-3">
              {selectedEvent.ticketTypes.map(tt => {
                const remaining = tt.totalQuantity - tt.soldQuantity;
                const isSoldOut = remaining <= 0;
                return (
                  <button key={tt.id} onClick={() => !isSoldOut && handleSelectType(tt)} disabled={isSoldOut}
                    className={"w-full text-left rounded-2xl border p-5 shadow-sm transition-all " +
                      (isSoldOut ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed" :
                        "border-slate-200 bg-white hover:border-violet-500 hover:bg-violet-50/50 hover:shadow-lg hover:shadow-slate-200/50 active:scale-[0.99] group")}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-black text-lg text-slate-900">{tt.name}</h3>
                        {tt.benefits && (
                          <ul className="mt-2 space-y-1">
                            {tt.benefits.map((b, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />{b}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p className={"text-xs mt-3 font-semibold " + (remaining < 20 ? "text-rose-600" : "text-emerald-600")}>
                          {isSoldOut ? "COMPLET" : remaining < 20 ? remaining + " places restantes" : remaining + " disponibles"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-heading font-black text-2xl text-slate-900">{money(tt.price)}</span>
                        <span className="block text-[10px] text-slate-500 uppercase font-medium mt-0.5">par billet</span>
                        {!isSoldOut && (
                          <span className="mt-3 inline-flex items-center gap-1 bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-violet-700 transition-colors">
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
              <button onClick={() => setStep("select_type")} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 mb-3">
                <ArrowLeft className="w-3 h-3" /> Retour
              </button>
              <h1 className="font-heading font-black text-2xl text-slate-900">Informations Acheteur</h1>
              <p className="text-sm text-slate-500 mt-1">{selectedEvent.title} — {selectedType.name}</p>
            </div>
            <form onSubmit={handleBuyerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  <User className="inline w-3.5 h-3.5 mr-1" />Nom Complet
                </label>
                <input
                  type="text" placeholder="Ex: Alice Martin"
                  value={buyerName} onChange={e => setBuyerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  <Phone className="inline w-3.5 h-3.5 mr-1" />Numéro WhatsApp (indicatif international)
                </label>
                <input
                  type="tel" placeholder="Ex: +33 6 12 34 56 78"
                  value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Nombre de billets</label>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-[#F6F7FB] p-4">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-heading font-black text-2xl text-slate-900 flex-1 text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#F6F7FB] border border-slate-200 rounded-xl">
                <span className="text-sm text-slate-600">Total a payer</span>
                <span className="font-heading font-black text-xl text-slate-900">{money(selectedType.price * quantity)}</span>
              </div>
              <button type="submit" className="w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700 py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-100">
                Continuer vers Paiement
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: Payment */}
        {step === "payment" && selectedEvent && selectedType && (
          <div className="space-y-4">
            <div>
              <button onClick={() => setStep("buyer_info")} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1 mb-3">
                <ArrowLeft className="w-3 h-3" /> Retour
              </button>
              <h1 className="font-heading font-black text-2xl text-slate-900">Mode de Paiement</h1>
              <p className="text-sm text-slate-500 mt-1">Selectionnez le moyen de paiement</p>
            </div>
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {paymentOptions.map(method => (
                  <button key={method} type="button" onClick={() => setPaymentMethod(method)}
                    className={"w-full p-4 rounded-2xl border flex items-center gap-4 transition-all " +
                      (paymentMethod === method
                        ? "border-violet-500 bg-violet-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-violet-300")}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 bg-violet-600 text-white">
                      {paymentMethodLabel(locale, method).slice(0, 1)}
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-sm text-slate-900">{paymentMethodLabel(locale, method)}</span>
                      <span className="block text-xs text-slate-500">{config.currency} · {config.countryCode}</span>
                    </div>
                    {paymentMethod === method && <CheckCircle2 className="w-5 h-5 ml-auto text-violet-600" />}
                  </button>
                ))}
              </div>
              <div className="p-5 bg-[#F6F7FB] border border-slate-200 rounded-2xl space-y-3">
                <h3 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wide">Recapitulatif</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600"><span>Evenement</span><span className="text-slate-900 font-medium text-right max-w-[60%] truncate">{selectedEvent.title}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Type</span><span className="text-slate-900 font-medium">{selectedType.name}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Acheteur</span><span className="text-slate-900 font-medium">{buyerName || "—"}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Telephone</span><span className="text-slate-900 font-mono">{buyerPhone}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Billets</span><span className="text-slate-900 font-medium">{quantity}</span></div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-semibold">TOTAL</span>
                    <span className="font-heading font-black text-base text-slate-900">{money(selectedType.price * quantity)}</span>
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700 py-4 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-100">
                <Banknote className="w-4 h-4" /> Confirmer le Paiement & Generer Billets
              </button>
            </form>
          </div>
        )}

        {/* STEP 5: Confirmation */}
        {step === "confirm" && completedOrder && (
          <div className="space-y-5">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="font-heading font-black text-2xl text-slate-900">Vente Confirmee !</h1>
              {elapsed !== null && (
                <p className="text-xs text-emerald-600 font-mono mt-1">Traite en {elapsed}s</p>
              )}
              <p className="text-sm text-slate-500 mt-2">
                {completedOrder.ticketCount} billet(s) genere(s) — {money(completedOrder.totalAmount)} via {completedOrder.paymentMethod.toUpperCase()}
              </p>
            </div>

            <div className="space-y-3">
              {completedOrder.tickets.map((ticket, i) => (
                <div key={ticket.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Billet #{i + 1} — {ticket.ticketTypeName}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">VALIDE</span>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase block">Titulaire</span>
                      <span className="text-slate-900 font-semibold mt-0.5 block">{ticket.buyerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Code Billet</span>
                      <span className="text-violet-700 font-mono font-bold mt-0.5 block tracking-wider">{ticket.code}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Evenement</span>
                      <span className="text-slate-900 font-medium mt-0.5 block line-clamp-1">{ticket.eventTitle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Prix Paye</span>
                      <span className="text-slate-900 font-heading font-black mt-0.5 block">{money(ticket.price)}</span>
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <button onClick={() => sendWhatsApp(ticket)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100">
                      <Share2 className="w-3.5 h-3.5" /> Envoyer sur WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleReset}
              className="w-full py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
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
