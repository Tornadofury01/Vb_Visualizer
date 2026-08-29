---
sidebar_position: 2
---

# Getting started

Run the visualizer on your machine. Takes about five minutes.

## Overview

VB Visualizer is a [Next.js](https://nextjs.org) app that renders a 3D volleyball
court with [React Three Fiber](https://r3f.docs.pmnd.rs). When it's running you
get a court you can orbit and zoom in the browser.

## Before you begin

- **Node.js 20.9+** (22 LTS recommended) and npm
- **git**
- A browser with **WebGL** (any current Chrome, Firefox, Safari, or Edge)

## Install

```bash
git clone https://github.com/Tornadofury01/Vb_Visualizer.git
cd Vb_Visualizer
npm install
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`. It redirects to `/visualizer`, where you'll see the
placeholder court.

- **Drag** — orbit the camera
- **Scroll / pinch** — zoom

## Verify

```bash
npm run build   # production build + type check
npm run lint    # eslint
```

Both should finish with no errors.

## Good to know

- The repo's root `AGENTS.md` and the Next.js docs bundled at
  `node_modules/next/dist/docs/` are the source of truth for this Next version —
  it has breaking changes from older releases.
- The docs site you're reading lives in `website/` and is separate from the app.

## Next steps

- [Architecture](./visualizer/architecture.md) — how the 3D scene is wired
- [Decisions](./visualizer/decisions.md) — why the stack looks the way it does
