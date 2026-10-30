"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, Ticket as TicketIcon, Calendar,
  DollarSign, BarChart3, Users, CheckCircle2, Zap, Eye,
  RefreshCw, Download
} from "lucide-react";
import { getAllOrders, getTotalRevenue, getTotalTicketsSold, getRevenueByPaymentMethod } from "@/lib/store/orders";
import { getAllScans, getSuccessfulScans } from "@/lib/store/scans";
import { MOCK_EVENTS } from "@/lib/store/events";
import { formatXAF } from "@/lib/utils";
import type { Order, ScanRecord } from "@/lib/types";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  function refresh() {
    setOrders(getAllOrders());
    setScans(getAllScans());
    setLastRefresh(new Date());
  }

  useEffect(() => { refresh(); }, []);

  const totalRevenue = orders.filter(o => o.paymentStatus === "completed").reduce((s, o) => s + o.totalAmount, 0);
  const totalTickets = orders.filter(o => o.paymentStatus === "completed").reduce((s, o) => s + o.ticketCount, 0);
  const revenueByMethod = orders.filter(o => o.paymentStatus === "completed").reduce(
    (acc, o) => { acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.totalAmount; return acc; },
    { mtn: 0, airtel: 0, cash: 0 } as Record<string, number>
  );
  const totalScans = scans.filter(s => s.result === "SUCCESS").length;
  const totalEvents = MOCK_EVENTS.filter(e => e.status === "published").length;

  const statCards = [
    { label: "Chiffre d Affaires", value: formatXAF(totalRevenue), icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Billets Vendus", value: totalRevenue > 0 ? totalTickets.toString() : "0", icon: TicketIcon, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Entrees Validees", value: totalScans.toString(), icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Evenements Actifs", value: totalEvents.toString(), icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  ];

  const eventStats = MOCK_EVENTS.filter(e => e.status === "published").map(ev => {
    const evOrders = orders.filter(o => o.eventId === ev.id && o.paymentStatus === "completed");
    const evRevenue = evOrders.reduce((s, o) => s + o.totalAmount, 0);
    const evTickets = evOrders.reduce((s, o) => s + o.ticketCount, 0);
    const evEntries = scans.filter(s => s.eventId === ev.id && s.result === "SUCCESS").length;
    const totalCap = ev.ticketTypes.reduce((s, t) => s + t.totalQuantity, 0);
    const soldInStore = ev.ticketTypes.reduce((s, t) => s + t.soldQuantity, 0);
    const totalSold = soldInStore + evTickets;
    const pct = totalCap > 0 ? Math.min(100, Math.round((totalSold / totalCap) * 100)) : 0;
    return { ev, evRevenue, evTickets, evEntries, pct, totalSold, totalCap };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="min-h-screen bg-[#080412] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#080412]/90 border-b border-[#251846] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#A59EBF]" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-heading font-black text-base text-white block leading-none">TABLEAU DE BORD</span>
              <span className="text-[10px] font-mono text-[#A59EBF] uppercase tracking-wider">Analytique & Rapport</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6E6589] font-mono hidden sm:block">
            {lastRefresh ? lastRefresh.toLocaleTimeString("fr-CG") : "--:--"}
          </span>
          <button onClick={refresh} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title="Actualiser">
            <RefreshCw className="w-4 h-4 text-[#A59EBF]" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className={"rounded-2xl border p-5 " + s.bg}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-[#A59EBF] font-medium">{s.label}</span>
                <s.icon className={"w-4 h-4 " + s.color} />
              </div>
              <p className={"font-heading font-black text-2xl tracking-tight " + s.color}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-[#120B24] border border-[#251846] rounded-2xl p-6">
          <h2 className="font-heading font-bold text-base text-white uppercase tracking-wide mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Ventilation des Paiements
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {([
              { key: "mtn", label: "MTN Mobile Money", color: "bg-amber-400", textColor: "text-amber-400" },
              { key: "airtel", label: "Airtel Money", color: "bg-red-500", textColor: "text-red-400" },
              { key: "cash", label: "Especes Guichet", color: "bg-emerald-500", textColor: "text-emerald-400" },
            ] as const).map(opt => {
              const amount = revenueByMethod[opt.key] || 0;
              const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
              return (
                <div key={opt.key} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#251846" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none"
                        stroke={opt.key === "mtn" ? "#FBBF24" : opt.key === "airtel" ? "#EF4444" : "#10B981"}
                        strokeWidth="3" strokeDasharray={pct * 0.879 + " 87.9"}
                        strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }} />
                    </svg>
                    <span className={"absolute inset-0 flex items-center justify-center font-heading font-black text-sm " + opt.textColor}>{pct}%</span>
                  </div>
                  <p className="font-heading font-black text-base text-white">{formatXAF(amount)}</p>
                  <p className="text-[10px] text-[#A59EBF] mt-0.5">{opt.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-[#120B24] border border-[#251846] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#251846] flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-white uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" /> Performances par Evenement
            </h2>
          </div>
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
                {eventStats.map(({ ev, evRevenue, evTickets, evEntries, pct, totalSold, totalCap }) => (
                  <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white line-clamp-1">{ev.title}</p>
                        <p className="text-[#6E6589] mt-0.5">{ev.date} — {ev.city}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-purple-300">{totalSold}</td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-400">{evEntries}</td>
                    <td className="px-4 py-4 text-right font-heading font-black text-white">{formatXAF(evRevenue)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#251846] rounded-full overflow-hidden min-w-[60px]">
                          <div className={"h-full rounded-full transition-all " + (pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500")}
                            style={{ width: pct + "%" }} />
                        </div>
                        <span className="font-mono text-[10px] text-[#A59EBF] shrink-0">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {eventStats.length === 0 && (
              <div className="text-center py-12 text-[#6E6589]">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Aucune donnee de vente disponible.</p>
                <p className="text-xs mt-1">Effectuez des ventes depuis le Guichet Express.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="bg-[#120B24] border border-[#251846] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#251846]">
              <h2 className="font-heading font-bold text-base text-white uppercase tracking-wide flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Ventes Recentes
              </h2>
            </div>
            <div className="divide-y divide-[#251846]">
              {orders.slice(0, 10).map(order => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{order.buyerName}</p>
                    <p className="text-xs text-[#A59EBF] mt-0.5 truncate">{order.eventTitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-heading font-black text-sm text-white">{formatXAF(order.totalAmount)}</p>
                    <p className={"text-[10px] font-bold uppercase mt-0.5 " + (order.paymentMethod === "mtn" ? "text-amber-400" : order.paymentMethod === "airtel" ? "text-red-400" : "text-emerald-400")}>
                      {order.paymentMethod.toUpperCase()} · {order.ticketCount} billet(s)
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full font-bold shrink-0">
                    PAYE
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/guichet" className="bg-[#120B24] border border-[#251846] hover:border-amber-500/50 rounded-2xl p-5 flex items-center gap-3 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
              <TicketIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-white block">Guichet Express</span>
              <span className="text-[10px] text-[#A59EBF]">Vente rapide tactile</span>
            </div>
          </Link>
          <Link href="/scanner" className="bg-[#120B24] border border-[#251846] hover:border-cyan-500/50 rounded-2xl p-5 flex items-center gap-3 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
              <Eye className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-white block">Scanner Billet</span>
              <span className="text-[10px] text-[#A59EBF]">Controle d entree PWA</span>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}