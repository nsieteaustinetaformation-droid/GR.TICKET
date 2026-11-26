import Link from "next/link";
import { ShowcaseTicket3D } from "@/components/grtk/ShowcaseTicket3D";

export default function Maquette3DPage() {
  return (
    <main className="min-h-screen bg-[#F0F5F9] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/design-system" className="text-xs font-bold uppercase tracking-widest text-violet-600 hover:text-violet-800">
            ← Design system
          </Link>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700">
            GRTK · 3D réaliste
          </span>
        </div>

        <header className="mx-auto mt-14 max-w-3xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-violet-500">Billetterie</p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-5xl">
            Vos billets prennent vie en 3D
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500">
            Carton épais, reflets holographiques, ombre portée et talon perforé : la même expérience
            sur le billet réservé et sur l&apos;aperçu de votre événement.
          </p>
        </header>

        <section className="mt-16 grid items-center gap-16 md:grid-cols-3">
          <ShowcaseTicket3D
            title="Festival International"
            category="VIP"
            holder="Alice Martin"
            date="15 juil. 2027 · 20:00"
            venue="Paris, France"
            price="120,00 €"
            number="GR-7K8M-9P2T"
            color="#7C3AED"
            angle="left"
          />
          <ShowcaseTicket3D
            title="Concert Live GRTK"
            category="Standard"
            holder="Bob Martin"
            date="22 août 2027 · 19:30"
            venue="Bruxelles, Belgique"
            price="65,00 €"
            number="GR-4K9N-7B2Q"
            color="#2563EB"
            angle="flat"
          />
          <ShowcaseTicket3D
            title="Night Passage"
            category="Invitation"
            holder="Charlie Dupont"
            date="10 sept. 2027 · 22:00"
            venue="Londres, Royaume-Uni"
            price="Offert"
            number="GR-3P9L-6V8N"
            color="#DB2777"
            angle="right"
          />
        </section>

        <div className="mt-20 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-violet-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-violet-300 hover:bg-violet-500"
          >
            Créer un événement
          </Link>
          <Link
            href="/design-system"
            className="rounded-full border border-violet-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-violet-700 hover:border-violet-400"
          >
            Voir le design system
          </Link>
        </div>
      </div>
    </main>
  );
}
