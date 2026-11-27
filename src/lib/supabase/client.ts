"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const placeholderUrl = !url || url.includes("votre-projet");
const placeholderKey = !anonKey || anonKey.endsWith("...");

export const isSupabaseConfigured = !placeholderUrl && !placeholderKey;

/**
 * Client navigateur basé sur les cookies (et non sur le localStorage) :
 * le proxy et les layouts serveur peuvent vérifier la même session.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createBrowserClient(url as string, anonKey as string)
  : null;
