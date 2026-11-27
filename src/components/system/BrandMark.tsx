import Link from "next/link";
import { Ticket as TicketIcon } from "lucide-react";

/** Marque officielle, identique sur l'accueil et la page de connexion. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="GR Ticket — accueil">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-sm">
        <TicketIcon className="h-5 w-5" aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="font-heading text-base font-black uppercase tracking-tight">GR Ticket</span>
        {!compact && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--grtk-text-3)]">
            par Goldman Record Company
          </span>
        )}
      </span>
    </Link>
  );
}
