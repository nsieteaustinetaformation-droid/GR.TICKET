"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Camera, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, Wifi, WifiOff, Shield, Zap, List
} from "lucide-react";
import { isValidTicketCode } from "@/lib/ticket-engine";
import { addScanRecord, getAllScans, getSuccessfulScans } from "@/lib/store/scans";
import { getAllOrders } from "@/lib/store/orders";
import { getEventsByCategory } from "@/lib/store/events";
import { useStoreVersion } from "@/lib/store/subscribe";
import type { ScanRecord } from "@/lib/types";
import { RequireAuth } from "@/components/system/RequireAuth";

type ScanResult = "idle" | "scanning" | "SUCCESS" | "ALREADY_USED" | "INVALID_CODE" | "WRONG_EVENT";

const RESULT_CONFIG = {
  SUCCESS:      { bg: "bg-emerald-600",  border: "border-emerald-300", text: "VALIDE — ENTREE AUTORISEE",   icon: CheckCircle2,   color: "text-emerald-700" },
  ALREADY_USED: { bg: "bg-amber-500",    border: "border-amber-300",   text: "DEJA UTILISE — REFUS",        icon: AlertTriangle,  color: "text-amber-700"   },
  INVALID_CODE: { bg: "bg-rose-600",     border: "border-rose-300",    text: "CODE INVALIDE — REFUS",       icon: XCircle,        color: "text-rose-700"    },
  WRONG_EVENT:  { bg: "bg-rose-600",     border: "border-rose-300",    text: "MAUVAIS EVENEMENT — REFUS",   icon: XCircle,        color: "text-rose-700"    },
};

