import { z } from "zod";
import type { FieldErrors, StepValidation } from "./event";

export const CLAIM_FIELDS = ["ticketId", "reason", "photoUrl", "countryCode"] as const;

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function isImageDataUrl(value: string): boolean {
  return /^data:image\/[a-z0-9.+-]+(;base64)?,/i.test(value);
}

export const claimSchema = z.object({
  ticketId: z.string().trim().min(1, "Indiquez le billet concerné."),
  reason: z.string().trim().min(5, "Décrivez le problème en au moins 5 caractères."),
  photoUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || isHttpUrl(value) || isImageDataUrl(value),
      "Fournissez une URL ou une image valide."
    ),
  countryCode: z
    .string()
    .trim()
    .min(2, "Choisissez un pays valide.")
    .regex(/^[a-z]{2}$/i, "Choisissez un pays valide.")
    .optional(),
});

export type ClaimInput = z.infer<typeof claimSchema>;

export function validateClaim(input: unknown): StepValidation {
  const parsed = claimSchema.safeParse(input);
  if (parsed.success) return { valid: true, errors: {}, firstField: null };

  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path.length > 0 ? issue.path.map((part) => String(part)).join(".") : "form";
    if (!Object.prototype.hasOwnProperty.call(errors, field)) errors[field] = issue.message;
  }
  const firstField =
    CLAIM_FIELDS.find((field) => Object.prototype.hasOwnProperty.call(errors, field)) ??
    Object.keys(errors)[0] ??
    null;
  return { valid: false, errors, firstField };
}
