# Threat Model

## Project Overview

KitchenCommand is an Expo + React Native kitchen operations app for catering staff on iOS, Android, and web. Its core production surface is the `artifacts/kitchen-app` client, which stores roster, function, prep, broadcast, and current-staff state locally in AsyncStorage with no backend required for normal operation. A small Express API exists in `artifacts/api-server`, but the current reachable server surface is limited to a health endpoint.

Production assumptions for this scan:

- TLS is provided by the platform in production.
- `NODE_ENV` is `production` in production.
- `artifacts/mockup-sandbox` is dev-only and out of scope unless production reachability is demonstrated.

## Assets

- **Kitchen operational data** — function names, rooms, timelines, menus, prep lists, and service times. Tampering can disrupt live service and misdirect staff.
- **Staff data** — staff names, staff numbers, phone numbers, role labels, team assignments, shift times, and optional PINs. This is personal data and also drives in-app privilege decisions.
- **Privilege state** — the current selected staff member and any access-level override. Compromise lets a user act as manager, team leader, or another staff member.
- **Safety-sensitive dietary data** — allergy and dietary counts/notes shown across the app and brief flows. Incorrect changes can create operational and health risk.
- **Broadcast / absence state** — sick-call flags and staff-wide messages. Tampering can mislead the team during service.

## Trust Boundaries

- **Untrusted user/device to local app state** — all users interact through an untrusted client, but the application currently trusts locally selected identity and locally stored role data.
- **Client route boundary** — navigation between general screens, edit screens, and brief/share screens is a security boundary because sensitive data and mutating actions are exposed through routes.
- **Local persistence boundary** — AsyncStorage is loaded into trusted application state on startup. Any data in storage is treated as authoritative.
- **Public/share boundary** — QR and share flows expose selected information outside the main app workflow and may be accessed without an authenticated session. In the current architecture, these routes read only the same browser/device profile’s local data or shipped sample data; absent a shared backend, they do not by themselves create a cross-device disclosure channel.
- **Client to server boundary** — the Expo/web client may call the small Express API, but current server-side trust decisions are minimal because the API surface is minimal.

## Scan Anchors

- **Production entry points**: `artifacts/kitchen-app/app/_layout.tsx`, `artifacts/kitchen-app/server/serve.js`, `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`
- **Highest-risk code areas**: `artifacts/kitchen-app/context/KitchenContext.tsx`, `artifacts/kitchen-app/app/(tabs)/roster.tsx`, `artifacts/kitchen-app/app/(tabs)/prep.tsx`, `artifacts/kitchen-app/app/staff/[id].tsx`, `artifacts/kitchen-app/app/function/[id].tsx`, `artifacts/kitchen-app/app/function/add.tsx`, `artifacts/kitchen-app/app/brief/[id].tsx`
- **Public vs authenticated/admin surfaces**: there is no real authentication boundary today; most screens are reachable without a trusted session, and manager/team-leader actions are derived from locally selected staff plus optional access overrides
- **Usually dev-only**: `artifacts/mockup-sandbox/**`, `artifacts/kitchen-app/scripts/build.js`, build outputs under `dist/` and `.expo/`

## Threat Categories

### Spoofing

The app lets a user choose which staff member they are and then trusts that selection across the product. Identity proof is currently a local PIN or the last four digits of a stored phone number, and both identity state and roster data live in mutable client storage. The system must ensure that only the real staff member can assume that identity, and that privileged roles such as manager or team leader cannot be self-assigned by choosing a different staff record, guessing weak local credentials, or editing local persistence.

### Tampering

Function details, prep state, run-sheet progress, roster entries, broadcasts, and sick-call flags affect real kitchen operations. These records must not be changeable by users who are only meant to view them. Sensitive business and safety data must only be modifiable by authorized roles, and those checks must be enforced at a trusted boundary rather than by screen visibility alone. In particular, operational toggles such as prep completion and service-task completion must not be writable by unsigned users or unrelated staff.

### Information Disclosure

The app stores staff contact details, optional PINs, and dietary/allergen information and exposes some of it through brief/share flows. The system must ensure that public or semi-public routes only reveal the minimum intended data and do not rely on obscurity of route IDs or local UI assumptions. Under the current no-backend design, same-profile route exposure is lower priority than spoofing and tampering, and bundled sample data alone should not be treated as a production disclosure finding.

### Denial of Service

Because the app uses local state as the source of truth, destructive local actions such as deleting staff or clearing all data can immediately prevent use on that device. High-impact local actions must be limited to authorized roles and intentionally guarded.

### Elevation of Privilege

Privilege is derived from mutable client-side data (`currentStaffId`, role, and access-level override) and currently controls access to edit functions, roster management, broadcast capabilities, and destructive reset paths. The system must enforce privilege server-side or through another trusted mechanism; client-side route access, AsyncStorage, and local role data alone are not sufficient security controls for privileged actions.
