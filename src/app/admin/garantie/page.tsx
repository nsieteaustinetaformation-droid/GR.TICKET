"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/motion/Skeleton";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
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
  const [flash, setFlash] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/guarantee/stats");
      if (!res.ok) throw new Error("Indisponible");
      const data = (await res.json()) as { ok: boolean; stats: Stats; audit: AuditEntry[] };
      setStats(data.stats);
      setAudit(data.audit);
    } catch {
      setFlash({ kind: "error", message: "Statistiques indisponibles pour le moment. Réessayez." });
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <main className="min-h-screen bg-[var(--grtk-bg)] px-4 py-10 text-[var(--grtk-text)]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="link-underline text-xs text-[var(--grtk-text-3)] hover:text-violet-700">← Tableau de bord</Link>
          <ThemeToggle compact />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white"><ShieldCheck className="h-5 w-5" aria-hidden /></span>
          <div>
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight">Tableau de bord Garantie</h1>
            <p className="text-xs text-[var(--grtk-text-3)]">Chiffres réels et journal d&apos;audit — aucune donnée de démonstration.</p>
          </div>
        </div>

        {flash && <StatusFlash kind={flash.kind} message={flash.message} onDone={() => setFlash(null)} />}

        <Reveal>
          <section aria-label="Statistiques de la garantie" className="grid gap-3 sm:grid-cols-4">
            {stats ? [
              { label: "Réclamations", node: <CountUp value={stats.claims} />, icon: Activity },
              { label: "Remboursées", node: <CountUp value={stats.paidClaims} />, icon: ShieldCheck },
              { label: "Fraude détectée", node: <CountUp value={stats.fraudDetected} />, icon: ShieldAlert },
              { label: "Taux de fraude", node: `${(stats.fraudRate * 100).toFixed(0)} %`, icon: ShieldAlert },
            ].map((item) => (
              <div key={item.label} className="neon-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] uppercase text-[var(--grtk-text-3)]">{item.label}</p>
                  <item.icon className="h-4 w-4 text-violet-600" aria-hidden />
                </div>
                <p className="font-heading text-2xl font-black text-violet-700">{item.node}</p>
              </div>
            )) : Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 w-full" />)}
          </section>
        </Reveal>

        <Reveal delay={60}>
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-[11px] uppercase tracking-wider text-emerald-700">Coût total de la garantie</p>
            <p className="mt-1 font-heading text-3xl font-black text-emerald-700">
              {stats ? formatMoney(stats.totalCostMinor, stats.currency, "fr-FR") : <Skeleton className="h-9 w-40" />}
            </p>
            <p className="mt-2 text-xs text-emerald-800">Montant réellement remboursé, calculé sur les réclamations traitées.</p>
          </section>
        </Reveal>

        <Reveal delay={100}>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider">
                <Activity className="h-4 w-4 text-violet-600" aria-hidden /> Journaux d&apos;audit
              </h2>
              <button onClick={() => void load()} className="magnetic-btn inline-flex items-center gap-2 rounded-lg border border-[var(--grtk-border)] px-3 py-2 text-[10px] font-bold uppercase hover:border-violet-600">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Actualiser
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {!stats && <Skeleton lines={4} />}
              {stats && audit.length === 0 && <p className="text-xs text-[var(--grtk-text-3)]">Aucune activité pour le moment.</p>}
              {audit.map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-[var(--grtk-border)] pb-2 text-xs last:border-0">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-violet-700">{entry.action}</p>
                    <p className="truncate text-[var(--grtk-text-3)]">{entry.actor} · {entry.entityId}</p>
                  </div>
                  <time className="shrink-0 text-[var(--grtk-text-3)]">{new Date(entry.createdAt).toLocaleString()}</time>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
