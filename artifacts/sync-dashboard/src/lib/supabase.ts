/**
 * Supabase client for the Connector Sync Dashboard.
 *
 * SUPABASE_URL and SUPABASE_ANON_KEY are injected at build time by Vite via
 * the __SUPABASE_URL__ / __SUPABASE_ANON_KEY__ define constants, which are
 * read from Replit Secrets during `vite build`. They are never hardcoded.
 *
 * The anon key is intentionally public — Supabase's RLS layer is the security
 * boundary. The service role key is only used server-side and is not included
 * here.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare const __SUPABASE_URL__: string;
declare const __SUPABASE_ANON_KEY__: string;

const supabaseUrl: string =
  typeof __SUPABASE_URL__ !== "undefined" ? __SUPABASE_URL__ : "";
const supabaseAnonKey: string =
  typeof __SUPABASE_ANON_KEY__ !== "undefined" ? __SUPABASE_ANON_KEY__ : "";

export const isSupabaseConfigured = (): boolean =>
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;
