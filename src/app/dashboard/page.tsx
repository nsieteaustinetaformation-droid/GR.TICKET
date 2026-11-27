"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, BarChart3, Calendar, CheckCircle2, DollarSign,
  Eye, LogOut, Plus, RefreshCw, Save, Ticket as TicketIcon, TrendingUp, UserRound,
} from "lucide-react";
import { RequireAuth } from "@/components/system/RequireAuth";
import { FieldError } from "@/components/system/FieldError";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RealisticTicket3D } from "@/components/grtk/RealisticTicket3D";
import { HeroTicket } from "@/components/grtk/HeroTicket";
import { CountUp } from "@/components/motion/CountUp";
import { CursorHalo } from "@/components/motion/CursorHalo";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { Skeleton } from "@/components/motion/Skeleton";
import { StatusFlash } from "@/components/motion/StatusFlash";
import { useAuth } from "@/lib/auth";
import { validateProfile } from "@/lib/validation/auth";
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
  const { user, signOut, updateProfile, isDemo } = useAuth();
  const version = useStoreVersion();
  const [orders, setOrders] = useState<Order[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [profileName, setProfileName] = useState(user?.fullName ?? "");
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? "");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(user?.avatarUrl || null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileFlash, setProfileFlash] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);

  function refresh() {
    setOrders(getAllOrders());
    setScans(getAllScans());
    setLastRefresh(new Date());
  }

  useEffect(() => { refresh(); }, [version, user?.id]);

  useEffect(() => {
    if (!user) return;
    setProfileName(user.fullName);
    setProfilePhone(user.phone);
    setProfileAvatar(user.avatarUrl || null);
  }, [user?.id, user?.fullName, user?.phone, user?.avatarUrl]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateProfile({ fullName: profileName, phone: profilePhone });
    setProfileErrors(validation.errors);
    if (!validation.valid) {
      const node = document.getElementById(`field-${validation.firstField ?? "fullName"}`);
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      node?.focus?.({ preventScroll: true });
      return;
    }
    setProfileBusy(true);
    setProfileFlash(null);
    try {
      await updateProfile({ fullName: profileName, phone: profilePhone, avatarUrl: profileAvatar ?? "" });
      setProfileFlash({ kind: "success", message: "Profil enregistré." });
    } catch (err) {
      setProfileFlash({ kind: "error", message: err instanceof Error ? err.message : "Enregistrement impossible. Réessayez." });
    } finally {
      setProfileBusy(false);
    }
  }

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

  const loading = lastRefresh === null;

  return (
    <div className="min-h-screen bg-[var(--grtk-bg)] text-[var(--grtk-text)]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--grtk-border)] bg-[var(--grtk-surface)]/95 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800">
            <BarChart3 className="h-4 w-4 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <span className="block truncate font-heading text-base font-black leading-none">TABLEAU DE BORD</span>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[var(--grtk-text-3)]">
              {isDemo ? "Mode démo" : user?.email || "Organisateur"}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden font-mono text-[10px] text-[var(--grtk-text-3)] sm:block">
            {lastRefresh ? lastRefresh.toLocaleTimeString(mainConfig.locale === "fr" ? "fr-FR" : "en-US") : "--:--"}
          </span>
          <button onClick={refresh} className="magnetic-btn rounded-lg p-2 hover:bg-[var(--grtk-surface-2)]" title="Actualiser" aria-label="Actualiser">
            <RefreshCw className="h-4 w-4 text-[var(--grtk-text-2)]" aria-hidden />
          </button>
          <ThemeToggle compact />
          <button onClick={() => void handleSignOut()} className="magnetic-btn rounded-lg p-2 hover:bg-[var(--grtk-surface-2)]" title="Se déconnecter" aria-label="Se déconnecter">
            <LogOut className="h-4 w-4 text-[var(--grtk-text-2)]" aria-hidden />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Accueil 3D réactif */}
        <section className="relative isolate overflow-hidden rounded-3xl border border-[var(--grtk-border)] bg-[var(--grtk-surface-2)] px-6 py-10 sm:px-10 sm:py-14">
          <CursorHalo />
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-700">Espace organisateur</p>
              <h1 className="font-heading text-3xl font-black uppercase leading-tight sm:text-5xl">
                {publishedEvents.length === 0 ? "Créez votre premier événement" : "Gérez vos événements et vos ventes"}
              </h1>
              <p className="max-w-xl text-sm text-[var(--grtk-text-2)]">
                Vous créez vos événements, vous vendez vos billets. La plateforme prélève {DEFAULT_COMMISSION_PERCENT} % sur chaque vente et vous reverse {100 - DEFAULT_COMMISSION_PERCENT} %.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <MagneticButton
                  onClick={() => router.push("/evenements/nouveau/infos")}
                  className="btn-neon-purple inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider"
                >
                  <Plus className="h-4 w-4" aria-hidden /> Créer un événement <ArrowRight className="h-4 w-4" aria-hidden />
                </MagneticButton>
                <Link href="/comment-ca-marche" className="link-underline text-xs font-bold uppercase tracking-wider text-violet-700">
                  Comment ça marche
                </Link>
              </div>
            </div>
            <div className="animate-float">
              <RealisticTicket3D className="mx-auto max-w-md">
                <HeroTicket />
              </RealisticTicket3D>
            </div>
          </div>
        </section>

        {/* Chiffres clés — uniquement des données réelles */}
        <Reveal>
          <section aria-label="Chiffres clés" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Chiffre d'affaires",
                node: <CountUp value={totalRevenue} formatter={(v) => moneyFor(Math.round(v))} />,
                icon: DollarSign,
              },
              { label: "Billets vendus", node: <CountUp value={totalTickets} />, icon: TicketIcon },
              { label: "Entrées validées", node: <CountUp value={totalEntries} />, icon: CheckCircle2 },
              { label: "Mes événements", node: <CountUp value={publishedEvents.length} />, icon: Calendar },
            ].map((s) => (
              <div key={s.label} className="neon-card p-5">
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-xs text-[var(--grtk-text-3)]">{s.label}</span>
                  <s.icon className="h-4 w-4 text-violet-600" aria-hidden />
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="font-heading text-2xl font-black tracking-tight text-violet-700">{s.node}</p>
                )}
              </div>
            ))}
          </section>
        </Reveal>

        <Reveal delay={80}>
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
              <TrendingUp className="h-4 w-4 text-emerald-700" aria-hidden /> Votre reversement
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase text-[var(--grtk-text-3)]">Total des ventes</p>
                <p className="mt-1 text-lg font-black">{moneyFor(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-[var(--grtk-text-3)]">Commission GR Ticket ({DEFAULT_COMMISSION_PERCENT} %)</p>
                <p className="mt-1 text-lg font-black text-rose-700">− {moneyFor(commission)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-[var(--grtk-text-3)]">Vous recevez ({100 - DEFAULT_COMMISSION_PERCENT} %)</p>
                <p className="mt-1 text-lg font-black text-emerald-700">{moneyFor(netRevenue)}</p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={100}>
          <section className="rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wide">
                <UserRound className="h-4 w-4 text-violet-600" aria-hidden /> Mon profil
              </h2>
              <span className="font-mono text-[10px] text-[var(--grtk-text-3)]">{user?.email}</span>
            </div>
            <form onSubmit={(e) => void saveProfile(e)} noValidate className="mt-5 grid gap-5 sm:grid-cols-[150px_1fr]">
              <div id="field-avatarUrl">
                <ImageUploader
                  value={profileAvatar}
                  onChange={(url) => { setProfileAvatar(url); setProfileErrors((current) => ({ ...current, avatarUrl: "" })); }}
                  shape="avatar"
                  label="Photo de profil"
                  hint="Carré · JPG, PNG, WebP, HEIC · 5 Mo max"
                  compact
                />
              </div>
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Nom complet *</span>
                  <input
                    id="field-fullName"
                    className="field"
                    value={profileName}
                    onChange={(e) => { setProfileName(e.target.value); setProfileErrors((current) => ({ ...current, fullName: "" })); }}
                  />
                  <FieldError message={profileErrors.fullName} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--grtk-text-3)]">Téléphone WhatsApp (format international)</span>
                  <input
                    id="field-phone"
                    className="field"
                    value={profilePhone}
                    onChange={(e) => { setProfilePhone(e.target.value); setProfileErrors((current) => ({ ...current, phone: "" })); }}
                    placeholder="+33612345678"
                  />
                  <FieldError message={profileErrors.phone} />
                </label>
                {profileFlash && <StatusFlash kind={profileFlash.kind} message={profileFlash.message} onDone={() => setProfileFlash(null)} />}
                <MagneticButton
                  type="submit"
                  disabled={profileBusy}
                  className="btn-neon-purple inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  <Save className="h-4 w-4" aria-hidden /> {profileBusy ? "Enregistrement…" : "Enregistrer mon profil"}
                </MagneticButton>
              </div>
            </form>
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="overflow-hidden rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--grtk-border)] px-6 py-4">
              <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide">
                <Calendar className="h-4 w-4 text-violet-600" aria-hidden /> Mes événements
              </h2>
              <Link href="/evenements/nouveau/infos" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-violet-700 hover:underline">
                <Plus className="h-3 w-3" aria-hidden /> Nouveau
              </Link>
            </div>
            {eventStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--grtk-border)] text-[var(--grtk-text-3)] uppercase tracking-wider font-semibold">
                      <th className="px-6 py-3 text-left">Evenement</th>
                      <th className="px-4 py-3 text-right">Billets</th>
                      <th className="px-4 py-3 text-right">Entrees</th>
                      <th className="px-4 py-3 text-right">Revenus</th>
                      <th className="px-6 py-3 text-left">Remplissage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--grtk-border)]">
                    {eventStats.map(({ ev, evRevenue, evTickets, evEntries, pct }) => (
                      <tr key={ev.id} className="hover:bg-[var(--grtk-surface-2)]">
                        <td className="px-6 py-4">
                          <p className="line-clamp-1 font-semibold">{ev.title}</p>
                          <p className="mt-0.5 text-[var(--grtk-text-3)]">{ev.date} — {ev.city}</p>
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-violet-700">{evTickets}</td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-emerald-700">{evEntries}</td>
                        <td className="px-4 py-4 text-right font-heading font-black">{moneyFor(evRevenue, ev.id)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 min-w-[60px] flex-1 overflow-hidden rounded-full bg-[var(--grtk-surface-2)]">
                              <div
                                className={"h-full rounded-full transition-[width] duration-300 " + (pct > 80 ? "bg-rose-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500")}
                                style={{ width: pct + "%" }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-[var(--grtk-text-3)]">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <Calendar className="mx-auto mb-3 h-9 w-9 text-[var(--grtk-text-3)]" aria-hidden />
                <p className="font-bold">Aucun événement pour le moment</p>
                <p className="mt-1 text-xs text-[var(--grtk-text-3)]">Créez-en un en 4 étapes, puis vendez vos billets.</p>
                <Link href="/evenements/nouveau/infos" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold uppercase text-white hover:bg-violet-700">
                  Commencer <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            )}
          </section>
        </Reveal>

        {paidOrders.length > 0 && (
          <Reveal delay={160}>
            <section className="overflow-hidden rounded-2xl border border-[var(--grtk-border)] bg-[var(--grtk-surface)] shadow-sm">
              <div className="border-b border-[var(--grtk-border)] px-6 py-4">
                <h2 className="font-heading text-base font-bold uppercase tracking-wide">Ventes récentes</h2>
              </div>
              <div className="divide-y divide-[var(--grtk-border)]">
                {paidOrders.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{order.buyerName}</p>
                      <p className="truncate text-xs text-[var(--grtk-text-3)]">{order.eventTitle}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-heading text-sm font-black">{moneyFor(order.totalAmount, order.eventId)}</p>
                      <p className="text-[10px] font-bold uppercase text-[var(--grtk-text-3)]">{order.paymentMethod} · {order.ticketCount} billet(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        <Reveal delay={200}>
          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/evenements/nouveau/infos", icon: Plus, box: "bg-violet-50", ink: "text-violet-700", title: "Créer un événement", sub: "4 étapes guidées" },
              { href: "/guichet", icon: TicketIcon, box: "bg-amber-50", ink: "text-amber-700", title: "Guichet Express", sub: "Vente rapide tactile" },
              { href: "/scanner", icon: Eye, box: "bg-cyan-50", ink: "text-cyan-700", title: "Scanner Billet", sub: "Contrôle d'entrée PWA" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="neon-card flex items-center gap-3 p-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.box}`}>
                  <item.icon className={`h-5 w-5 ${item.ink}`} aria-hidden />
                </div>
                <div>
                  <span className="block font-heading text-sm font-bold">{item.title}</span>
                  <span className="text-[10px] text-[var(--grtk-text-3)]">{item.sub}</span>
                </div>
              </Link>
            ))}
          </section>
        </Reveal>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <RequireAuth><DashboardInner /></RequireAuth>;
}
