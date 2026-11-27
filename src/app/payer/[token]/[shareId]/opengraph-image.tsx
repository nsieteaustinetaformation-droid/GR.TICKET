import { connection } from "next/server";
import { getSharePreview } from "@/lib/server/share-data";
import { ogContentType, ogImage, ogSize } from "@/lib/server/og";

export const alt = "Lien de paiement GR Ticket";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ token: string; shareId: string }>;
}) {
  await connection();
  const { token, shareId } = await params;
  const preview = getSharePreview(token, shareId);

  return ogImage({
    eyebrow: "Payez votre place",
    title: preview?.eventTitle ?? "Billetterie GR Ticket",
    subtitle: preview ? `${preview.amountLabel} · place réservée` : "Paiement sécurisé en ligne",
    footer: preview?.initiator ? `Organisé par ${preview.initiator}` : "GR Ticket",
  });
}
