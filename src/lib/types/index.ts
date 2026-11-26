export type UserRole = 'admin' | 'manager' | 'seller' | 'scanner' | 'customer';
export type EventCategory = 'Concert' | 'Festival' | 'VIP Pass' | 'Sport' | 'Spectacle';
export type EventStatus = 'draft' | 'published' | 'sold_out' | 'ended' | 'cancelled';
export type TicketStatus = 'valide' | 'utilise' | 'annule' | 'rembourse';
export type PaymentMethod = string;
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
  city: string;
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

  // Internationalisation (aucune valeur spécifique à un pays dans le métier).
  countryCode?: string;
  currency?: string;
  timeZone?: string;
  startAtUtc?: string;
  locale?: string;
  taxRuleId?: string;
  branding?: EventBranding;

  // Garantie GRTK et paiement groupé.
  guaranteeEnabled?: boolean;
  splitEnabled?: boolean;
  groupValidationMode?: GroupValidationMode;
  holdHours?: number;
  resaleCapPercent?: number;
  installmentsEnabled?: boolean;
}

export interface EventBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
}

export type GroupValidationMode = "all_or_nothing" | "paid_seats";

export interface GroupPayment {
  id: string;
  token: string;
  eventId: string;
  eventTitle: string;
  initiatorName: string;
  currency: string;
  countryCode: string;
  validationMode: GroupValidationMode;
  quantity: number;
  totalAmountMinor: number;
  holdHours: number;
  createdAt: string;
  expiresAt: string;
  status: "open" | "completed" | "expired" | "cancelled";
  reminderHalfSent: boolean;
  reminderFinalSent: boolean;
}

export interface GroupShare {
  id: string;
  groupId: string;
  seatIndex: number;
  holderName: string | null;
  amountMinor: number;
  status: "pending" | "paid" | "expired" | "refunded";
  idempotencyKey: string | null;
  paymentMethod: string | null;
  ticketId: string | null;
  paidAt: string | null;
}

export interface GrtkTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  holderName: string;
  holderAccountId: string;
  deviceId: string;
  seatLabel: string;
  priceMinor: number;
  currency: string;
  status: "reserved" | "active" | "used" | "transferred" | "refunded";
  qrVersion: number;
  createdAt: string;
}

export interface RefundClaim {
  id: string;
  ticketId: string;
  reason: string;
  photoUrl?: string;
  status: "pending" | "approved" | "rejected" | "paid";
  decision: "auto" | "agent" | null;
  amountMinor: number;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
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