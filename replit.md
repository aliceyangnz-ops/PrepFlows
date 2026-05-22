# PrepFlows

A hospitality operations platform for back-of-house staff (iOS, Android, and web). Manages daily events/functions, service timetables, rosters, prep lists, and work plans. Designed for plain English readability, suitable for ESL staff. Built with Expo + React Native.

## Run & Operate

- `pnpm --filter @workspace/kitchen-app run dev` — run the Expo app (web preview on port $PORT)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, expo-router ~6.0, React Native
- State: React Context + AsyncStorage (all data persisted locally)
- UI: Inter font, @expo/vector-icons (Feather + Ionicons), expo-haptics
- QR: react-native-qrcode-svg + react-native-svg

## Where things live

- `artifacts/kitchen-app/` — the main Expo mobile app
- `artifacts/kitchen-app/app/(tabs)/` — tab screens: Today, Functions, Prep, Roster
- `artifacts/kitchen-app/app/function/` — function detail + add screens
- `artifacts/kitchen-app/app/staff/` — staff add/edit screen (`[id].tsx`, id="new" for adding)
- `artifacts/kitchen-app/app/brief/` — casual staff QR brief screen (`[id].tsx`)
- `artifacts/kitchen-app/app/prep-print/` — combined print/share document
- `artifacts/kitchen-app/context/KitchenContext.tsx` — **source of truth**: data model, AsyncStorage persistence, all CRUD operations

## Architecture decisions

- All data lives in KitchenContext and persists to AsyncStorage. No backend required for core functionality.
- Role-based access: `getAccessLevel()` derives manager/team_leader/staff from role, overridable per person.
- QR codes encode `/brief/[functionId]` URLs — casual staff scan to see their team, leader, and contact info without logging in.
- Staff list is now fully user-managed (add/edit/remove via Roster → Add or the staff edit screen).
- Sample data (`SAMPLE_STAFF`, `SAMPLE_FUNCTIONS`, `SAMPLE_PREP`) is loaded only if no stored data exists — accessible via Settings → Load Sample Data at any time.

## Product

- **Today screen**: Manager quick-view of all functions, dietary alerts, active timeline items
- **Functions tab**: Event list → detail view with run sheet, dietary, menu, QR code, prep progress
- **Function add**: Smart Import (paste email/text, regex extracts key fields) + Manual Entry tabs
- **Function detail edit**: Role-gated — managers edit menu, team leaders edit times/dietary, staff read-only
- **Prep tab**: Prep list by team and event, progress tracking, print/share
- **Roster tab**: Staff directory, shift timelines, "This is me" identity selection, sick calls, Add Staff, Settings
- **Staff add/edit**: Full form — name, number, phone, role, shift, section, team lead toggle, access level override
- **Casual Staff Brief**: QR code on function detail → clean light-background page showing team, leader + phone, dietary summary

## Branding

- App name: **PrepFlows**
- Bundle ID / Android package: `com.prepflows.app`
- URL scheme: `prepflows://`
- Primary accent: `#EAB308` (yellow)
- Background: `#0D1117`, card: `#161B22`, accent green: `#22C55E`

## Storage keys

- `@kitchen_functions_v3` — functions array
- `@kitchen_prep_v4` — prep items array
- `@kitchen_staff_v1` — staff array
- `@kitchen_sick_v1` — sick staff ID array
- `@kitchen_current_staff` — logged-in staff ID
- `@kitchen_notifs_enabled` — notifications flag
- `@kitchen_broadcast` / `@kitchen_dismissed_broadcast` — broadcast messages

## User preferences

- Plain English language throughout, no jargon that would confuse ESL staff
- Dark theme (`#0D1117` bg, `#161B22` card, `#EAB308` primary yellow, `#22C55E` accent green)
- Kitchen terminology: "function" not "event", "covers" not "customers", course names in proper French
- All screens must work on phone — large tap targets, clear hierarchy

## Gotchas

- `updateFunction` in context excludes `id` and `timeline` from partial updates — timeline items are updated via `toggleTimelineItem` only
- `MANAGER_ROLES` is still exported for backward compat; prefer `getAccessLevel()` for new permission checks
- On web, QR code brief URL uses `window.location.origin`; on native it uses `prepflows://brief/[id]`
- Staff `functionIds` must be manually maintained — adding staff via the form sets `functionIds: []`; assign them to functions via the function detail screen's teamIds (not yet in UI, requires direct context update)
- TEAM_COLORS in brief/today.tsx and brief/[id].tsx keep semantic section colours (Hot Kitchen = #F97316 red-orange, etc.) — these are team identity colours, not brand colours
