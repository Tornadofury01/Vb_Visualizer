# VB Visualizer docs

The documentation site, built with [Docusaurus](https://docusaurus.io/). It holds
two guides:

- **Developer** (`developer/`) — how to run and build the app
- **User** (`user-docs/`) — the consumer guide (early)

## Local development

```bash
npm install
npm start        # serves http://localhost:3001
```

Live-reloads on edit. The app itself runs on port 3000; this site uses 3001.

## Build

```bash
npm run build        # static site into build/; fails on broken links
npm run typecheck
npm run serve         # preview the build
```

If `npm install` fails on Node peer/engine checks, retry with
`npm install --legacy-peer-deps`.
