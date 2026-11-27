import { connection } from "next/server";
import { getGroupPreview } from "@/lib/server/share-data";
import { ogContentType, ogImage, ogSize } from "@/lib/server/og";

export const alt = "Paiement de groupe GR Ticket";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const { token } = await params;
  const preview = getGroupPreview(token);

  return ogImage({
    eyebrow: "Paiement à plusieurs",
    title: preview?.eventTitle ?? "Billetterie GR Ticket",
    subtitle: preview ? `${preview.quantity} places · ${preview.totalLabel}` : "Chacun paie sa place",
    footer: preview?.initiator ? `Organisé par ${preview.initiator}` : "GR Ticket",
  });
}
