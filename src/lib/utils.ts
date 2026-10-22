import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant en Francs CFA (XAF) avec séparateur d'espace conforme aux exigences
 * Exemple: 5000 -> "5 000 FCFA"
 */
export function formatXAF(amount: number): string {
  const formatted = new Intl.NumberFormat("fr-CG", {
    style: "decimal",
    useGrouping: true,
  }).format(amount);
  return `${formatted.replace(/\u202F/g, " ")} FCFA`;
}

/**
 * Formate une date au fuseau Africa/Brazzaville
 */
export function formatDateBrazza(dateInput: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Africa/Brazzaville",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };
  return new Intl.DateTimeFormat("fr-FR", defaultOptions).format(date);
}

/**
 * Alphabet Crockford sécurisé (sans 0, O, 1, I, L) pour éviter toute ambiguïté
 */
const CROCKFORD_CHARS = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateTicketCode(): string {
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 5; i++) {
    part1 += CROCKFORD_CHARS.charAt(Math.floor(Math.random() * CROCKFORD_CHARS.length));
    part2 += CROCKFORD_CHARS.charAt(Math.floor(Math.random() * CROCKFORD_CHARS.length));
  }
  return `GR-${part1}-${part2}`;
}
