/**
 * Supabase client for the KitchenCommand Expo app.
 *
 * Credentials are injected at runtime via app.config.js → Constants.expoConfig.extra.
 * The client is null when credentials are not yet configured — all sync helpers
 * check for null and fall back to AsyncStorage-only mode gracefully.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const SUPABASE_URL: string = extra.supabaseUrl ?? "";
export const SUPABASE_ANON_KEY: string = extra.supabaseAnonKey ?? "";

/** Returns true when both Supabase credentials are available. */
export const isSupabaseConfigured = (): boolean =>
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

function buildClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  // On native use AsyncStorage so the auth session survives app restarts.
  // On web the default localStorage adapter works fine.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const authStorage =
    Platform.OS !== "web"
      ? require("@react-native-async-storage/async-storage").default
      : undefined;

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === "web",
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });
}

/**
 * The Supabase client instance.
 * Null when SUPABASE_URL / SUPABASE_ANON_KEY are not set.
 */
export const supabase: SupabaseClient | null = buildClient();
