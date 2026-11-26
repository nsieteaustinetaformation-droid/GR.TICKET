"use client";

import type { Order, ScanRecord } from "@/lib/types";
import { MOCK_EVENTS } from "@/lib/store/events";
import { supabase } from "./client";
import { eventToRow, orderToRow, scanToRow, ticketTypeToRow } from "./mappers";

export async function persistOrder(order: Order): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("orders").upsert(orderToRow(order));
  if (error) console.error("[Supabase] order insert failed:", error.message);
}

export async function persistScan(scan: ScanRecord): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("scans").upsert(scanToRow(scan));
  if (error) console.error("[Supabase] scan insert failed:", error.message);
}

export async function seedEventsIfEmpty(): Promise<void> {
  if (!supabase) return;

  const { count, error } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[Supabase] events count failed:", error.message);
    return;
  }

  if (count && count > 0) return;

  const eventRows = MOCK_EVENTS.map(eventToRow);
  const ticketRows = MOCK_EVENTS.flatMap((event) =>
    event.ticketTypes.map((type) => ticketTypeToRow(type, event.id))
  );

  const eventResult = await supabase.from("events").upsert(eventRows);
  if (eventResult.error) {
    console.error("[Supabase] events seed failed:", eventResult.error.message);
    return;
  }

  const typeResult = await supabase.from("ticket_types").upsert(ticketRows);
  if (typeResult.error) {
    console.error("[Supabase] ticket types seed failed:", typeResult.error.message);
  }
}
