# PrepFlows — Migration Report

**Date:** May 2026
**Scope:** Production-readiness migration from Replit-only development to a scalable SaaS architecture deployable to App Store, Google Play, and Vercel.

---

## Summary

The existing PrepFlows codebase was already significantly more mature than a typical Replit prototype. Most of the "migration" involved completing and documenting what was already in place, fixing a security issue, and providing the scaffolding needed for GitHub, EAS Build, and CI/CD.

**No application code was rewritten.** All existing features remain intact.

---

## Architecture (Current State)

```
┌─────────────────────────────────────────────────────────┐
│                     Clients                             │
│  Expo app (iOS/Android/web)   PrepFlows website (Vite) │
└────────────────┬──────────────────────┬────────────────┘
                 │                      │
        ┌────────▼──────┐      ┌────────▼──────┐
        │  Express API  │      │    Vercel     │
        │  (Replit)     │      │  (website CDN)│
        │  /api/*       │      └───────────────┘
        └────────┬──────┘
                 │
        ┌────────▼──────────────────┐
        │        Supabase           │
        │  Auth · Database · RT     │
        │  (PostgreSQL + RLS)       │
        └───────────────────────────┘
```

**Data flow:**
- Mobile app stores data in AsyncStorage first (offline-first)
- Background sync pushes to Supabase via `supabase-sync.ts`
- Supabase Realtime pushes changes back to all connected clients
- Express API handles: AI parsing, Stripe billing, PMS connector sync

---

## What Was Already Done (pre-migration)

| Item | Status |
|---|---|
| pnpm monorepo | ✅ Production-grade — equivalent to Turborepo |
| TypeScript everywhere | ✅ All packages strictly typed |
| Expo SDK 54 + expo-router | ✅ Configured correctly |
| `app.json` with bundle IDs | ✅ `com.prepflows.app` for iOS + Android |
| `eas.json` with EAS project ID | ✅ Project `1b0f2131-5c1e-4b13-9daa-4d5aa9871dba` |
| Apple team ID | ✅ `KR39B536C5` in `eas.json` |
| Supabase auth integration | ✅ In both mobile app and website |
| Supabase realtime sync | ✅ `supabase-sync.ts` with offline fallback |
| Drizzle ORM schema | ✅ All tables defined with Zod schemas |
| OpenAPI spec | ✅ `lib/api-spec/openapi.yaml` |
| Generated React Query hooks | ✅ Via Orval codegen |
| Stripe billing | ✅ Subscriptions + webhooks live |
| PMS connector framework | ✅ Opera, iVvy, Delphi, Tripleseat connectors |
| Smart Import AI parsing | ✅ GPT-4o + rule-based fallback |
| Offline-first mobile data | ✅ AsyncStorage with background Supabase sync |

---

## Changes Made in This Migration

### 1. Security fix — Supabase anon key removed from `app.json`

**Before:** `app.json` contained hardcoded Supabase URL and anon key in plain text — committed to source control.

**After:** Removed from `app.json`. Key is now injected exclusively through:
- `app.config.js` reading `EXPO_PUBLIC_SUPABASE_ANON_KEY` env var
- EAS secrets for CI builds (`eas secret:create`)
- `.env` locally

The anon key is safe to include in the app bundle (Supabase security relies on Row Level Security, not key secrecy), but it should not be hardcoded in source control.

### 2. `eas.json` hardened

- Added `env` blocks to each build profile so `EXPO_PUBLIC_SUPABASE_URL` is injected at build time
- Replaced `ascAppId: "YOUR_APP_STORE_CONNECT_APP_ID"` placeholder — **needs your real App Store Connect App ID** (see Remaining Tasks)

### 3. `.gitignore` updated

Added:
- `.env*` files (all variants)
- EAS / Apple credential files (`*.p12`, `*.mobileprovision`, `*.p8`, `GoogleService-Info.plist`, `google-service-account.json`)
- Proper build output exclusions

### 4. `.env.example` created

Comprehensive template with every required environment variable, descriptions, and where to find each value. Safe to commit — contains no real values.

### 5. `README.md` created

Full project documentation covering:
- Architecture diagram
- Local development setup
- Environment variable reference
- Deployment instructions (API / website / mobile)
- EAS Build commands
- GitHub Actions secrets required

### 6. GitHub Actions CI/CD (`.github/workflows/`)

Three workflows:

