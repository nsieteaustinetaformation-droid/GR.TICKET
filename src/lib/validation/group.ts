import { z } from "zod";
import type { FieldErrors, StepValidation } from "./event";

export const GROUP_FIELDS = [
  "eventId",
  "initiatorName",
  "quantity",
  "unitAmountMinor",
  "capacity",
  "holdHours",
] as const;

export const groupSchema = z.object({
  eventId: z.string().trim().min(1, "Indiquez l'événement concerné."),
  initiatorName: z.string().trim().min(2, "Indiquez le nom de l'initiateur (2 caractères minimum)."),
  quantity: z
    .number({ error: "Indiquez la quantité." })
    .int("La quantité doit être un nombre entier.")
    .min(1, "La quantité doit être d'au moins 1.")
    .max(10, "La quantité ne peut pas dépasser 10."),
  unitAmountMinor: z
    .number({ error: "Indiquez le montant par place." })
    .int("Le montant doit être un nombre entier.")
    .positive("Le montant doit être supérieur à 0."),
  capacity: z
    .number({ error: "Indiquez la capacité." })
    .int("La capacité doit être un nombre entier.")
    .positive("La capacité doit être supérieure à 0."),
  holdHours: z
    .number({ error: "Indiquez la durée de réservation." })
    .int("La durée doit être un nombre entier.")
    .min(1, "La durée doit être d'au moins 1 heure.")
    .max(168, "La durée ne peut pas dépasser 168 heures."),
});

export type GroupInput = z.infer<typeof groupSchema>;

export function validateGroup(input: unknown): StepValidation {
  const parsed = groupSchema.safeParse(input);
  if (parsed.success) return { valid: true, errors: {}, firstField: null };

  const errors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path.length > 0 ? issue.path.map((part) => String(part)).join(".") : "form";
    if (!Object.prototype.hasOwnProperty.call(errors, field)) errors[field] = issue.message;
  }
  const firstField =
    GROUP_FIELDS.find((field) => Object.prototype.hasOwnProperty.call(errors, field)) ??
    Object.keys(errors)[0] ??
    null;
  return { valid: false, errors, firstField };
}
