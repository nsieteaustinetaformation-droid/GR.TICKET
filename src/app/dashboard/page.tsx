"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, BarChart3, Calendar, CheckCircle2, DollarSign,
  Eye, LogOut, Plus, RefreshCw, Ticket as TicketIcon, TrendingUp,
} from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { useAuth } from "@/lib/auth";
import { getEventsByOwner } from "@/lib/store/events";
import { getAllOrders } from "@/lib/store/orders";
import { getAllScans } from "@/lib/store/scans";
import { useStoreVersion } from "@/lib/store/subscribe";
import { DEFAULT_COMMISSION_PERCENT } from "@/lib/domain/constants";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";
import { formatMoney } from "@/lib/international/money";
import type { EventItem, Order, ScanRecord } from "@/lib/types";

function DashboardInner() {
  const router = useRouter();
  const { user, signOut, isDemo } = useAuth();
  const version = useStoreVersion();
  const [orders, setOrders] = useState<Order[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  function refresh() {
    setOrders(getAllOrders());
    setScans(getAllScans());
    setLastRefresh(new Date());
  }

  useEffect(() => { refresh(); }, [version, user?.id]);

  const myEvents: EventItem[] = user ? getEventsByOwner(user.id) : [];
  const myIds = new Set(myEvents.map((e) => e.id));
  const eventsById = new Map(myEvents.map((e) => [e.id, e]));
  const paidOrders = orders.filter((o) => myIds.has(o.eventId) && o.paymentStatus === "completed");
  const totalRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalTickets = paidOrders.reduce((s, o) => s + o.ticketCount, 0);
  const commission = Math.round(totalRevenue * DEFAULT_COMMISSION_PERCENT / 100);
  const netRevenue = totalRevenue - commission;

  const moneyFor = (amount: number, eventId?: string) => {
    const event = eventId ? eventsById.get(eventId) : undefined;
    const config = getCountryConfig(event?.countryCode);
    return formatMoney(amount, event?.currency ?? config.currency, config.locale);
  };
  const mainConfig = getCountryConfig(myEvents[0]?.countryCode);
  const totalEntries = scans.filter((s) => myIds.has(s.eventId) && s.result === "SUCCESS").length;
  const publishedEvents = myEvents.filter((e) => e.status === "published");

  const revenueByMethod = paidOrders.reduce(
    (acc, o) => { acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.totalAmount; return acc; },
    { mtn: 0, airtel: 0, cash: 0 } as Record<string, number>
  );

  const eventStats = publishedEvents.map((ev) => {
    const evOrders = paidOrders.filter((o) => o.eventId === ev.id);
    const evRevenue = evOrders.reduce((s, o) => s + o.totalAmount, 0);
    const evTickets = evOrders.reduce((s, o) => s + o.ticketCount, 0);
    const evEntries = scans.filter((s) => s.eventId === ev.id && s.result === "SUCCESS").length;
    const totalCap = ev.ticketTypes.reduce((s, t) => s + t.totalQuantity, 0);
    const soldInStore = ev.ticketTypes.reduce((s, t) => s + t.soldQuantity, 0);
    const pct = totalCap > 0 ? Math.min(100, Math.round(((soldInStore + evTickets) / totalCap) * 100)) : 0;
    return { ev, evRevenue, evTickets, evEntries, pct };
  }).sort((a, b) => b.evRevenue - a.evRevenue);

  async function handleSignOut() {
    await signOut();
    router.replace("/connexion");
  }

  return (
    <div className="min-h-screen bg-[#080412] text-white">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#080412]/90 border-b border-[#251846] px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-heading font-black text-base block leading-none truncate">TABLEAU DE BORD</span>
            <span className="text-[10px] font-mono text-[#A59EBF] uppercase tracking-wider">
              {isDemo ? "Mode démo" : user?.email || "Organisateur"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-[#6E6589] font-mono hidden sm:block">
            {lastRefresh ? lastRefresh.toLocaleTimeString(mainConfig.locale === "fr" ? "fr-FR" : "en-US") : "--:--"}
          </span>
          <button onClick={refresh} className="p-2 rounded-lg hover:bg-white/5" title="Actualiser">
            <RefreshCw className="w-4 h-4 text-[#A59EBF]" />
          </button>
          <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-white/5" title="Se déconnecter">
            <LogOut className="w-4 h-4 text-[#A59EBF]" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Bandeau d'accueil */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#1B1135] to-[#0E0A1C] p-6 sm:p-8">
          <div className="relative z-10 max-w-2xl space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-purple-300">Espace organisateur</p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase leading-tight">
              {publishedEvents.length === 0 ? "Créez votre premier événement" : "Gérez vos événements et vos ventes"}
            </h1>
            <p className="text-sm text-white/60">
              Vous créez vos événements, vous vendez vos billets. La plateforme prélève {DEFAULT_COMMISSION_PERCENT} % sur chaque vente et vous reverse {100 - DEFAULT_COMMISSION_PERCENT} %.
            </p>
            <Link
              href="/evenements/nouveau/infos"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-purple-500"
            >
              <Plus className="w-4 h-4" /> Créer un événement <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -right-10 -top-16 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        {/* Chiffres clés */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Chiffre d'affaires", value: moneyFor(totalRevenue), icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            { label: "Billets vendus", value: String(totalTickets), icon: TicketIcon, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "Entrées validées", value: String(totalEntries), icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Mes événements", value: String(publishedEvents.length), icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
          ].map((s) => (
            <div key={s.label} className={"rounded-2xl border p-5 " + s.bg}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-[#A59EBF]">{s.label}</span>
                <s.icon className={"w-4 h-4 " + s.color} />
              </div>
              <p className={"font-heading font-black text-2xl tracking-tight " + s.color}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Commission */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <h2 className="flex items-center gap-2 font-heading font-bold text-sm uppercase tracking-wide mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Votre reversement
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] uppercase text-white/40">Total des ventes</p>
              <p className="text-lg font-black mt-1">{moneyFor(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-red-200/60">Commission GRTK ({DEFAULT_COMMISSION_PERCENT} %)</p>
              <p className="text-lg font-black mt-1 text-red-300">− {moneyFor(commission)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-emerald-200/70">Vous recevez ({100 - DEFAULT_COMMISSION_PERCENT} %)</p>
              <p className="text-lg font-black mt-1 text-emerald-300">{moneyFor(netRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Mes événements */}
        <div className="bg-[#120B24] border border-[#251846] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#251846] flex items-center justify-between gap-4">
            <h2 className="font-heading font-bold text-base uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" /> Mes événements
            </h2>
            <Link href="/evenements/nouveau/infos" className="text-[11px] font-bold uppercase tracking-wider text-purple-300 hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Nouveau
            </Link>
          </div>
          {eventStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#251846] text-[#6E6589] uppercase tracking-wider font-semibold">
                    <th className="px-6 py-3 text-left">Evenement</th>
                    <th className="px-4 py-3 text-right">Billets</th>
                    <th className="px-4 py-3 text-right">Entrees</th>
                    <th className="px-4 py-3 text-right">Revenus</th>
                    <th className="px-6 py-3 text-left">Remplissage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#251846]">
                  {eventStats.map(({ ev, evRevenue, evTickets, evEntries, pct }) => (
                    <tr key={ev.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white line-clamp-1">{ev.title}</p>
                        <p className="text-[#6E6589] mt-0.5">{ev.date} — {ev.city}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-purple-300">{evTickets}</td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-emerald-400">{evEntries}</td>
                      <td className="px-4 py-4 text-right font-heading font-black text-white">{moneyFor(evRevenue, ev.id)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#251846] rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className={"h-full rounded-full " + (pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500")}
                              style={{ width: pct + "%" }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-[#A59EBF]">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-14 px-6">
              <Calendar className="w-9 h-9 mx-auto mb-3 text-[#6E6589]" />
              <p className="font-bold">Aucun événement pour le moment</p>
              <p className="text-xs text-[#A59EBF] mt-1">Créez-en un en 4 étapes, puis vendez vos billets.</p>
              <Link href="/evenements/nouveau/infos" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-bold uppercase hover:bg-purple-500">
                Commencer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Ventes récentes */}
        {paidOrders.length > 0 && (
          <div className="bg-[#120B24] border border-[#251846] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#251846]">
              <h2 className="font-heading font-bold text-base uppercase tracking-wide">Ventes récentes</h2>
            </div>
            <div className="divide-y divide-[#251846]">
              {paidOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{order.buyerName}</p>
                    <p className="text-xs text-[#A59EBF] truncate">{order.eventTitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-heading font-black text-sm">{moneyFor(order.totalAmount, order.eventId)}</p>
                    <p className="text-[10px] font-bold uppercase text-[#A59EBF]">{order.paymentMethod} · {order.ticketCount} billet(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accès rapides */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/evenements/nouveau/infos" className="bg-[#120B24] border border-[#251846] hover:border-purple-500/50 rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><Plus className="w-5 h-5 text-purple-300" /></div>
            <div>
              <span className="font-heading font-bold text-sm block">Créer un événement</span>
              <span className="text-[10px] text-[#A59EBF]">4 étapes simples</span>
            </div>
          </Link>
          <Link href="/guichet" className="bg-[#120B24] border border-[#251846] hover:border-amber-500/50 rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><TicketIcon className="w-5 h-5 text-amber-400" /></div>
            <div>
              <span className="font-heading font-bold text-sm block">Guichet Express</span>
              <span className="text-[10px] text-[#A59EBF]">Vente rapide tactile</span>
            </div>
          </Link>
          <Link href="/scanner" className="bg-[#120B24] border border-[#251846] hover:border-cyan-500/50 rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center"><Eye className="w-5 h-5 text-cyan-400" /></div>
            <div>
              <span className="font-heading font-bold text-sm block">Scanner Billet</span>
              <span className="text-[10px] text-[#A59EBF]">Contrôle d'entrée PWA</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <RequireAuth><DashboardInner /></RequireAuth>;
}
