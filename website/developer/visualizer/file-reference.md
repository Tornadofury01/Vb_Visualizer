---
sidebar_position: 2
---

# File reference

Every file that makes up the visualizer shell, under `src/`.

| File | Purpose | Exports / key values |
| --- | --- | --- |
| `app/page.tsx` | Home route. Redirects to the visualizer. | `redirect('/visualizer')` |
| `app/visualizer/page.tsx` | The `/visualizer` route. Server component. | Renders `<CourtSceneClient />` |
| `components/court/CourtSceneClient.tsx` | Client boundary. Loads the scene browser-only. | `dynamic(() => import('./CourtScene'), { ssr: false })` with a `Loading court…` fallback |
| `components/court/CourtScene.tsx` | The 3D viewport: `<Canvas>`, lights, controls. Only file that touches Three.js. | `ambientLight`, `directionalLight`, `<OrbitControls enablePan={false}>`, `<CourtModel />` |
| `components/court/CourtScene.module.css` | Full-viewport wrapper for the canvas. | `.viewport { width: 100%; height: 100vh; touch-action: none }` |
| `components/court/CourtModel.tsx` | **Swap seam** for the court's visuals. Renders the placeholder today. | `CourtModelProps { src?: string }` |
| `components/court/PlaceholderCourt.tsx` | Temporary court: a plain box mesh at the origin. | `boxGeometry` sized to `PLACEHOLDER_COURT_SIZE` |
| `lib/court/scene-config.ts` | Shared scene constants (1 unit = 1 m). | `PLACEHOLDER_COURT_SIZE = [18, 1, 9]`, `CAMERA_START_POSITION = [20, 16, 24]`, `CAMERA_FOV = 50`, `MIN_ZOOM_DISTANCE = 8`, `MAX_ZOOM_DISTANCE = 80` |

See [Architecture](./architecture.md) for how these connect.
