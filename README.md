# CRM Hub — Teams-connected CRM · Dialer · Video

A customizable Microsoft-Teams-like workspace: **CRM + click-to-dial + SMS + video rooms**, all joined into one per-contact timeline, with **Microsoft Teams login and messaging** on top.

## What's inside

| Area | Status now | Goes live when you add |
|---|---|---|
| CRM (contacts, deals, activity timeline) | ✅ Local SQLite | Supabase/Postgres in prod |
| Microsoft login (Entra/OAuth) | Dev login | `MICROSOFT_CLIENT_ID` + secret |
| Teams chat (Graph API) | Mock (log only) | M365 business tenant + scopes |
| Click-to-dial / SMS (Twilio) | Mock (log only) | `TWILIO_*` keys |
| Video rooms (LiveKit) | Mock join page | `LIVEKIT_*` keys |

Everything runs in **mock mode** until credentials are added, so you can build/test 100% locally first.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev        # → http://localhost:3000
```

Open the app → use **Dev login** (any email) → add a contact → Call / Teams / SMS / Video room.
Each action is written to that contact's timeline.

## Enabling the real integrations

### 1. Microsoft Teams login + messaging
Requires a **Microsoft 365 Business/Enterprise** tenant (personal accounts don't get Teams API scopes).
1. `portal.azure.com` → Microsoft Entra ID → App registrations → New registration
2. Redirect URI: `http://localhost:3000/api/auth/microsoft/callback`
3. API permissions (delegate): `User.Read`, `Chat.ReadWrite`, `Presence.Read`, `OnlineMeetings.ReadWrite`
4. Set in `.env.local`: `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`
5. After signing in, add a contact with their **Microsoft (Teams) email** → "Teams" button sends a real chat.

> The scaffold stores access tokens in-memory (dev only). Before production, persist them encrypted server-side (e.g., in the DB) — see `src/lib/services/microsoft.ts`.

### 2. Twilio dialer
1. `console.twilio.com` → Buy/set a number (has voice + SMS).
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.
3. Expose `/api/twilio/webhook` publicly (tunnel/HTTPS) if you want call-status updates.

### 3. LiveKit video
1. `cloud.livekit.io` → create a project.
2. Set `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
3. Wire the room page (`src/app/video/[room]/page.tsx`) to `livekit-client` in the browser.

## Production notes
- Replace the SQLite helpers in `src/lib/db/index.ts` with Supabase/Postgres — the rest of the app only imports `get/all/run`.
- Use a real secret manager for `AUTH_SECRET` and provider secrets.
- Enable code+PKCE for the Entra flow and store tokens encrypted.