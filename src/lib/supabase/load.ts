"use client";

import { setEvents } from "@/lib/store/events";
import { setOrders } from "@/lib/store/orders";
import { setScans } from "@/lib/store/scans";
import { supabase } from "./client";
import {
  eventFromRow,
  orderFromRow,
  scanFromRow,
  ticketTypeFromRow,
  type EventRow,
  type OrderRow,
  type ScanRow,
  type TicketTypeRow,
} from "./mappers";

export async function loadAllFromSupabase(): Promise<boolean> {
  if (!supabase) return false;

  const [eventsResult, typesResult, ordersResult, scansResult] = await Promise.all([
    supabase.from("events").select("*").order("title"),
    supabase.from("ticket_types").select("*"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("scans").select("*").order("timestamp", { ascending: false }).limit(500),
  ]);

  for (const result of [eventsResult, typesResult, ordersResult, scansResult]) {
    if (result.error) console.error("[Supabase] load failed:", result.error.message);
  }

  const eventRows = (eventsResult.data ?? []) as EventRow[];
  const typeRows = (typesResult.data ?? []) as TicketTypeRow[];

  setEvents(
    eventRows.map((row) =>
      eventFromRow(
        row,
        typeRows
          .filter((type) => type.event_id === row.id)
          .map(ticketTypeFromRow)
      )
    )
  );

  if (ordersResult.data) {
    setOrders((ordersResult.data as OrderRow[]).map(orderFromRow));
  }

  if (scansResult.data) {
    setScans((scansResult.data as ScanRow[]).map(scanFromRow));
  }

  return true;
}
