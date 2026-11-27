import { requireApiAuth } from "@/lib/api/guard";
import {
  EVENT_STEP_FIELDS,
  eventPublishSchema,
} from "@/lib/validation/event";

// Next.js 16 + cacheComponents : le runtime Node.js est le défaut et
// l'export segment `runtime` est interdit (même avec la valeur "nodejs").
const ORDERED_FIELDS = [
  ...EVENT_STEP_FIELDS[1],
  ...EVENT_STEP_FIELDS[2],
  ...EVENT_STEP_FIELDS[3],
];

export async function POST(request: Request): Promise<Response> {
  const guard = await requireApiAuth("organizer");
  if (guard instanceof Response) return guard;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, errors: { form: "Données JSON invalides." }, firstField: "form" },
      { status: 422 }
    );
  }

  const parsed = eventPublishSchema.safeParse(payload);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field =
        issue.path.length > 0
          ? issue.path.map((part) => String(part)).join(".")
          : "form";
      if (!Object.prototype.hasOwnProperty.call(errors, field)) {
        errors[field] = issue.message;
      }
    }
    const firstField =
      ORDERED_FIELDS.find((field) => Object.prototype.hasOwnProperty.call(errors, field)) ??
      Object.keys(errors)[0] ??
      null;

    return Response.json({ ok: false, errors, firstField }, { status: 422 });
  }

  // La persistance Supabase reste côté client pour l'instant ; la garde
  // serveur, elle, est bien réelle et bloque toute publication invalide.
  return Response.json({ ok: true });
}

export function GET(): Response {
  return Response.json(
    { ok: false, error: "Méthode non autorisée. Utilisez POST." },
    { status: 405, headers: { Allow: "POST" } }
  );
}
