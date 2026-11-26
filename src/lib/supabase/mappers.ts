import type { EventItem, Order, ScanRecord, TicketType } from "@/lib/types";

export interface EventRow {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  category: string;
  description: string;
  venue: string;
  city: string;
  address: string;
  date: string;
  doors_open_time: string;
  start_time: string;
  image_url: string;
  banner_url: string | null;
  artist_name: string;
  organizer: string;
  status: string;
  featured: boolean;
}

export interface TicketTypeRow {
  id: string;
  event_id: string;
  name: string;
  price: number;
  total_quantity: number;
  sold_quantity: number;
  description: string | null;
  benefits: string[];
}

export interface OrderRow {
  id: string;
  event_id: string;
  event_title: string;
  buyer_name: string;
  buyer_phone: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  ticket_count: number;
  tickets: unknown;
  created_at: string;
}

export interface ScanRow {
  id: string;
  ticket_id: string;
  ticket_code: string;
  event_id: string;
  event_title: string;
  scanner_id: string;
  scanner_name: string;
  door: string;
  result: string;
  timestamp: string;
  buyer_name: string;
  ticket_type_name: string;
  offline_sync: boolean;
}

export function eventToRow(event: EventItem): EventRow {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    subtitle: event.subtitle ?? null,
    category: event.category,
    description: event.description,
    venue: event.venue,
    city: event.city,
    address: event.address,
    date: event.date,
    doors_open_time: event.doorsOpenTime,
    start_time: event.startTime,
    image_url: event.imageUrl,
    banner_url: event.bannerUrl ?? null,
    artist_name: event.artistName,
    organizer: event.organizer,
    status: event.status,
    featured: Boolean(event.featured),
  };
}

export function eventFromRow(row: EventRow, ticketTypes: TicketType[]): EventItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle ?? undefined,
    category: row.category as EventItem["category"],
    description: row.description,
    venue: row.venue,
    city: row.city as EventItem["city"],
    address: row.address,
    date: row.date,
    doorsOpenTime: row.doors_open_time,
    startTime: row.start_time,
    imageUrl: row.image_url,
    bannerUrl: row.banner_url ?? undefined,
    artistName: row.artist_name,
    organizer: row.organizer,
    status: row.status as EventItem["status"],
    featured: row.featured,
    ticketTypes,
  };
}

export function ticketTypeToRow(type: TicketType, eventId?: string): TicketTypeRow {
  return {
    id: type.id,
    event_id: eventId ?? type.eventId,
    name: type.name,
    price: type.price,
    total_quantity: type.totalQuantity,
    sold_quantity: type.soldQuantity,
    description: type.description ?? null,
    benefits: type.benefits ?? [],
  };
}

export function ticketTypeFromRow(row: TicketTypeRow): TicketType {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    price: row.price,
    totalQuantity: row.total_quantity,
    soldQuantity: row.sold_quantity,
    description: row.description ?? undefined,
    benefits: row.benefits ?? [],
  };
}

export function orderToRow(order: Order): OrderRow {
  return {
    id: order.id,
    event_id: order.eventId,
    event_title: order.eventTitle,
    buyer_name: order.buyerName,
    buyer_phone: order.buyerPhone,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    total_amount: order.totalAmount,
    ticket_count: order.ticketCount,
    tickets: order.tickets,
    created_at: order.createdAt,
  };
}

export function orderFromRow(row: OrderRow): Order {
  return {
    id: row.id,
    eventId: row.event_id,
    eventTitle: row.event_title,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    paymentMethod: row.payment_method as Order["paymentMethod"],
    paymentStatus: row.payment_status as Order["paymentStatus"],
    totalAmount: row.total_amount,
    ticketCount: row.ticket_count,
    tickets: Array.isArray(row.tickets) ? (row.tickets as Order["tickets"]) : [],
    createdAt: row.created_at,
  };
}

export function scanToRow(scan: ScanRecord): ScanRow {
  return {
    id: scan.id,
    ticket_id: scan.ticketId,
    ticket_code: scan.ticketCode,
    event_id: scan.eventId,
    event_title: scan.eventTitle,
    scanner_id: scan.scannerId,
    scanner_name: scan.scannerName,
    door: scan.door,
    result: scan.result,
    timestamp: scan.timestamp,
    buyer_name: scan.buyerName,
    ticket_type_name: scan.ticketTypeName,
    offline_sync: Boolean(scan.offlineSync),
  };
}

export function scanFromRow(row: ScanRow): ScanRecord {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    ticketCode: row.ticket_code,
    eventId: row.event_id,
    eventTitle: row.event_title,
    scannerId: row.scanner_id,
    scannerName: row.scanner_name,
    door: row.door,
    result: row.result as ScanRecord["result"],
    timestamp: row.timestamp,
    buyerName: row.buyer_name,
    ticketTypeName: row.ticket_type_name,
    offlineSync: row.offline_sync,
  };
}
