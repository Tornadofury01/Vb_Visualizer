"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary that loads {@link CourtScene} in the browser only. Three.js
 * needs WebGL and `window`/`document`, so it must be excluded from SSR
 * prerendering (`ssr: false`), which is only allowed inside a Client Component.
 */
const CourtScene = dynamic(() => import("./CourtScene"), {
  ssr: false,
  loading: () => <div style={{ padding: 24 }}>Loading court…</div>,
});

export function CourtSceneClient() {
  return <CourtScene />;
}
