/**
 * Supabase client for the PrepFlows app.
 *
 * Credentials are loaded from EXPO_PUBLIC_SUPABASE_URL and
 * EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.
 *
 * Local dev:  set them in artifacts/kitchen-app/.env
 * EAS builds: set them as EAS environment variables
 *             (`eas env:create --name EXPO_PUBLIC_SUPABASE_URL …`)
 * CI:         set them as GitHub Actions secrets
 *
 * The client is null when credentials are absent — all sync helpers
 * check for null and fall back to AsyncStorage-only mode gracefully.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = (
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? ""
).replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export { SUPABASE_URL, SUPABASE_ANON_KEY };

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
 * Null when EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set.
 */
export const supabase: SupabaseClient | null = buildClient();
