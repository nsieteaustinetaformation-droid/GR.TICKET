/**
 * Helpers partagés pour les images uploadées.
 * Rien ici ne dépend du navigateur : ce module est importable côté serveur.
 */

export const IMAGE_BUCKET = "grtk-images";

/** Taille maximale d'un fichier brut accepté par l'API (8 Mo). */
export const MAX_IMAGE_MB = 8;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"] as const;
const IMAGE_KINDS = ["cover", "square", "ticket", "avatar", "gallery"] as const;

export function isAcceptedImageType(type: string): type is AcceptedImageType {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type);
}

/**
 * Construit un chemin de stockage sûr : `kind/<id>.<extension>`.
 * Le nom de fichier d'origine n'est jamais conservé tel quel.
 */
export function imagePath(kind: string, id: string, filename: string): string {
  const safeKind = (IMAGE_KINDS as readonly string[]).includes(kind.toLowerCase())
    ? kind.toLowerCase()
    : "cover";
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "image";
  const rawExtension = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "jpg";
  const extension = (IMAGE_EXTENSIONS as readonly string[]).includes(rawExtension)
    ? rawExtension === "jpeg"
      ? "jpg"
      : rawExtension
    : "jpg";

  return `${safeKind}/${safeId}.${extension}`;
}

/**
 * Retourne l'URL publique Supabase pour un chemin de stockage, ou laisse
 * passer les URL déjà complètes (data URL, http(s), chemin `/public/...`).
 */
export function getImageUrl(path: string): string {
  if (!path) return "";
  if (/^(data:|blob:|https?:\/\/|\/)/i.test(path)) return path;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (
    !supabaseUrl ||
    !/^https:\/\//i.test(supabaseUrl) ||
    supabaseUrl.includes("votre-projet")
  ) {
    return path;
  }

  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${IMAGE_BUCKET}/${path.replace(/^\/+/, "")}`;
}
