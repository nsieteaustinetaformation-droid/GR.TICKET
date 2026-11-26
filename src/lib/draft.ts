import type { EventCategory, PaymentMethod } from "@/lib/types";

export interface TicketTypeDraft {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface EventDraft {
  title: string;
  category: EventCategory | "";
  description: string;
  date: string;
  startTime: string;
  doorsOpenTime: string;
  venue: string;
  city: "Brazzaville" | "Pointe-Noire" | "Dolisie" | "Oyo" | "";
  address: string;
  imageUrl: string;
  ticketTypes: TicketTypeDraft[];
  payoutMethod: PaymentMethod;
  payoutPhone: string;
  accepted: boolean;
}

const DRAFT_KEY = "gr-ticket-event-draft";

export function emptyDraft(): EventDraft {
  return {
    title: "",
    category: "",
    description: "",
    date: "",
    startTime: "",
    doorsOpenTime: "",
    venue: "",
    city: "",
    address: "",
    imageUrl: "/images/ticket_bg.jpg",
    ticketTypes: [{ id: crypto.randomUUID(), name: "Standard", price: 10000, quantity: 100 }],
    payoutMethod: "mtn",
    payoutPhone: "",
    accepted: false,
  };
}

export function loadDraft(): EventDraft {
  const base = emptyDraft();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return base;
    return { ...base, ...(JSON.parse(raw) as Partial<EventDraft>) };
  } catch {
    return base;
  }
}

export function saveDraft(patch: Partial<EventDraft>): EventDraft {
  const next = { ...loadDraft(), ...patch };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearDraft(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY);
}

export function formatDraftDate(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Brazzaville",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00+01:00`));
}
