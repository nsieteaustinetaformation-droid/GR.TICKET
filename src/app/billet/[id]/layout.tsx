import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireServerAuth } from "@/lib/auth/server";
import { getTicketPreview } from "@/lib/server/share-data";

/** Les métadonnées lisent les paramètres et l'état serveur : rendu bloquant autorisé. */
export const instant = false;

type Props = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const preview = getTicketPreview(id);
  const title = preview
    ? `Billet ${preview.eventTitle} | GR Ticket`
    : "Billet | GR Ticket";
  const description = preview
    ? `Billet GR Ticket de ${preview.holderName} — ${preview.eventTitle} (${preview.priceLabel}). QR dynamique et garantie inclus.`
    : "Consultez votre billet et son QR dynamique sur GR Ticket.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "GR Ticket" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TicketLayout({ children, params }: Props) {
  const { id } = await params;
  await requireServerAuth(`/billet/${id}`);
  return children;
}
