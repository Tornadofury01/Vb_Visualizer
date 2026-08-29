# VB Visualizer

Backend for volleyball play authoring. No 3D editor, court renderer, or film UI yet.

## What is included

- Email/password auth (httpOnly session cookie)
- Teams, members, and team colors (offense vs defense)
- Plays list and play CRUD
- Scenes with court/camera flags (zones, antennas, attack line, follow-player camera)
- Scene players (role, zone 1–6, slot, action mode)
- Player / ball / drawing paths, jump points, keyframes
- Film analysis jobs (queued for a later CV service)
- `services/` business logic, separate from App Router handlers
- `supabase/migrations/` Postgres schema + RLS to apply when you connect Supabase

Local data lives in `data/local-store.json` (`src/data/store.ts`). Swap that module for Supabase later; keep the services.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `AUTH_SECRET` in `.env.local`.

## Auth and plays

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"coach@example.com\",\"password\":\"password1\",\"displayName\":\"Coach\"}"

curl -b cookies.txt http://localhost:3000/api/teams
curl -b cookies.txt -X POST http://localhost:3000/api/plays \
  -H "Content-Type: application/json" \
  -d "{\"teamId\":\"TEAM_ID\",\"title\":\"Slide vs. commit block\"}"
curl -b cookies.txt http://localhost:3000/api/plays
```

Register also creates a personal team so you can create plays immediately.

## Later: Supabase

1. Create a project and put URL + anon key in `.env.local`.
2. Run `supabase/migrations/20240829120000_init.sql`.
3. Replace cookie auth with Supabase Auth and replace `src/data/store.ts` with a Supabase repository.
