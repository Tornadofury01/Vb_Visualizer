---
sidebar_position: 3
---

# Decisions

Short records of choices that shape the codebase, so they don't get re-argued.
Each is **Context** (the situation) → **Decision** (what we picked) → **Why**.
Revisit one only if its context changes.

## 1. Next.js 16 (App Router) as the app shell

- **Context:** need a React framework with routing and SSR that can grow a
  backend later.
- **Decision:** Next.js 16 with the App Router and TypeScript.
- **Why:** one framework for UI, routing, and API routes; easy deploy. Note it
  ships React 19 and has breaking changes from older Next — check
  `node_modules/next/dist/docs/` and `AGENTS.md`.

## 2. CSS Modules, not Tailwind

- **Context:** the scaffold offered Tailwind by default.
- **Decision:** plain CSS Modules (`*.module.css`).
- **Why:** scoped class names with zero extra tooling, and easier to maintain as
  the UI grows. Global CSS is kept minimal.

## 3. `three` + React Three Fiber + drei for 3D

- **Context:** the scene (court, players, ball, paths) is essentially structured
  data that should render declaratively.
- **Decision:** `three`, `@react-three/fiber` v9, `@react-three/drei`.
- **Why:** R3F expresses the scene as React components; drei supplies
  `OrbitControls`, camera rigs, and helpers so we don't rebuild them.

## 4. Client-only canvas via `next/dynamic` with `ssr: false`

- **Context:** WebGL needs `window`/`document` and can't render on the server.
- **Decision:** load `CourtScene` through `next/dynamic` with `ssr: false`,
  wrapped in the `CourtSceneClient` Client Component.
- **Why:** avoids SSR crashes. Next 16 only allows `ssr: false` inside a Client
  Component, which is why the extra wrapper exists.

## 5. `CourtModel` as the single court-asset swap seam

- **Context:** the real court art (model or texture) comes in a later ticket.
- **Decision:** one component, `CourtModel`, renders the court; it shows
  `PlaceholderCourt` now and takes an optional `src`.
- **Why:** when the asset lands, only `CourtModel` changes — the page, canvas,
  camera, and controls stay untouched.
