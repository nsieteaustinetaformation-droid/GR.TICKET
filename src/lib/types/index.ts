export type UserRole = 'admin' | 'manager' | 'seller' | 'scanner' | 'customer';
export type EventCategory = 'Concert' | 'Festival' | 'VIP Pass' | 'Sport' | 'Spectacle';
export type EventStatus = 'draft' | 'published' | 'sold_out' | 'ended' | 'cancelled';
export type TicketStatus = 'valide' | 'utilise' | 'annule' | 'rembourse';
export type PaymentMethod = 'mtn' | 'airtel' | 'cash';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  totalQuantity: number;
  soldQuantity: number;
  description?: string;
  benefits?: string[];
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  category: EventCategory;
  description: string;
  venue: string;
  city: 'Brazzaville' | 'Pointe-Noire' | 'Dolisie' | 'Oyo';
  address: string;
  date: string;
  doorsOpenTime: string;
  startTime: string;
  imageUrl: string;
  bannerUrl?: string;
  artistName: string;
  organizer: string;
  status: EventStatus;
  featured?: boolean;
  ticketTypes: TicketType[];
  ownerId?: string;
  commissionPercent?: number;
  payoutMethod?: PaymentMethod;
  payoutPhone?: string;
}

export interface Ticket {
  id: string;
  code: string;
  qrToken: string;
  eventId: string;
  eventTitle: string;
  eventVenue: string;
  eventDate: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  paymentMethod: PaymentMethod;
  status: TicketStatus;
  createdAt: string;
  scannedAt?: string;
  scannedBy?: string;
  scanDoor?: string;
}

export interface Order {
  id: string;
  eventId: string;
  eventTitle: string;
  buyerName: string;
  buyerPhone: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  ticketCount: number;
  tickets: Ticket[];
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  ticketId: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  scannerId: string;
  scannerName: string;
  door: string;
  result: 'SUCCESS' | 'ALREADY_USED' | 'INVALID_CODE' | 'WRONG_EVENT';
  timestamp: string;
  buyerName: string;
  ticketTypeName: string;
  offlineSync?: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: 'TICKET_CREATED' | 'TICKET_SCANNED' | 'TICKET_CANCELLED' | 'PAYMENT_RECEIVED';
  performedBy: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}