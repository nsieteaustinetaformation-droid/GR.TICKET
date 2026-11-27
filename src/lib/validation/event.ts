import { z } from "zod";
import { getCountryConfig } from "@/lib/international/config";
import "@/lib/international/seed";

export type EventStep = 1 | 2 | 3 | 4;

export interface FieldErrors {
  [field: string]: string;
}

export interface StepValidation {
  valid: boolean;
  errors: FieldErrors;
  firstField: string | null;
}

/** Ordre canonique des champs : sert au rendu des erreurs et au scroll. */
const INFO_FIELDS = [
  "title",
  "category",
  "description",
  "date",
  "startTime",
  "timeZone",
  "venue",
  "city",
  "countryCode",
  "imageUrl",
  "bannerUrl",
];
const TICKET_FIELDS = ["ticketTypes"];
const PAYOUT_FIELDS = ["payoutMethod", "payoutPhone", "accepted"];

export const EVENT_STEP_FIELDS: Record<EventStep, string[]> = {
  1: INFO_FIELDS,
  2: TICKET_FIELDS,
  3: PAYOUT_FIELDS,
  4: [...INFO_FIELDS, ...TICKET_FIELDS, ...PAYOUT_FIELDS],
};

/* ------------------------------------------------------------------ */
/* Gardes sur un brouillon partiel (jamais d'exception).                */
/* ------------------------------------------------------------------ */

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function hasOwn(target: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key);
}

function isStockImage(value: string): boolean {
  return /^\/images\//i.test(value);
}

/**
 * Une couverture valide est fournie par l'utilisateur (upload / URL).
 * Les anciennes images embarquées sous /images/ ne comptent pas.
 */
type CoverState = "ok" | "missing" | "default";

function coverState(draft: Record<string, unknown>): CoverState {
  const candidates = [asText(draft.imageUrl), asText(draft.bannerUrl)].filter(Boolean);
  if (candidates.length === 0) return "missing";
  if (candidates.some((value) => !isStockImage(value))) return "ok";
  return "default";
}

function isTimeZone(value: string): boolean {
  if (!value) return false;
  try {
    const supported = (
      Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
    ).supportedValuesOf?.("timeZone");
    if (supported && !supported.includes(value)) return false;
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    // Certains moteurs n'implémentent pas supportedValuesOf : DateTimeFormat
    // reste la source de vérité.
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
      return true;
    } catch {
      return false;
    }
  }
}

type DateState = "missing" | "invalid" | "past" | "ok";

function dateState(value: string): DateState {
  if (!value) return "missing";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "invalid";
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return "invalid";
  if (timestamp <= Date.now()) return "past";
  return "ok";
}

function isStartTime(value: string): boolean {
  return /^\d{1,2}:\d{2}$/.test(value);
}

function paymentMethodsFor(draft: Record<string, unknown>): string[] {
  try {
    return getCountryConfig(asText(draft.countryCode)).paymentMethods ?? [];
  } catch {
    return [];
  }
}

function matchesPaymentMethod(method: string, draft: Record<string, unknown>): boolean {
  const normalized = method.toLocaleLowerCase("fr");
  return paymentMethodsFor(draft).some(
    (candidate) => asText(candidate).toLocaleLowerCase("fr") === normalized
  );
}

/* ------------------------------------------------------------------ */
/* Validation étape par étape.                                         */
/* ------------------------------------------------------------------ */

type SingleStep = 1 | 2 | 3;