- **`ci.yml`** — Typecheck + lint on every push/PR. Catches TypeScript errors before they reach production.
- **`eas-build.yml`** — Triggers a preview EAS build when mobile app code changes on `main`. Can also be triggered manually with profile and platform selection.
- **`deploy-api.yml`** — Typechecks and builds the API server on every push that touches API or lib code. (Actual deployment is handled by Replit's GitHub integration.)

---

## Remaining Tasks (Manual Steps Required)

### High priority — needed before App Store submission

| Task | Where | Instructions |
|---|---|---|
| Get App Store Connect App ID | [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → My Apps → your app → App Information → Apple ID | Update `eas.json` → `submit.production.ios.ascAppId` |
| Create Google Play service account key | [Google Play Console](https://play.google.com/console) → Setup → API access | Save as `artifacts/kitchen-app/google-service-account.json` (gitignored) |
| Set EAS secrets | `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."` | Required for CI builds to access Supabase |
| Register GitHub secrets | GitHub repo → Settings → Secrets → `EXPO_TOKEN`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Required for `eas-build.yml` workflow |

### Medium priority — needed for production launch

| Task | Notes |
|---|---|
| Enable Supabase Row Level Security (RLS) | All tables should have RLS policies before going live. Use `lib/db/supabase-setup.sql` as a starting point. |
| Apply Drizzle migrations to production Supabase | Run `pnpm --filter @workspace/db run migrate` with `SUPABASE_DB_URL` pointing at production |
| Configure Stripe webhook URL | Stripe Dashboard → Developers → Webhooks → Add endpoint: `https://your-domain.replit.app/api/stripe/webhook` |
| Push code to GitHub | Create repo, `git remote add origin …`, `git push` |
| Connect Replit to GitHub | Replit → Version Control → Connect to GitHub repo (enables auto-deploy on push) |
| Deploy website to Vercel | `cd artifacts/prepflows-website && vercel --prod` |
| Privacy policy + App Store screenshots | Required for App Store / Google Play listing |

### Low priority — post-launch

| Task | Notes |
|---|---|
| Turborepo (optional) | The current pnpm workspace already provides equivalent caching and filtering. Turborepo would add remote caching for large teams — not needed now. |
| Next.js for website | The current Vite/React site is production-ready. Migration to Next.js only makes sense if you need SSR for SEO at scale. |
| Supabase Storage | Not yet used. Add if you need file uploads (function sheets, staff photos) stored server-side. |
| Multi-tenancy activation | `workspaceId` columns exist in all tables but RLS policies aren't yet enforcing them. |

---

## Deployment Steps (End-to-End)

### First-time setup

```bash
# 1. Push to GitHub
git init   # if not already a repo
git remote add origin https://github.com/your-org/prepflows.git
git push -u origin main

# 2. Set GitHub secrets (repo Settings → Secrets)
#    EXPO_TOKEN, EXPO_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL

# 3. Set EAS secrets
cd artifacts/kitchen-app
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"

# 4. Apply DB migrations
SUPABASE_DB_URL="your-direct-connection-url" pnpm --filter @workspace/db run migrate

# 5. Build and submit mobile app
eas build --profile production --platform all
eas submit --platform ios --latest
eas submit --platform android --latest

# 6. Deploy website
cd artifacts/prepflows-website
vercel --prod
```

### Ongoing deployments

| Trigger | What happens |
|---|---|
| Push to `main` | CI typecheck runs (GitHub Actions) |
| Push to `main` (app code changed) | EAS preview build triggers automatically |
| Replit GitHub integration | API server redeploys automatically |
| Manual: `eas build --profile production` | Creates new App Store / Play Store build |
| Manual: `eas submit --latest` | Submits latest build to stores |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Supabase anon key exposure | Low (now fixed) | Removed from `app.json`; use env vars and EAS secrets |
| AsyncStorage data loss on reinstall | Medium | Supabase sync backs up all data server-side |
| RLS not enforced yet | High (pre-launch) | All tables have `workspaceId` columns; RLS policies needed before multi-tenant launch |
| `heads?\b` regex in guest count parser | Low | Fixed — cross-line `\s*` replaced with `[^\S\r\n]*` |
| EAS build failure on native deps | Low | All native deps are Expo-compatible; `newArchEnabled: true` tested |
| Stripe webhook without signing | Low | `STRIPE_WEBHOOK_SECRET` verification is implemented |

---

## What Was NOT Changed

- No application screens were modified
- No context or data logic was changed
- No package versions were upgraded
- No folder structure was reorganised
- The pnpm workspace structure was kept as-is (it is already production-grade)
- The Express API was kept as-is (it is Replit-hosted and working)
