import Link from "next/link";

// La redirection vers le tableau de bord est appliquée dans next.config.ts
// avant même le rendu de la page. Ce contenu sert uniquement de secours.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center text-slate-900">
      <h1 className="text-2xl font-black uppercase tracking-tight">GRTK</h1>
      <p className="mt-2 text-sm text-slate-500">Votre espace organisateur vous attend.</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-violet-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-violet-700"
      >
        Aller au tableau de bord
      </Link>
    </main>
  );
}
