import { GRID_STEP, ZONE_CENTERS } from "@/scene/court";

export type SnapMode = "off" | "grid" | "zone";

function clampCourt(x: number, z: number) {
  return {
    x: Math.max(-9, Math.min(9, x)),
    z: Math.max(-4.5, Math.min(4.5, z)),
  };
}

function zoneTargets() {
  return Object.values(ZONE_CENTERS).flatMap((c) => [c, { x: -c.x, z: -c.z }]);
}

export function snapPoint(x: number, z: number, mode: SnapMode) {
  const clamped = clampCourt(x, z);
  if (mode === "off") return clamped;
  if (mode === "grid") {
    return {
      x: Math.round(clamped.x / GRID_STEP) * GRID_STEP,
      z: Math.round(clamped.z / GRID_STEP) * GRID_STEP,
    };
  }
  let best = zoneTargets()[0];
  let dist = Infinity;
  for (const target of zoneTargets()) {
    const d = (clamped.x - target.x) ** 2 + (clamped.z - target.z) ** 2;
    if (d < dist) {
      dist = d;
      best = target;
    }
  }
  return { x: best.x, z: best.z };
}
