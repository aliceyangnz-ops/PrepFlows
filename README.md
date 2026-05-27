PrepFlows — Production Documentation
AI-powered Hospitality Operations Platform

PrepFlows is a unified operational system built for the hospitality industry, including restaurants, hotels, and professional kitchens.

It replaces fragmented tools such as spreadsheets and manual workflows with an AI-driven platform that automates planning, scheduling, and kitchen execution.

Overview

PrepFlows consolidates hospitality operations into a single intelligent system.

It enables teams to:

Automate prep list generation
Generate AI-driven workflows from menus and recipes
Manage schedules and kitchen timetables
Track inventory and operational processes
Operate seamlessly across mobile and web platforms
Key Features
Smart Workflow Engine

Automatically generates structured kitchen workflows based on menus, recipes, and operational logic.

Prep List Automation

Transforms structured or unstructured inputs into production-ready prep lists for kitchen execution.

Menu Intelligence System

Extracts, normalizes, and interprets culinary terminology across multiple languages and formats.

Operational Dashboard

Provides real-time visibility into kitchen operations for chefs and managers.

Multi-platform Access
iOS (Expo / EAS)
Android (Expo / EAS)
Web dashboard (Vite + React)

Tech Stack
Frontend
React Native (Expo SDK 54, expo-router)
React 19 (Web)
Vite
Tailwind CSS v4
Backend
Node.js (TypeScript)
Express 5
Drizzle ORM
Zod validation
Pino logging

Database
Supabase (PostgreSQL)
Drizzle ORM abstraction layer
Authentication
Supabase Auth
Payments
Stripe (Subscriptions + Webhooks)
AI Layer
OpenAI GPT-4o
Smart Import system with rule-based fallback
Infrastructure
pnpm workspaces (monorepo)
GitHub Actions CI/CD
EAS (Expo Application Services)
CI/CD Architecture
System Overview

GitHub Push (main / dev / PR)
            │
            ├──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
            │                              │                              │
            ▼                              ▼                              ▼

      Lint CI                      API CI                        Mobile CI
      lint.yml                    deploy-api.yml                eas-build.yml

            │                              │                              │
            ▼                              ▼                              ▼

 Code Quality Checks          Monorepo Build               Expo EAS Build
 Prettier + ESLint            API Typecheck                iOS / Android Build
 Type Validation              Backend Build                TestFlight / Play Store

CI Pipelines
Lint CI (lint.yml)

Responsible for code quality enforcement.

Prettier formatting checks
ESLint validation
Type safety verification
API CI (deploy-api.yml)

Backend validation pipeline.

Monorepo build (pnpm -r build)
API type checking
Backend build verification
Replit deployment compatibility checks
Mobile CI (eas-build.yml)

Mobile application build pipeline.

Expo authentication via EAS
iOS build (TestFlight ready)
Android build support
Secure token-based authentication
Local Development
Prerequisites
Node.js 24 or higher
pnpm 9 or higher
Supabase project (free tier supported)
Setup
git clone https://github.com/your-org/prepflows.git
cd prepflows

pnpm install

cp .env.example .env
# Configure environment variables

pnpm --filter @workspace/db run migrate

pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/prepflows-website run dev
pnpm --filter @workspace/kitchen-app run dev
Mobile Development
npm install -g expo-cli

cd artifacts/kitchen-app
npx expo start
Controls
i → iOS simulator
a → Android emulator
w → Web preview
Type Checking
pnpm run typecheck
pnpm run typecheck:libs

pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/kitchen-app run typecheck
Environment Variables
Variable	Description
SUPABASE_URL	Supabase project URL
SUPABASE_ANON_KEY	Public Supabase key
SUPABASE_SERVICE_ROLE_KEY	Server-side admin key
SUPABASE_POOLER_URL	DB connection pooler
SUPABASE_DB_URL	Direct DB connection
SESSION_SECRET	Session signing key
STRIPE_SECRET_KEY	Stripe backend key
STRIPE_WEBHOOK_SECRET	Stripe webhook verification
VITE_STRIPE_PUBLISHABLE_KEY	Stripe frontend key
OPENAI_API_KEY	AI features (optional)
EXPO_TOKEN	EAS CI/CD token
Deployment
API Server (Replit)

Automatically deployed on push to main branch via Replit GitHub integration.

Requires:

Supabase credentials
Stripe keys
Session secret
OpenAI key (optional)
Web Application (Vercel)
cd artifacts/prepflows-website
vercel --prod

Required:

VITE_STRIPE_PUBLISHABLE_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
Mobile Application (EAS)
cd artifacts/kitchen-app

eas build --profile development --platform ios
eas build --profile preview --platform all
eas build --profile production --platform all
First-time setup
Configure EXPO_PUBLIC_SUPABASE_ANON_KEY in EAS secrets
Set App Store Connect App ID in eas.json
Add Google Play service account credentials
Submission
eas submit --platform ios --latest
eas submit --platform android --latest
Database
PostgreSQL via Supabase
Drizzle ORM abstraction layer
Migration system in @workspace/db
pnpm --filter @workspace/db run migrate
CI/CD Summary
Workflow	Trigger	Purpose
lint.yml	push / PR	Code quality checks
deploy-api.yml	backend changes	API validation + build
eas-build.yml	mobile changes	Mobile build pipeline

Required secrets:

EXPO_TOKEN
DATABASE_URL
Supabase keys
Key Features Mapping
Feature	Location
Dashboard	kitchen-app/app/(tabs)/index.tsx
Smart Import	function/add.tsx + api-server/routes/aiParse.ts
Prep Lists	prep.tsx
Roster System	roster.tsx
QR Briefing	brief/[id].tsx
Stripe Billing	api-server/routes/stripe.ts
Realtime Sync	supabase-sync.ts
Branding
Product Name: PrepFlows
URL Scheme: prepflows://
Primary Color: #EAB308
Background: #0D1117
Card: #161B22
Accent: #22C55E
License

Private — all rights reserved
