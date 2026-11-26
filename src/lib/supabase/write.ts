"use client";

import type { EventItem, Order, ScanRecord } from "@/lib/types";
import { supabase } from "./client";
import { eventToRow, orderToRow, scanToRow, ticketTypeToRow } from "./mappers";

export async function persistEvent(event: EventItem): Promise<boolean> {
  if (!supabase) return false;

  const eventResult = await supabase.from("events").upsert(eventToRow(event));
  if (eventResult.error) {
    console.error("[Supabase] event insert failed:", eventResult.error.message);
    return false;
  }

  const ticketRows = event.ticketTypes.map((type) => ticketTypeToRow(type, event.id));
  if (ticketRows.length > 0) {
    const typeResult = await supabase.from("ticket_types").upsert(ticketRows);
    if (typeResult.error) {
      console.error("[Supabase] ticket types insert failed:", typeResult.error.message);
      return false;
    }
  }

  return true;
}

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
