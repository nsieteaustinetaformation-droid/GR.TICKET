import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_BUCKET,
  MAX_IMAGE_MB,
  imagePath,
  isAcceptedImageType,
} from "@/lib/storage/images";

// Avec `cacheComponents`, le runtime Node.js est le défaut : aucun export
// `runtime` n'est autorisé (Next.js 16).

const MAX_BYTES = MAX_IMAGE_MB * 1024 * 1024;
const UPLOAD_KINDS = new Set(["cover", "square", "ticket", "avatar"]);
const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

interface SupabaseConfig {
  url: string;
  key: string;
}

function errorResponse(error: string, status: number): Response {
  return Response.json({ ok: false, error }, { status });
}

/** Refuse les valeurs de .env.example et toute URL qui n'est pas un projet Supabase. */
function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  if (!/^https:\/\/[^\s/]+\.supabase\.co\/?$/i.test(url)) return null;
  if (url.includes("votre-projet") || url.includes("exemple")) return null;
  if (key.length < 40 || key.endsWith("...") || key.includes("votre")) return null;
  return { url, key };
}

/**
 * POST /api/v1/uploads
 *
 * Reçoit un `FormData` : `file` (blob compressé/recadré), `dataUrl` (aperçu),
 * `kind` (forme de recadrage). Les noms de fichiers sont générés côté serveur :
 * aucun userId fourni par le client n'est accepté pour construire le chemin.
 *
 * Mode démo : sans Supabase configuré, on renvoie la data URL du navigateur.
 * L'aperçu fonctionne immédiatement, mais la persistance durable nécessite
 * Supabase Storage (bucket `grtk-images`, voir `supabase/schema.sql`).
 */
export async function POST(request: Request): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("Requête invalide : données de formulaire attendues.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return errorResponse("Aucun fichier image reçu.", 400);
  }
  if (file.size > MAX_BYTES) {
    return errorResponse(
      `Fichier trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo). Taille maximale : ${MAX_IMAGE_MB} Mo.`,
      400
    );
  }

  const mime = file.type.toLowerCase();
  if (!isAcceptedImageType(mime)) {
    return errorResponse(
      `Format non pris en charge (${mime || "inconnu"}). Formats acceptés : ${ACCEPTED_IMAGE_TYPES.join(", ")}.`,
      400
    );
  }

  const dataUrl = form.get("dataUrl");
  if (typeof dataUrl !== "string" || !DATA_URL_PATTERN.test(dataUrl)) {
    return errorResponse("Aperçu d'image invalide (data URL manquante).", 400);
  }

  const requestedKind = String(form.get("kind") ?? "cover");
  const kind = UPLOAD_KINDS.has(requestedKind) ? requestedKind : "cover";

  const config = readSupabaseConfig();
  if (!config) {
    return Response.json({ ok: true, url: dataUrl, demo: true });
  }

  try {
    const supabase = createClient(config.url, config.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const path = imagePath(kind, randomUUID(), file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, bytes, {
      contentType: mime,
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      return errorResponse(`Envoi vers le stockage impossible : ${error.message}`, 500);
    }

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) {
      return errorResponse("URL publique indisponible.", 500);
    }

    return Response.json({ ok: true, url: data.publicUrl, demo: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur inconnue.";
    return errorResponse(`Envoi impossible : ${message}`, 500);
  }
}
