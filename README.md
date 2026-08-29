# VB Visualizer

A 3D volleyball court for drawing and reviewing plays and game scenarios.

Built with [Next.js](https://nextjs.org) (App Router) and
[React Three Fiber](https://r3f.docs.pmnd.rs). Current state: the core visualizer
shell — a placeholder court you can orbit and zoom.

## Run the app

```bash
npm install
npm run dev
```

Open <http://localhost:3000> (redirects to `/visualizer`). Drag to rotate, scroll
to zoom.

```bash
npm run build   # production build + type check
npm run lint
```

## Documentation

The docs site lives in [`website/`](./website) (Docusaurus):

```bash
cd website
npm install
npm start        # http://localhost:3001
```

- **Developer guide** — getting started, architecture, file reference, decisions
- **User guide** — consumer-facing (early)

Start with `website/developer/getting-started.md`.
