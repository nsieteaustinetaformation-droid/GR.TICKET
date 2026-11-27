import { z } from "zod";
import type { FieldErrors, StepValidation } from "./event";

export const AUTH_FIELDS = ["fullName", "email", "password", "phone"] as const;

export const authSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez votre nom (2 caractères minimum)."),
  email: z.email("Indiquez une adresse e-mail valide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{1,14}$/, "Indiquez un numéro au format international (+...).")
    .optional(),
});

export type AuthInput = z.infer<typeof authSchema>;

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez votre nom (2 caractères minimum)."),
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{1,14}$/, "Indiquez un numéro au format international (+...).")
    .optional()
    .or(z.literal("")),
});

export function validateProfile(input: unknown): StepValidation {
  const parsed = profileSchema.safeParse(input);
  if (parsed.success) return { valid: true, errors: {}, firstField: null };

  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path.length > 0 ? issue.path.map((part) => String(part)).join(".") : "form";
    if (!Object.prototype.hasOwnProperty.call(errors, field)) errors[field] = issue.message;
  }
  return {
    valid: false,
    errors,
    firstField: (["fullName", "phone"] as const).find((name) => errors[name]) ?? Object.keys(errors)[0] ?? null,
  };
}

export function validateAuth(input: unknown): StepValidation {
  const parsed = authSchema.safeParse(input);
  if (parsed.success) return { valid: true, errors: {}, firstField: null };

  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path.length > 0 ? issue.path.map((part) => String(part)).join(".") : "form";
    if (!Object.prototype.hasOwnProperty.call(errors, field)) errors[field] = issue.message;
  }
  const firstField =
    AUTH_FIELDS.find((field) => Object.prototype.hasOwnProperty.call(errors, field)) ??
    Object.keys(errors)[0] ??
    null;
  return { valid: false, errors, firstField };
}
