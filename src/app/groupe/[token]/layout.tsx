import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getGroupPreview } from "@/lib/server/share-data";

/** Les métadonnées lisent les paramètres et l'état serveur : rendu bloquant autorisé. */
export const instant = false;

type Props = {
  children: ReactNode;
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const preview = getGroupPreview(token);
  const title = preview
    ? `Paiement de groupe — ${preview.eventTitle} | GR Ticket`
    : "Paiement de groupe | GR Ticket";
  const description = preview
    ? `${preview.initiator} invite ${preview.quantity} personnes à payer leur place (${preview.totalLabel}) sur GR Ticket.`
    : "Payez à plusieurs en toute sécurité sur GR Ticket.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "GR Ticket" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function GroupLayout({ children }: Props) {
  return children;
}
