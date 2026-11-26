import type { Order, Ticket, TicketType, EventItem, PaymentMethod } from '@/lib/types';

const CRB = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function randSeg(len: number): string {
  let r = '';
  for (let i = 0; i < len; i++) r += CRB[Math.floor(Math.random() * CRB.length)];
  return r;
}

export function generateTicketCode(): string {
  return 'GR-' + randSeg(5) + '-' + randSeg(5);
}

export function isValidTicketCode(code: string): boolean {
  return /^GR-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/.test(code.toUpperCase().trim());
}

function toBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

export function generateQrToken(ticketId: string, eventId: string, code: string): string {
  // Lightweight token for offline QR (without real HMAC on client)
  // Real HMAC-SHA256 is generated server-side (Etape 4 route handler)
  const payload = toBase64Utf8(JSON.stringify({ id: ticketId, ev: eventId, code, ts: Date.now() }));
  return 'GR.' + payload;
}

export function createOrderFromPurchase(params: {
  event: EventItem;
  ticketType: TicketType;
  buyerName: string;
  buyerPhone: string;
  paymentMethod: PaymentMethod;
  quantity: number;
}): Order {
  const { event, ticketType, buyerName, buyerPhone, paymentMethod, quantity } = params;

  const tickets: Ticket[] = Array.from({ length: quantity }, (_, i) => {
    const id = crypto.randomUUID();
    const code = generateTicketCode();
    return {
      id,
      code,
      qrToken: generateQrToken(id, event.id, code),
      eventId: event.id,
      eventTitle: event.title,
      eventVenue: event.venue,
      eventDate: event.date,
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name,
      price: ticketType.price,
      buyerName,
      buyerPhone,
      paymentMethod,
      status: 'valide',
      createdAt: new Date().toISOString(),
    };
  });

  return {
    id: crypto.randomUUID(),
    eventId: event.id,
    eventTitle: event.title,
    buyerName,
    buyerPhone,
    paymentMethod,
    paymentStatus: 'completed',
    totalAmount: ticketType.price * quantity,
    ticketCount: quantity,
    tickets,
    createdAt: new Date().toISOString(),
  };
}

export function buildWhatsAppMessage(ticket: Ticket): string {
  const lines = [
    '** BILLET OFFICIEL GRTK — GARANTI **',
    '',
    'Evenement: ' + ticket.eventTitle,
    'Lieu: ' + ticket.eventVenue,
    'Date: ' + ticket.eventDate,
    'Titulaire: ' + ticket.buyerName,
    'Type: ' + ticket.ticketTypeName,
    'Code: ' + ticket.code,
    'Statut: VALIDE',
    '',
    'Conservez ce message — il servira au controle d entree.',
    'Billet et QR dynamique : ' + (process.env.NEXT_PUBLIC_APP_URL ?? 'https://gr-ticket-theta.vercel.app') + '/billet/' + ticket.id,
  ];
  return lines.join('\n');
}

export function formatWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9+]/g, '');
  return 'https://wa.me/' + clean + '?text=' + encodeURIComponent(message);
}
