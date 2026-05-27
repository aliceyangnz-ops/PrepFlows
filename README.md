# PrepFlows

Hospitality operations platform for back-of-house kitchen teams. Manages daily functions, service timetables, rosters, prep lists, and work plans. Designed for plain English readability, suitable for restaurants, hotels, and professional kitchens.

---

## Architecture

```
prepflows/
├── artifacts/
│   ├── kitchen-app/          # Expo React Native app (iOS, Android, web)
│   ├── api-server/           # Express API — AI parse, Stripe, PMS sync
│   ├── prepflows-website/    # Vite/React marketing + SaaS site
│   └── mockup-sandbox/       # UI prototype playground (dev only)
├── lib/
│   ├── db/                   # Drizzle ORM schema + migrations
│   ├── api-spec/             # OpenAPI spec (source of truth)
│   ├── api-client-react/     # Generated React Query hooks (Orval)
│   ├── api-zod/              # Generated Zod schemas
│   └── connector-core/       # PMS integration logic (Opera, iVvy, Delphi…)
└── scripts/                  # Utility scripts (seeding, Stripe)
```

**Tech Stack:**

- **Mobile**: Expo SDK 54, expo-router, React Native 0.81
- **Web**: Vite + React 19, Tailwind CSS v4
- **API**: Express 5, Drizzle ORM, Pino, Zod
- **Database**: Supabase (PostgreSQL) via Drizzle
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o (Smart Import — optional, falls back to rule-based)
- **Monorepo**: pnpm workspaces

---

## Local Development

### Prerequisites

- Node.js 24+
- pnpm 9+ (`npm install -g pnpm`)
- A Supabase project (free tier works)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/prepflows.git
cd prepflows

# 2. Install dependencies
pnpm install

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env with your Supabase URL, keys, Stripe keys, etc.

# 4. Run database migrations
pnpm --filter @workspace/db run migrate

# 5. Start all services
pnpm --filter @workspace/api-server run dev          # API on :8080
pnpm --filter @workspace/prepflows-website run dev   # Website on :5173
pnpm --filter @workspace/kitchen-app run dev         # Expo (web) on :8081
```

### Mobile App (iOS/Android Simulator)

```bash
# Install Expo CLI globally if needed
npm install -g expo-cli

# Start the Expo dev server
cd artifacts/kitchen-app
npx expo start

# Then press in the terminal:
#  i — open iOS simulator
#  a — open Android emulator
#  w — open web browser
```

### Type Checking

```bash
pnpm run typecheck                                              # Full workspace
pnpm run typecheck:libs                                         # Shared libraries only
pnpm --filter @workspace/kitchen-app run typecheck             # Mobile app only
pnpm --filter @workspace/api-server run typecheck              # API server only
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure the following required variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `SUPABASE_POOLER_URL` | Transaction pooler URL for API server connections |
| `SUPABASE_DB_URL` | Direct database connection URL (migrations only) |
| `EXPO_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` — injected into Expo bundle |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` — injected into Expo bundle |
| `SESSION_SECRET` | Random 32-character string for session signing |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…` or `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_…`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for the website |
| `OPENAI_API_KEY` | Optional — enables GPT-4o Smart Import; falls back to rule-based parsing |
| `EXPO_TOKEN` | EAS CLI token for CI/CD deployments |

---

## Deployment

### API Server — Replit

The API server runs on Replit with automatic redeployment on pushes to `main` via GitHub integration.

**Required secrets in Replit:**

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_POOLER_URL`, `DATABASE_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SESSION_SECRET`
- `OPENAI_API_KEY` (optional)

### Website — Vercel

Deploy the website from the `artifacts/prepflows-website` directory:

```bash
npm install -g vercel
cd artifacts/prepflows-website
vercel --prod
```

**Set environment variables in Vercel dashboard:**

- `VITE_STRIPE_PUBLISHABLE_KEY`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Mobile App — EAS Build

```bash
cd artifacts/kitchen-app

# Development build (for simulator testing)
eas build --profile development --platform ios

# Preview build (for internal testing)
eas build --profile preview --platform all

# Production build (for App Store / Play Store submission)
eas build --profile production --platform all
```

**Before your first production build:**

1. Set `EXPO_PUBLIC_SUPABASE_ANON_KEY` as an EAS secret:
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
   ```
2. Update `eas.json` → `submit.production.ios.ascAppId` with your App Store Connect App ID
3. Add `google-service-account.json` credentials for Android Play Store submission

**Submit to app stores:**

```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

### Database Migrations

Apply migrations to your Supabase instance:

```bash
pnpm --filter @workspace/db run migrate
```

Alternatively, manually execute SQL from:
- `lib/db/supabase-setup.sql`
- `artifacts/kitchen-app/supabase/migrations/`

---

## GitHub Actions

Three CI/CD workflows are included in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push / PR to main | Typecheck + format check across all packages |
| `eas-build.yml` | Push to main (app changes) | Runs EAS preview build for mobile |
| `deploy-api.yml` | Push to main (API changes) | Typechecks + builds the API server |

**Required GitHub secrets:**

- `EXPO_TOKEN` — from [expo.dev](https://expo.dev) → Account settings → Access tokens
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anonymous key
- `DATABASE_URL` — for API build verification

---

## Key Features

| Feature | Location |
|---------|----------|
| Today dashboard | `kitchen-app/app/(tabs)/index.tsx` |
| Function list & detail | `kitchen-app/app/(tabs)/index.tsx`, `app/function/[id].tsx` |
| Smart Import (paste / file / scan) | `kitchen-app/app/function/add.tsx` + `api-server/routes/aiParse.ts` |
| Prep list + print/share | `kitchen-app/app/(tabs)/prep.tsx`, `app/prep-print/` |
| Roster + sick calls | `kitchen-app/app/(tabs)/roster.tsx` |
| Casual staff QR brief | `kitchen-app/app/brief/[id].tsx` |
| PMS connector sync | `api-server/routes/connectors.ts` + `lib/connector-core/` |
| Stripe billing | `api-server/routes/stripe.ts` + `api-server/stripeService.ts` |
| Supabase realtime sync | `kitchen-app/lib/supabase-sync.ts` |

---

## Branding

- **App name**: PrepFlows
- **Bundle ID / package**: `com.prepflows.app`
- **URL scheme**: `prepflows://`
- **Primary color**: `#EAB308` (yellow)
- **Background**: `#0D1117`
- **Card background**: `#161B22`
- **Accent**: `#22C55E`

---

## License

Private — all rights reserved.
