import type { Order, Ticket } from '@/lib/types';

// Client-side in-memory store (replaces Supabase in Etape 2 backend)
let _orders: Order[] = [];

export function addOrder(order: Order): void {
  _orders = [order, ..._orders];
}

export function getAllOrders(): Order[] {
  return _orders;
}

export function getOrderById(id: string): Order | undefined {
  return _orders.find(o => o.id === id);
}

export function getOrdersByEvent(eventId: string): Order[] {
  return _orders.filter(o => o.eventId === eventId);
}

export function getTotalRevenue(): number {
  return _orders.filter(o => o.paymentStatus === 'completed').reduce((s, o) => s + o.totalAmount, 0);
}

export function getTotalTicketsSold(): number {
  return _orders.filter(o => o.paymentStatus === 'completed').reduce((s, o) => s + o.ticketCount, 0);
}

export function getRevenueByPaymentMethod(): { mtn: number; airtel: number; cash: number } {
  return _orders.filter(o => o.paymentStatus === 'completed').reduce(
    (acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.totalAmount;
      return acc;
    },
    { mtn: 0, airtel: 0, cash: 0 }
  );
}
