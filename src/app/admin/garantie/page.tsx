"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/international/money";

interface Stats {
  claims: number;
  paidClaims: number;
  fraudDetected: number;
  fraudRate: number;
  totalCostMinor: number;
  currency: string;
}

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default function AdminGuaranteePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/admin/guarantee/stats");
    if (res.ok) {
      const data = (await res.json()) as { ok: boolean; stats: Stats; audit: AuditEntry[] };
      setStats(data.stats);
      setAudit(data.audit);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <main className="min-h-screen bg-[#080412] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/dashboard" className="text-xs text-white/50 hover:text-white">← Tableau de bord</Link>
        <h1 className="text-3xl font-black uppercase tracking-tight">Tableau de bord Garantie</h1>
        {stats && (
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: "Réclamations", value: stats.claims },
              { label: "Remboursées", value: stats.paidClaims },
              { label: "Fraude détectée", value: stats.fraudDetected },
              { label: "Taux de fraude", value: `${(stats.fraudRate * 100).toFixed(0)} %` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase text-white/40">{item.label}</p>
                <p className="mt-1 text-2xl font-black">{item.value}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 sm:col-span-4">
              <p className="text-[11px] uppercase text-emerald-200/60">Coût total de la garantie</p>
              <p className="mt-1 text-2xl font-black text-emerald-300">{formatMoney(stats.totalCostMinor, stats.currency, "fr-FR")}</p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-[#0E0A1C] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">Journaux d&apos;audit</h2>
            <button onClick={() => void load()} className="rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase">Actualiser</button>
          </div>
          <div className="mt-4 space-y-2">
            {audit.length === 0 && <p className="text-xs text-white/40">Aucune activité pour le moment.</p>}
            {audit.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 border-b border-white/5 pb-2 text-xs last:border-0">
                <span className="font-mono text-purple-300">{entry.action}</span>
                <span className="text-white/40">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
