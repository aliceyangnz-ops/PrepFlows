// Dynamic Expo config — extends app.json.
//
// Supabase credentials are loaded directly from EXPO_PUBLIC_* env vars
// by lib/supabase.ts — no injection into Constants.expoConfig.extra needed.
//
// Local dev:  set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
//             in artifacts/kitchen-app/.env (not committed)
// EAS builds: set them as EAS environment variables via:
//             eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value <url>
//             eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <key>
// CI/CD:      set them as GitHub Actions secrets

export default ({ config }) => ({
  ...config,
});
