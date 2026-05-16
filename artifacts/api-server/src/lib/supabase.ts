import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Returns true when both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
 * Use this guard before calling any Supabase operation.
 */
export const isSupabaseConfigured = (): boolean =>
  supabaseUrl.length > 0 && supabaseServiceKey.length > 0;

/**
 * Server-side Supabase client using the service role key.
 * Null when Supabase credentials are not yet configured.
 *
 * NEVER expose this client or its key to the frontend.
 */
export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;
