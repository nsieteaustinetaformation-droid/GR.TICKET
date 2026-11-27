import { connection } from "next/server";
import { getTicketPreview } from "@/lib/server/share-data";
import { ogContentType, ogImage, ogSize } from "@/lib/server/og";

export const alt = "Billet officiel GR Ticket";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const preview = getTicketPreview(id);

  return ogImage({
    eyebrow: "Billet officiel",
    title: preview?.eventTitle ?? "Votre billet GR Ticket",
    subtitle: preview ? `${preview.holderName} · ${preview.priceLabel}` : "QR dynamique et garantie inclus",
    footer: "Billet garanti · QR dynamique",
  });
}
