import type { EventItem, TicketType } from '@/lib/types';
import { notifyStoreChange } from './subscribe';

let currentEvents: EventItem[] = [];

export function setEvents(events: EventItem[]): void {
  currentEvents = events;
  notifyStoreChange();
}

const DEFAULT_TYPES = (eventId: string): TicketType[] => [
  { id: eventId + '-std', eventId, name: 'Standard', price: 15000, totalQuantity: 500, soldQuantity: 187, benefits: ['Accès Général'] },
  { id: eventId + '-vip', eventId, name: 'VIP Gang', price: 35000, totalQuantity: 100, soldQuantity: 54, benefits: ['Entrée Prioritaire', 'Zone Réservée', 'Cadeau Artiste'] },
  { id: eventId + '-et', eventId, name: 'Etudiant', price: 7500, totalQuantity: 200, soldQuantity: 99, benefits: ['Accès Général -50%'] },
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'ev-1', title: 'Godman Afro-Fusion Festival 2026', slug: 'godman-afro-fusion-2026',
    category: 'Festival', description: 'La nuit de tous les records avec les meilleurs artistes afro-fusion du Congo.',
    venue: 'Palais des Congrès', city: 'Brazzaville', address: 'Avenue de la Paix, Brazzaville',
    date: '28 Nov 2026', doorsOpenTime: '19h00', startTime: '20h30',
    imageUrl: '/images/ticket_bg.jpg', artistName: 'Godman Records All-Stars',
    organizer: 'Godman Records', status: 'published', featured: true,
    ticketTypes: DEFAULT_TYPES('ev-1'),
  },
  {
    id: 'ev-2', title: 'Fally Ipupa & Guests Live', slug: 'fally-ipupa-live-2027',
    category: 'Concert', description: 'La légende de la rumba congolaise en live spectaculaire.',
    venue: 'Stade Alphonse Massamba-Débat', city: 'Brazzaville', address: 'Avenue Félix Éboué',
    date: '15 Janv 2027', doorsOpenTime: '18h00', startTime: '19h00',
    imageUrl: '/images/concert_guitarist.jpg', artistName: 'Fally Ipupa',
    organizer: 'Godman Records', status: 'published', featured: true,
    ticketTypes: [
      { id: 'ev2-std', eventId: 'ev-2', name: 'Standard', price: 10000, totalQuantity: 800, soldQuantity: 421 },
      { id: 'ev2-vip', eventId: 'ev-2', name: 'VIP Fosse', price: 25000, totalQuantity: 150, soldQuantity: 78 },
    ],
  },
  {
    id: 'ev-3', title: 'Nuit de la Rumba Congolaise', slug: 'nuit-rumba-2026',
    category: 'VIP Pass', description: 'Une soirée d’exception au palais de Pointe-Noire.',
    venue: 'Hôtel Atlantic Palace', city: 'Pointe-Noire', address: 'Avenue Charles de Gaulle',
    date: '05 Déc 2026', doorsOpenTime: '20h00', startTime: '21h00',
    imageUrl: '/images/artist_hero.jpg', artistName: 'Multiples Artistes',
    organizer: 'Godman Records', status: 'published', featured: false,
    ticketTypes: [
      { id: 'ev3-vip', eventId: 'ev-3', name: 'VIP Pass Prestige', price: 25000, totalQuantity: 200, soldQuantity: 118, benefits: ['Accès VIP', 'Cocktail', 'Meet & Greet'] },
    ],
  },
  {
    id: 'ev-4', title: 'Festival Panafricain FESPAM 2027', slug: 'fespam-2027',
    category: 'Festival', description: 'Le plus grand festival de musiques africaines au Congo.',
    venue: 'Esplanade CNRTV', city: 'Brazzaville', address: 'Avenue Félix Éboué',
    date: '20 Fév 2027', doorsOpenTime: '17h00', startTime: '18h00',
    imageUrl: '/images/festival_stadium.jpg', artistName: 'Artistes Africains',
    organizer: 'Ministère de la Culture', status: 'published', featured: false,
    ticketTypes: [
      { id: 'ev4-std', eventId: 'ev-4', name: 'Entrée Générale', price: 20000, totalQuantity: 1000, soldQuantity: 312 },
    ],
  },
  {
    id: 'ev-5', title: 'Gospel & Soul Celebration Live', slug: 'gospel-soul-2026',
    category: 'Concert', description: 'Une soiree spirituelle et musicale inoubliable.',
    venue: 'Centre Culturel Russe', city: 'Brazzaville', address: 'Rade de Brazzaville',
    date: '12 Déc 2026', doorsOpenTime: '16h00', startTime: '17h30',
    imageUrl: '/images/ticket_bg.jpg', artistName: 'Choeb Gospel Choir',
    organizer: 'Godman Records', status: 'published', featured: false,
    ticketTypes: [
      { id: 'ev5-std', eventId: 'ev-5', name: 'Entrée Standard', price: 5000, totalQuantity: 500, soldQuantity: 223 },
    ],
  },
  {
    id: 'ev-6', title: 'Godman All-Stars New Year Showcase', slug: 'godman-new-year-2026',
    category: 'VIP Pass', description: 'La nuit ultime pour passer le réveillon avec les étoiles.',
    venue: 'Club 64 VIP Lounge', city: 'Brazzaville', address: 'Quartier Gamba, Brazzaville',
    date: '31 Déc 2026', doorsOpenTime: '21h00', startTime: '22h00',
    imageUrl: '/images/concert_guitarist.jpg', artistName: 'Godman Records All-Stars',
    organizer: 'Godman Records', status: 'published', featured: false,
    ticketTypes: [
      { id: 'ev6-vip', eventId: 'ev-6', name: 'VIP Open-Bar', price: 30000, totalQuantity: 100, soldQuantity: 67, benefits: ['Open Bar', 'Accès Lounge', 'Cadeau VIP'] },
    ],
  },
];

function allEvents(): EventItem[] {
  return currentEvents.length > 0 ? currentEvents : MOCK_EVENTS;
}

export function getEventById(id: string): EventItem | undefined {
  return allEvents().find(e => e.id === id);
}

export function getFeaturedEvents(): EventItem[] {
  return allEvents().filter(e => e.featured && e.status === 'published');
}

export function getEventsByCategory(cat: string): EventItem[] {
  if (cat === 'Tous') return allEvents().filter(e => e.status === 'published');
  return allEvents().filter(e => e.category === cat && e.status === 'published');
}

export function getEventCapacityPercent(event: EventItem): number {
  const totalSold = event.ticketTypes.reduce((s, t) => s + t.soldQuantity, 0);
  const totalCap = event.ticketTypes.reduce((s, t) => s + t.totalQuantity, 0);
  if (totalCap === 0) return 0;
  return Math.round((totalSold / totalCap) * 100);
}
