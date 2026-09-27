/** Indoor volleyball court in meters. Origin is court center; Y is up. */

export const COURT = {
  length: 18,
  width: 9,
  attackLine: 3,
  netHeight: 2.43,
  netHalfWidth: 0.5,
  antennaHeight: 1.8,
  ballRadius: 0.105,
} as const;

export const CONTACT_GAP_SECONDS = 1.35;
export const GRID_STEP = 0.5;

export const TEAM_COLORS: Record<string, string> = {
  A: "#5aa7ff",
  B: "#ff5a4c",
};

export const COURT_STYLE = {
  floor: "#0b1c33",
  line: "#4db3ff",
  background: "#05070c",
};

export const ZONE_CENTERS: Record<number, { x: number; z: number }> = {
  1: { x: 6.5, z: 3 },
  2: { x: 3.2, z: 3 },
  3: { x: 3.2, z: 0 },
  4: { x: 3.2, z: -3 },
  5: { x: 6.5, z: -3 },
  6: { x: 6.5, z: 0 },
};

export const ACTION_STATES = [
  "ready",
  "shuffle",
  "approach",
  "jump_start",
  "jump_peak_contact",
  "landing",
  "blocking",
  "hitting",
  "setting",
  "serving",
  "passing_serve_receive",
  "defense_dig",
  "running",
] as const;
