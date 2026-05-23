// Dynamic Expo config — extends app.json and injects server-side env vars
// into the app bundle via Constants.expoConfig.extra.
//
// Reads EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY first,
// then falls back to legacy SUPABASE_URL / SUPABASE_ANON_KEY names.
// The anon key is intentionally public — Supabase security relies on RLS,
// not key secrecy. The service role key is only used server-side.

export default ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    supabaseUrl: (
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      process.env.SUPABASE_URL ??
      ""
    ).replace(/\/$/, ""),
    supabaseAnonKey:
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      "",
  },
});