function ScannerPageInner() {
  useStoreVersion();
  const [selectedEventId, setSelectedEventId] = useState(getEventsByCategory("Tous")[0]?.id ?? "");
  const [scanResult, setScanResult] = useState<ScanResult>("idle");
  const [lastScan, setLastScan] = useState<ScanRecord | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setIsOnline(navigator.onLine);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => { setRecentScans(getAllScans().slice(0, 20)); }, [lastScan]);

  const processCode = useCallback((code: string) => {
    if (!code.trim()) return;
    const normalized = code.trim().toUpperCase();
    const event = getEventsByCategory("Tous").find(e => e.id === selectedEventId);
    if (!event) return;

    const allOrders = getAllOrders();
    const allTickets = allOrders.flatMap(o => o.tickets);
    const scannedIds = new Set(getAllScans().filter(s => s.result === "SUCCESS").map(s => s.ticketId));

    let result: ScanRecord["result"] = "INVALID_CODE";
    let foundTicket = null;

    if (isValidTicketCode(normalized)) {
      foundTicket = allTickets.find(t => t.code === normalized);
      if (!foundTicket) {
        result = "INVALID_CODE";
      } else if (foundTicket.eventId !== selectedEventId) {
        result = "WRONG_EVENT";
      } else if (scannedIds.has(foundTicket.id)) {
        result = "ALREADY_USED";
      } else {
        result = "SUCCESS";
      }
    }

    const record: ScanRecord = {
      id: crypto.randomUUID(),
      ticketId: foundTicket?.id ?? normalized,
      ticketCode: normalized,
      eventId: selectedEventId,
      eventTitle: event.title,
      scannerId: "scanner-guichet-01",
      scannerName: "Controleur Guichet",
      door: "Entree Principale",
      result,
      timestamp: new Date().toISOString(),
      buyerName: foundTicket?.buyerName ?? "—",
      ticketTypeName: foundTicket?.ticketTypeName ?? "—",
      offlineSync: !isOnline,
    };
    addScanRecord(record);
    setLastScan(record);
    setScanResult(result);
    setManualCode("");

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setScanResult("idle"); inputRef.current?.focus(); }, 3500);
  }, [selectedEventId, isOnline]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    processCode(manualCode);
  }

  function handleReset() {
    setScanResult("idle");
    setLastScan(null);
    setManualCode("");
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const selectedEvent = getEventsByCategory("Tous").find(e => e.id === selectedEventId);
  const eventScans = getSuccessfulScans(selectedEventId);
  const totalCapacity = selectedEvent?.ticketTypes.reduce((s, t) => s + t.totalQuantity, 0) ?? 0;
  const enterPct = totalCapacity > 0 ? Math.round((eventScans.length / totalCapacity) * 100) : 0;
  const cfg = scanResult !== "idle" && scanResult !== "scanning" ? RESULT_CONFIG[scanResult] : null;

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-heading font-black text-base text-slate-900 block leading-none">SCANNER BILLET</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Controle d Entree PWA</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <List className="w-4 h-4 text-slate-500" />
          </button>
          <div className={"flex items-center gap-1.5 text-xs font-semibold " + (isOnline ? "text-emerald-600" : "text-amber-600")}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOnline ? "En Ligne" : "Hors Ligne"}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Event Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Evenement en cours</label>
          <select
            value={selectedEventId} onChange={e => { setSelectedEventId(e.target.value); handleReset(); }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors">
            {getEventsByCategory("Tous").filter(e => e.status === "published").map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title} — {ev.date}</option>
            ))}
          </select>
        </div>

        {/* Entry Counter */}
        {selectedEvent && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="font-heading font-black text-2xl text-emerald-600">{eventScans.length}</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-0.5">Entrees</span>
            </div>
            <div>
              <span className="font-heading font-black text-2xl text-slate-900">{totalCapacity}</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-0.5">Capacite</span>
            </div>
            <div>
              <span className={"font-heading font-black text-2xl " + (enterPct > 90 ? "text-rose-600" : "text-violet-600")}>{enterPct}%</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-0.5">Remplissage</span>
            </div>
          </div>
        )}

        {/* Scan Area */}
        {scanResult === "idle" ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-sm p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-2xl border-2 border-violet-100 bg-violet-50 flex items-center justify-center mx-auto">
              <Camera className="w-9 h-9 text-violet-600" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl text-slate-900">Pret pour le scan</h2>
              <p className="text-xs text-slate-500 mt-1">Saisissez le code manuellement ou connectez un lecteur QR USB.</p>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text" placeholder="GR-XXXXX-XXXXX"
                value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())}
                className="flex-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 font-mono tracking-widest uppercase transition-colors"
                autoFocus autoComplete="off" spellCheck={false}
              />
              <button type="submit" className="rounded-xl bg-violet-600 text-white hover:bg-violet-700 px-5 py-3 text-xs font-black shadow-lg shadow-violet-100">
                <Zap className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : cfg && lastScan ? (
          <div className={"rounded-3xl border-2 bg-white p-8 text-center space-y-5 shadow-lg shadow-slate-200/50 transition-all " + cfg.border}>
            <div className={"w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white " + cfg.bg}>
              <cfg.icon className="w-10 h-10" />
            </div>
            <div>
              <h2 className={"font-heading font-black text-xl " + cfg.color}>{cfg.text}</h2>
              <p className="text-xs text-slate-500 mt-2 font-mono">{lastScan.ticketCode}</p>
            </div>
            {scanResult === "SUCCESS" && (
              <div className="rounded-2xl border border-slate-200 bg-[#F6F7FB] p-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Titulaire</span>
                  <span className="text-slate-900 font-semibold">{lastScan.buyerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Type</span>
                  <span className="text-slate-900">{lastScan.ticketTypeName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Evenement</span>
                  <span className="text-slate-900 truncate max-w-[60%] text-right">{lastScan.eventTitle}</span>
                </div>
              </div>
            )}
            <button onClick={handleReset}
              className="w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Scanner Suivant
            </button>
          </div>
        ) : null}

        {/* History Panel */}
        {showHistory && (
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wide">Historique des Scans Recents</h3>
            {recentScans.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Aucun scan pour le moment</p>
            ) : (
              <div className="space-y-2">
                {recentScans.map(s => {
                  const c = s.result === "SUCCESS" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : s.result === "ALREADY_USED" ? "text-amber-700 bg-amber-50 border-amber-200"
                    : "text-rose-700 bg-rose-50 border-rose-200";
                  return (
                    <div key={s.id} className={"rounded-xl border p-3 flex items-center justify-between " + c}>
                      <div>
                        <span className="font-mono text-xs font-bold">{s.ticketCode}</span>
                        <span className="text-[10px] block text-slate-500">{s.buyerName} — {new Date(s.timestamp).toLocaleTimeString("fr-CG")}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase">{s.result.replace("_", " ")}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Offline Notice */}
        {!isOnline && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700">Mode Hors-Ligne actif</p>
              <p className="text-xs text-slate-600 mt-0.5">Les scans sont enregistres localement et synchronises des que la connexion est retablie.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return <RequireAuth><ScannerPageInner /></RequireAuth>;
}