function validateSingleStep(step: SingleStep, draft: unknown): StepValidation {
  const data = asRecord(draft);
  const errors: FieldErrors = {};

  if (step === 1) {
    if (!asText(data.title)) errors.title = "Indiquez le nom de l'événement.";
    if (!asText(data.category)) errors.category = "Choisissez une catégorie.";
    if (!asText(data.description)) errors.description = "Rédigez une description.";

    const date = asText(data.date);
    const state = dateState(date);
    if (state === "missing") errors.date = "Choisissez une date.";
    else if (state === "invalid") errors.date = "Choisissez une date valide.";
    else if (state === "past") errors.date = "La date doit être dans le futur.";

    const startTime = asText(data.startTime);
    if (!startTime) errors.startTime = "Indiquez l'heure de début.";
    else if (!isStartTime(startTime)) errors.startTime = "Indiquez une heure valide.";

    const timeZone = asText(data.timeZone);
    if (!timeZone) errors.timeZone = "Choisissez un fuseau horaire.";
    else if (!isTimeZone(timeZone)) errors.timeZone = "Choisissez un fuseau horaire valide.";

    if (!asText(data.venue)) errors.venue = "Indiquez le lieu de l'événement.";
    if (!asText(data.city)) errors.city = "Indiquez la ville.";
    if (!asText(data.countryCode)) errors.countryCode = "Choisissez un pays.";

    const cover = coverState(data);
    if (cover !== "ok") {
      const message = cover === "default"
        ? "L'image par défaut n'est pas autorisée. Choisissez une couverture."
        : "Choisissez une couverture.";
      errors.imageUrl = message;
      errors.bannerUrl = message;
    }
  }

  if (step === 2) {
    const tickets = Array.isArray(data.ticketTypes) ? data.ticketTypes : [];
    if (tickets.length === 0) {
      errors.ticketTypes = "Ajoutez au moins un type de billet.";
    } else {
      let invalid = false;
      tickets.forEach((raw, index) => {
        const ticket = asRecord(raw);
        if (!asText(ticket.name)) {
          errors[`ticketTypes.${index}.name`] = "Indiquez le nom du billet.";
          invalid = true;
        }
        const price = asNumber(ticket.price);
        if (price === null) {
          errors[`ticketTypes.${index}.price`] = "Indiquez le prix.";
          invalid = true;
        } else if (price <= 0) {
          errors[`ticketTypes.${index}.price`] = "Le prix doit être supérieur à 0.";
          invalid = true;
        }
        const quantity = asNumber(ticket.totalQuantity ?? ticket.quantity);
        if (quantity === null) {
          errors[`ticketTypes.${index}.quantity`] = "Indiquez la quantité.";
          invalid = true;
        } else if (quantity <= 0 || !Number.isInteger(quantity)) {
          errors[`ticketTypes.${index}.quantity`] = "La quantité doit être supérieure à 0.";
          invalid = true;
        }
      });
      if (invalid) {
        errors.ticketTypes = "Vérifiez les billets : nom, prix et quantité sont obligatoires.";
      }
    }
  }

  if (step === 3) {
    const method = asText(data.payoutMethod);
    if (!method) errors.payoutMethod = "Choisissez un moyen de paiement.";
    else if (!matchesPaymentMethod(method, data)) {
      errors.payoutMethod = "Choisissez un moyen de paiement valide pour ce pays.";
    }
    if (!asText(data.payoutPhone)) {
      errors.payoutPhone = "Indiquez le numéro de réception.";
    }
    if (data.accepted !== true) {
      errors.accepted = "Acceptez les conditions de commission.";
    }
  }

  const firstField = EVENT_STEP_FIELDS[step].find((field) => hasOwn(errors, field)) ?? null;
  return { valid: Object.keys(errors).length === 0, errors, firstField };
}

function mergeValidations(results: StepValidation[]): StepValidation {
  const errors: FieldErrors = {};
  for (const result of results) {
    for (const [field, message] of Object.entries(result.errors)) {
      if (!hasOwn(errors, field)) errors[field] = message;
    }
  }
  const ordered = [
    ...EVENT_STEP_FIELDS[1],
    ...EVENT_STEP_FIELDS[2],
    ...EVENT_STEP_FIELDS[3],
  ];
  const firstField = ordered.find((field) => hasOwn(errors, field)) ?? null;
  return { valid: Object.keys(errors).length === 0, errors, firstField };
}

export function validateEventForPublish(draft: unknown): StepValidation {
  return mergeValidations([
    validateSingleStep(1, draft),
    validateSingleStep(2, draft),
    validateSingleStep(3, draft),
  ]);
}

export function validateEventStep(step: EventStep, draft: unknown): StepValidation {
  if (step === 4) return validateEventForPublish(draft);
  return validateSingleStep(step, draft);
}

