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
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="block truncate font-heading text-base font-black leading-none">TABLEAU DE BORD</span>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">
              {isDemo ? "Mode démo" : user?.email || "Organisateur"}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden font-mono text-[10px] text-slate-400 sm:block">
            {lastRefresh ? lastRefresh.toLocaleTimeString(mainConfig.locale === "fr" ? "fr-FR" : "en-US") : "--:--"}
          </span>
          <button onClick={refresh} className="rounded-lg p-2 hover:bg-slate-100" title="Actualiser">
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </button>
          <button onClick={handleSignOut} className="rounded-lg p-2 hover:bg-slate-100" title="Se déconnecter">
            <LogOut className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Bandeau d'accueil */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm sm:p-8">
          <div className="relative z-10 max-w-2xl space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700">Espace organisateur</p>
            <h1 className="text-3xl font-black uppercase leading-tight sm:text-4xl">
              {publishedEvents.length === 0 ? "Créez votre premier événement" : "Gérez vos événements et vos ventes"}
            </h1>
            <p className="text-sm text-slate-600">
              Vous créez vos événements, vous vendez vos billets. La plateforme prélève {DEFAULT_COMMISSION_PERCENT} % sur chaque vente et vous reverse {100 - DEFAULT_COMMISSION_PERCENT} %.
            </p>
            <Link
              href="/evenements/nouveau/infos"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" /> Créer un événement <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-violet-200/60 blur-3xl" />
        </div>

        {/* Chiffres clés */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Chiffre d'affaires", value: moneyFor(totalRevenue), icon: DollarSign, color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
            { label: "Billets vendus", value: String(totalTickets), icon: TicketIcon, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
            { label: "Entrées validées", value: String(totalEntries), icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "Mes événements", value: String(publishedEvents.length), icon: Calendar, color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200" },
          ].map((s) => (
            <div key={s.label} className={"rounded-2xl border p-5 shadow-sm " + s.bg}>
              <div className="mb-3 flex items-start justify-between">
                <span className="text-xs text-slate-500">{s.label}</span>
                <s.icon className={"h-4 w-4 " + s.color} />
              </div>
              <p className={"font-heading font-black text-2xl tracking-tight " + s.color}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Commission */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
            <TrendingUp className="h-4 w-4 text-emerald-700" /> Votre reversement
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase text-slate-500">Total des ventes</p>
              <p className="mt-1 text-lg font-black">{moneyFor(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-slate-500">Commission GRTK ({DEFAULT_COMMISSION_PERCENT} %)</p>
              <p className="mt-1 text-lg font-black text-red-700">− {moneyFor(commission)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-slate-500">Vous recevez ({100 - DEFAULT_COMMISSION_PERCENT} %)</p>
              <p className="mt-1 text-lg font-black text-emerald-700">{moneyFor(netRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Mes événements */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
              <Calendar className="h-4 w-4 text-violet-600" /> Mes événements
            </h2>
            <Link href="/evenements/nouveau/infos" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-violet-700 hover:underline">
              <Plus className="h-3 w-3" /> Nouveau
            </Link>
          </div>
          {eventStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-3 text-left">Evenement</th>
                    <th className="px-4 py-3 text-right">Billets</th>
                    <th className="px-4 py-3 text-right">Entrees</th>
                    <th className="px-4 py-3 text-right">Revenus</th>
                    <th className="px-6 py-3 text-left">Remplissage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {eventStats.map(({ ev, evRevenue, evTickets, evEntries, pct }) => (
                    <tr key={ev.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="line-clamp-1 font-semibold text-slate-900">{ev.title}</p>
                        <p className="mt-0.5 text-slate-500">{ev.date} — {ev.city}</p>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-violet-700">{evTickets}</td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-emerald-700">{evEntries}</td>
                      <td className="px-4 py-4 text-right font-heading font-black text-slate-900">{moneyFor(evRevenue, ev.id)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 min-w-[60px] flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={"h-full rounded-full " + (pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500")}
                              style={{ width: pct + "%" }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <Calendar className="mx-auto mb-3 h-9 w-9 text-slate-400" />
              <p className="font-bold">Aucun événement pour le moment</p>
              <p className="mt-1 text-xs text-slate-500">Créez-en un en 4 étapes, puis vendez vos billets.</p>
              <Link href="/evenements/nouveau/infos" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold uppercase text-white hover:bg-violet-700">
                Commencer <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Ventes récentes */}
        {paidOrders.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-heading text-base font-bold uppercase tracking-wide">Ventes récentes</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {paidOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{order.buyerName}</p>
                    <p className="truncate text-xs text-slate-500">{order.eventTitle}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-heading text-sm font-black">{moneyFor(order.totalAmount, order.eventId)}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-500">{order.paymentMethod} · {order.ticketCount} billet(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accès rapides */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/evenements/nouveau/infos" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-violet-300">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50"><Plus className="h-5 w-5 text-violet-700" /></div>
            <div>
              <span className="block font-heading text-sm font-bold">Créer un événement</span>
              <span className="text-[10px] text-slate-500">4 étapes simples</span>
            </div>
          </Link>
          <Link href="/guichet" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-300">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50"><TicketIcon className="h-5 w-5 text-amber-700" /></div>
            <div>
              <span className="block font-heading text-sm font-bold">Guichet Express</span>
              <span className="text-[10px] text-slate-500">Vente rapide tactile</span>
            </div>
          </Link>
          <Link href="/scanner" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-300">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50"><Eye className="h-5 w-5 text-cyan-700" /></div>
            <div>
              <span className="block font-heading text-sm font-bold">Scanner Billet</span>
              <span className="text-[10px] text-slate-500">Contrôle d'entrée PWA</span>
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
