import type { Metadata } from "next";
import { getSharePreview } from "@/lib/server/share-data";
import PayerClient from "./PayerClient";

/** Les métadonnées lisent les paramètres et l'état serveur : rendu bloquant autorisé. */
export const instant = false;

type Props = { params: Promise<{ token: string; shareId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token, shareId } = await params;
  const preview = getSharePreview(token, shareId);
  const title = preview
    ? `Payer votre place — ${preview.eventTitle} | GR Ticket`
    : "Lien de paiement | GR Ticket";
  const description = preview
    ? `Payez ${preview.amountLabel} votre place pour ${preview.eventTitle} sur GR Ticket.`
    : "Payez votre place en toute sécurité sur GR Ticket.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "GR Ticket" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PayerPage({ params }: Props) {
  const { token, shareId } = await params;
  return <PayerClient token={token} shareId={shareId} />;
}
