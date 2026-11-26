import type { EventItem, TicketType } from '@/lib/types';
import { notifyStoreChange } from './subscribe';

// Les événements appartiennent aux organisateurs connectés.
// Aucun événement n'est créé par la plateforme.
let currentEvents: EventItem[] = [];

const LOCAL_KEY = 'gr-ticket-events';

export function setEvents(events: EventItem[]): void {
  currentEvents = events;
  notifyStoreChange();
}

export function addEvent(event: EventItem): void {
  currentEvents = [event, ...currentEvents];
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(currentEvents));
    } catch {
      // Stockage local indisponible : l'événement reste en mémoire.
    }
  }
  notifyStoreChange();
}

export function restoreLocalEvents(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) currentEvents = parsed as EventItem[];
  } catch {
    // Données locales corrompues : on repart avec une liste vide.
  }
  notifyStoreChange();
}

export function getEventById(id: string): EventItem | undefined {
  return currentEvents.find(e => e.id === id);
}

export function getFeaturedEvents(): EventItem[] {
  return currentEvents.filter(e => e.featured && e.status === 'published');
}

export function getEventsByCategory(cat: string): EventItem[] {
  if (cat === 'Tous') return currentEvents.filter(e => e.status === 'published');
  return currentEvents.filter(e => e.category === cat && e.status === 'published');
}

export function getEventsByOwner(ownerId: string): EventItem[] {
  return currentEvents.filter(e => e.ownerId === ownerId);
}

export function getEventCapacityPercent(event: EventItem): number {
  const totalSold = event.ticketTypes.reduce((s, t) => s + t.soldQuantity, 0);
  const totalCap = event.ticketTypes.reduce((s, t) => s + t.totalQuantity, 0);
  if (totalCap === 0) return 0;
  return Math.round((totalSold / totalCap) * 100);
}

export function getCheapestPrice(event: EventItem): number {
  if (!event.ticketTypes.length) return 0;
  return Math.min(...event.ticketTypes.map((type: TicketType) => type.price));
}
