import Link from "next/link";

// La redirection vers le tableau de bord est appliquée dans next.config.ts
// avant même le rendu de la page. Ce contenu sert uniquement de secours.
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#080412] px-4 text-center text-white">
      <h1 className="text-2xl font-black uppercase tracking-tight">Godman Tikets</h1>
      <p className="mt-2 text-sm text-white/60">Votre espace organisateur vous attend.</p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-purple-600 px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-purple-500"
      >
        Aller au tableau de bord
      </Link>
    </main>
  );
}
