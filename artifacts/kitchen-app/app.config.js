// Dynamic Expo config — extends app.json and injects server-side env vars
// into the app bundle via Constants.expoConfig.extra.
//
// SUPABASE_URL and SUPABASE_ANON_KEY are read from Replit Secrets at dev/build
// time and are never hardcoded here.  The anon key is intentionally public
// (Supabase's security model relies on Row Level Security, not key secrecy).
// The service role key is only used server-side and never exposed here.

export default ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra ?? {}),
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  },
});
