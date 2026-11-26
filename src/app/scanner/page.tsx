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
import { formatXAF } from "@/lib/utils";
import type { ScanRecord } from "@/lib/types";
import { RequireAuth } from "@/components/system/RequireAuth";

type ScanResult = "idle" | "scanning" | "SUCCESS" | "ALREADY_USED" | "INVALID_CODE" | "WRONG_EVENT";

const RESULT_CONFIG = {
  SUCCESS:      { bg: "bg-emerald-500",  border: "border-emerald-400", text: "VALIDE — ENTREE AUTORISEE",   icon: CheckCircle2,   color: "text-emerald-400" },
  ALREADY_USED: { bg: "bg-amber-500",   border: "border-amber-400",   text: "DEJA UTILISE — REFUS",        icon: AlertTriangle,  color: "text-amber-400"   },
  INVALID_CODE: { bg: "bg-red-500",     border: "border-red-400",     text: "CODE INVALIDE — REFUS",       icon: XCircle,        color: "text-red-400"     },
  WRONG_EVENT:  { bg: "bg-red-500",     border: "border-red-400",     text: "MAUVAIS EVENEMENT — REFUS",   icon: XCircle,        color: "text-red-400"     },
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
    <div className={"min-h-screen text-white transition-colors duration-300 " + (
      scanResult === "SUCCESS" ? "bg-emerald-950" :
      scanResult === "ALREADY_USED" ? "bg-amber-950" :
      (scanResult === "INVALID_CODE" || scanResult === "WRONG_EVENT") ? "bg-red-950" :
      "bg-[#080412]"
    )}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#080412]/90 border-b border-[#251846] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#A59EBF]" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-heading font-black text-base text-white block leading-none">SCANNER BILLET</span>
              <span className="text-[10px] font-mono text-[#A59EBF] uppercase tracking-wider">Controle d Entree PWA</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <List className="w-4 h-4 text-[#A59EBF]" />
          </button>
          <div className={"flex items-center gap-1.5 text-xs font-semibold " + (isOnline ? "text-emerald-400" : "text-amber-400")}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOnline ? "En Ligne" : "Hors Ligne"}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Event Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#A59EBF] uppercase tracking-wider mb-2">Evenement en cours</label>
          <select
            value={selectedEventId} onChange={e => { setSelectedEventId(e.target.value); handleReset(); }}
            className="w-full bg-[#120B24] border border-[#251846] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
            {getEventsByCategory("Tous").filter(e => e.status === "published").map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title} — {ev.date}</option>
            ))}
          </select>
        </div>

        {/* Entry Counter */}
        {selectedEvent && (
          <div className="bg-[#120B24] border border-[#251846] rounded-2xl p-5 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="font-heading font-black text-2xl text-emerald-400">{eventScans.length}</span>
              <span className="block text-[10px] text-[#A59EBF] uppercase mt-0.5">Entrees</span>
            </div>
            <div>
              <span className="font-heading font-black text-2xl text-white">{totalCapacity}</span>
              <span className="block text-[10px] text-[#A59EBF] uppercase mt-0.5">Capacite</span>
            </div>
            <div>
              <span className={"font-heading font-black text-2xl " + (enterPct > 90 ? "text-red-400" : "text-purple-400")}>{enterPct}%</span>
              <span className="block text-[10px] text-[#A59EBF] uppercase mt-0.5">Remplissage</span>
            </div>
          </div>
        )}

        {/* Scan Area */}
        {scanResult === "idle" ? (
          <div className="bg-[#120B24] border-2 border-dashed border-[#251846] rounded-3xl p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-2xl border-2 border-purple-500/40 bg-purple-500/10 flex items-center justify-center mx-auto">
              <Camera className="w-9 h-9 text-purple-400" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl text-white">Pret pour le scan</h2>
              <p className="text-xs text-[#A59EBF] mt-1">Saisissez le code manuellement ou connectez un lecteur QR USB.</p>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text" placeholder="GR-XXXXX-XXXXX"
                value={manualCode} onChange={e => setManualCode(e.target.value.toUpperCase())}
                className="flex-1 bg-[#0D0820] border border-[#251846] rounded-xl px-4 py-3 text-sm text-white placeholder-[#6E6589] focus:outline-none focus:border-purple-500 font-mono tracking-widest uppercase transition-colors"
                autoFocus autoComplete="off" spellCheck={false}
              />
              <button type="submit" className="btn-neon-purple px-5 py-3 text-xs font-black">
                <Zap className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : cfg && lastScan ? (
          <div className={"rounded-3xl border-2 p-8 text-center space-y-5 transition-all " + cfg.border + " bg-[#120B24]"}>
            <div className={"w-20 h-20 rounded-full flex items-center justify-center mx-auto " + cfg.bg + "/20 border-2 " + cfg.border}>
              <cfg.icon className={"w-10 h-10 " + cfg.color} />
            </div>
            <div>
              <h2 className={"font-heading font-black text-xl " + cfg.color}>{cfg.text}</h2>
              <p className="text-xs text-[#A59EBF] mt-2 font-mono">{lastScan.ticketCode}</p>
            </div>
            {scanResult === "SUCCESS" && (
              <div className="bg-[#0D0820] border border-emerald-500/30 rounded-2xl p-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6E6589]">Titulaire</span>
                  <span className="text-white font-semibold">{lastScan.buyerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6E6589]">Type</span>
                  <span className="text-white">{lastScan.ticketTypeName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6E6589]">Evenement</span>
                  <span className="text-white truncate max-w-[60%] text-right">{lastScan.eventTitle}</span>
                </div>
              </div>
            )}
            <button onClick={handleReset}
              className="w-full py-3 rounded-xl border border-white/15 text-[#A59EBF] hover:text-white hover:bg-white/5 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Scanner Suivant
            </button>
          </div>
        ) : null}

        {/* History Panel */}
        {showHistory && (
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wide">Historique des Scans Recents</h3>
            {recentScans.length === 0 ? (
              <p className="text-xs text-[#6E6589] text-center py-6">Aucun scan pour le moment</p>
            ) : (
              <div className="space-y-2">
                {recentScans.map(s => {
                  const c = s.result === "SUCCESS" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : s.result === "ALREADY_USED" ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20";
                  return (
                    <div key={s.id} className={"rounded-xl border p-3 flex items-center justify-between " + c}>
                      <div>
                        <span className="font-mono text-xs font-bold">{s.ticketCode}</span>
                        <span className="text-[10px] block opacity-70">{s.buyerName} — {new Date(s.timestamp).toLocaleTimeString("fr-CG")}</span>
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
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400">Mode Hors-Ligne actif</p>
              <p className="text-xs text-[#A59EBF] mt-0.5">Les scans sont enregistres localement et synchronises des que la connexion est retablie.</p>
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