/* ------------------------------------------------------------------ */
/* Schéma Zod complet (garde serveur).                                 */
/* ------------------------------------------------------------------ */

export interface EventPublishTicket {
  id?: string;
  name: string;
  price: number;
  quantity?: number;
  totalQuantity?: number;
}

export interface EventPublishInput {
  title: string;
  category: string;
  description: string;
  date: string;
  startTime: string;
  timeZone: string;
  venue: string;
  city: string;
  countryCode: string;
  imageUrl?: string;
  bannerUrl?: string;
  ticketTypes: EventPublishTicket[];
  payoutMethod: string;
  payoutPhone: string;
  accepted: true;
  address?: string;
  currency?: string;
  doorsOpenTime?: string;
}

const ticketSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1, "Indiquez le nom du billet."),
    price: z.number({ error: "Indiquez le prix." }).positive("Le prix doit être supérieur à 0."),
    quantity: z
      .number({ error: "Indiquez la quantité." })
      .int("La quantité doit être un nombre entier.")
      .positive("La quantité doit être supérieure à 0.")
      .optional(),
    totalQuantity: z
      .number({ error: "Indiquez la quantité." })
      .int("La quantité doit être un nombre entier.")
      .positive("La quantité doit être supérieure à 0.")
      .optional(),
  })
  .superRefine((ticket, ctx) => {
    const hasQuantity =
      (typeof ticket.quantity === "number" && ticket.quantity > 0) ||
      (typeof ticket.totalQuantity === "number" && ticket.totalQuantity > 0);
    if (!hasQuantity) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "La quantité doit être supérieure à 0.",
      });
    }
  });

const eventDraftSchema = z.object({
  title: z.string().trim().min(1, "Indiquez le nom de l'événement."),
  category: z.string().trim().min(1, "Choisissez une catégorie."),
  description: z.string().trim().min(1, "Rédigez une description."),
  date: z
    .string()
    .trim()
    .min(1, "Choisissez une date.")
    .refine((value) => dateState(value) !== "invalid", "Choisissez une date valide.")
    .refine((value) => dateState(value) !== "past", "La date doit être dans le futur."),
  startTime: z
    .string()
    .trim()
    .min(1, "Indiquez l'heure de début.")
    .refine(isStartTime, "Indiquez une heure valide."),
  timeZone: z
    .string()
    .trim()
    .min(1, "Choisissez un fuseau horaire.")
    .refine(isTimeZone, "Choisissez un fuseau horaire valide."),
  venue: z.string().trim().min(1, "Indiquez le lieu de l'événement."),
  city: z.string().trim().min(1, "Indiquez la ville."),
  countryCode: z.string().trim().min(1, "Choisissez un pays."),
  imageUrl: z.string().trim().optional(),
  bannerUrl: z.string().trim().optional(),
  address: z.string().trim().optional(),
  currency: z.string().trim().optional(),
  doorsOpenTime: z.string().trim().optional(),
  ticketTypes: z.array(ticketSchema).min(1, "Ajoutez au moins un type de billet."),
  payoutMethod: z.string().trim().min(1, "Choisissez un moyen de paiement."),
  payoutPhone: z.string().trim().min(1, "Indiquez le numéro de réception."),
  accepted: z.literal(true, { error: "Acceptez les conditions de commission." }),
});

export const eventPublishSchema: z.ZodType<EventPublishInput> = eventDraftSchema.superRefine(
  (value, ctx) => {
    const cover = coverState({ imageUrl: value.imageUrl, bannerUrl: value.bannerUrl });
    if (cover !== "ok") {
      const message = cover === "default"
        ? "L'image par défaut n'est pas autorisée. Choisissez une couverture."
        : "Choisissez une couverture.";
      ctx.addIssue({ code: "custom", path: ["imageUrl"], message });
      ctx.addIssue({ code: "custom", path: ["bannerUrl"], message });
    }

    if (!matchesPaymentMethod(value.payoutMethod, { countryCode: value.countryCode })) {
      ctx.addIssue({
        code: "custom",
        path: ["payoutMethod"],
        message: "Choisissez un moyen de paiement valide pour ce pays.",
      });
    }
  }
);
