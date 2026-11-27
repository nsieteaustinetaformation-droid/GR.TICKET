import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--grtk-border)] bg-[var(--grtk-surface)] px-4 py-8 text-[var(--grtk-text-3)] sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading font-black uppercase tracking-tight text-[var(--grtk-text)]">GR Ticket</p>
          <p className="mt-1">par Goldman Record Company</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/comment-ca-marche" className="link-underline hover:text-violet-700">Comment ça marche</Link>
          <Link href="/garantie" className="link-underline hover:text-violet-700">Garantie</Link>
          <Link href="/connexion" className="link-underline hover:text-violet-700">Connexion</Link>
        </nav>
      </div>
    </footer>
  );
}
