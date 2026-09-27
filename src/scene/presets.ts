import { SCENE_SCHEMA_VERSION, type ActionState, type Entity, type PlayerPosition, type Scene } from "@/types/scene";

export type FormationPresetId =
  | "5-1-r1-receive"
  | "5-1-r1-serve"
  | "6-2-r1-receive"
  | "w-receive"
  | "3-man-receive";

export const FORMATION_PRESETS: { id: FormationPresetId; label: string }[] = [
  { id: "5-1-r1-receive", label: "5-1 · Rotation 1 receive" },
  { id: "5-1-r1-serve", label: "5-1 · Rotation 1 serve" },
  { id: "6-2-r1-receive", label: "6-2 · Rotation 1 receive" },
  { id: "w-receive", label: "W serve-receive" },
  { id: "3-man-receive", label: "3-man serve-receive" },
];

function id() {
  return crypto.randomUUID();
}

type Spot = {
  teamId: string;
  jersey: string;
  position: PlayerPosition;
  x: number;
  z: number;
  action: ActionState;
};

function rosterScene(title: string, rotationLabel: string, situationTag: Scene["situationTag"], spots: Spot[]): Scene {
  const now = new Date().toISOString();
  const c1 = { id: id(), label: "contact_1_serve", order: 0 };
  const entities: Entity[] = spots.map((spot) => ({
    id: id(),
    type: "player",
    position: spot.position,
    jerseyNumber: spot.jersey,
    teamId: spot.teamId,
    keyframes: [
      {
        relativeToContactId: c1.id,
        offsetSeconds: 0,
        x: spot.x,
        y: 0,
        z: spot.z,
        actionState: spot.action,
      },
    ],
  }));
  const server = spots.find((s) => s.action === "serving");
  entities.push({
    id: id(),
    type: "ball",
    teamId: server?.teamId ?? "B",
    keyframes: [
      {
        relativeToContactId: c1.id,
        offsetSeconds: 0,
        x: server ? server.x - 0.4 : -8,
        y: 2.2,
        z: server?.z ?? 2.4,
      },
    ],
  });
  return {
    id: id(),
    schemaVersion: SCENE_SCHEMA_VERSION,
    title,
    rotationLabel,
    situationTag,
    contactEvents: [c1],
    entities,
    annotations: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createPresetScene(preset: FormationPresetId, title?: string): Scene {
  switch (preset) {
    case "5-1-r1-serve":
      return rosterScene(title ?? "5-1 Rotation 1 serve", "5-1 R1", "serve", [
        { teamId: "A", jersey: "1", position: "setter", x: 7.6, z: 3.0, action: "serving" },
        { teamId: "A", jersey: "2", position: "outside_hitter", x: 3.2, z: 3.0, action: "ready" },
        { teamId: "A", jersey: "3", position: "middle_blocker", x: 3.2, z: 0, action: "ready" },
        { teamId: "A", jersey: "4", position: "outside_hitter", x: 3.2, z: -3.0, action: "ready" },
        { teamId: "A", jersey: "5", position: "libero", x: 6.5, z: -3.0, action: "ready" },
        { teamId: "A", jersey: "8", position: "opposite", x: 6.5, z: 0, action: "ready" },
        { teamId: "B", jersey: "12", position: "outside_hitter", x: -3.2, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "13", position: "middle_blocker", x: -3.2, z: 0, action: "ready" },
        { teamId: "B", jersey: "9", position: "outside_hitter", x: -3.2, z: 3.0, action: "ready" },
        { teamId: "B", jersey: "15", position: "libero", x: -6.5, z: 3.0, action: "passing_serve_receive" },
        { teamId: "B", jersey: "7", position: "setter", x: -6.5, z: 0, action: "ready" },
        { teamId: "B", jersey: "10", position: "opposite", x: -6.5, z: -3.0, action: "passing_serve_receive" },
      ]);
    case "6-2-r1-receive":
      return rosterScene(title ?? "6-2 Rotation 1 receive", "6-2 R1", "serve_receive", [
        { teamId: "A", jersey: "2", position: "setter", x: 3.2, z: 3.0, action: "ready" },
        { teamId: "A", jersey: "3", position: "middle_blocker", x: 3.2, z: 0, action: "ready" },
        { teamId: "A", jersey: "4", position: "outside_hitter", x: 3.2, z: -3.0, action: "ready" },
        { teamId: "A", jersey: "1", position: "setter", x: 6.6, z: 3.0, action: "ready" },
        { teamId: "A", jersey: "6", position: "libero", x: 6.4, z: 0, action: "passing_serve_receive" },
        { teamId: "A", jersey: "5", position: "outside_hitter", x: 6.4, z: -2.4, action: "passing_serve_receive" },
        { teamId: "B", jersey: "12", position: "outside_hitter", x: -7.4, z: 2.6, action: "serving" },
        { teamId: "B", jersey: "13", position: "middle_blocker", x: -3.2, z: 0, action: "ready" },
        { teamId: "B", jersey: "9", position: "outside_hitter", x: -3.2, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "7", position: "setter", x: -6.5, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "10", position: "opposite", x: -3.2, z: 3.0, action: "ready" },
        { teamId: "B", jersey: "15", position: "libero", x: -6.5, z: 0, action: "ready" },
      ]);
    case "w-receive":
      return rosterScene(title ?? "W serve-receive", "W receive", "serve_receive", [
        { teamId: "A", jersey: "2", position: "outside_hitter", x: 3.4, z: 3.1, action: "ready" },
        { teamId: "A", jersey: "3", position: "middle_blocker", x: 3.3, z: 0, action: "ready" },
        { teamId: "A", jersey: "4", position: "outside_hitter", x: 3.4, z: -3.1, action: "ready" },
        { teamId: "A", jersey: "1", position: "setter", x: 7.2, z: 2.8, action: "ready" },
        { teamId: "A", jersey: "6", position: "libero", x: 6.0, z: 0, action: "passing_serve_receive" },
        { teamId: "A", jersey: "5", position: "opposite", x: 6.0, z: -2.6, action: "passing_serve_receive" },
        { teamId: "B", jersey: "12", position: "outside_hitter", x: -7.6, z: 2.4, action: "serving" },
        { teamId: "B", jersey: "13", position: "middle_blocker", x: -3.2, z: 0, action: "ready" },
        { teamId: "B", jersey: "9", position: "outside_hitter", x: -3.2, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "7", position: "setter", x: -6.4, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "10", position: "opposite", x: -3.2, z: 3.0, action: "ready" },
        { teamId: "B", jersey: "15", position: "libero", x: -6.4, z: 0, action: "ready" },
      ]);
    case "3-man-receive":
      return rosterScene(title ?? "3-man serve-receive", "3-man SR", "serve_receive", [
        { teamId: "A", jersey: "4", position: "outside_hitter", x: 5.8, z: -3.0, action: "passing_serve_receive" },
        { teamId: "A", jersey: "5", position: "libero", x: 6.2, z: 0, action: "passing_serve_receive" },
        { teamId: "A", jersey: "2", position: "outside_hitter", x: 5.8, z: 3.0, action: "passing_serve_receive" },
        { teamId: "A", jersey: "1", position: "setter", x: 7.4, z: 3.1, action: "ready" },
        { teamId: "A", jersey: "3", position: "middle_blocker", x: 3.2, z: 0.4, action: "ready" },
        { teamId: "A", jersey: "8", position: "opposite", x: 3.4, z: -2.8, action: "ready" },
        { teamId: "B", jersey: "12", position: "outside_hitter", x: -7.6, z: 2.5, action: "serving" },
        { teamId: "B", jersey: "13", position: "middle_blocker", x: -3.2, z: 0, action: "ready" },
        { teamId: "B", jersey: "9", position: "outside_hitter", x: -3.2, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "7", position: "setter", x: -6.5, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "10", position: "opposite", x: -3.2, z: 3.0, action: "ready" },
        { teamId: "B", jersey: "15", position: "libero", x: -6.5, z: 0, action: "ready" },
      ]);
    default:
      return rosterScene(title ?? "5-1 Rotation 1 receive", "5-1 R1", "serve_receive", [
        { teamId: "A", jersey: "4", position: "outside_hitter", x: 3.2, z: -3.1, action: "ready" },
        { teamId: "A", jersey: "6", position: "middle_blocker", x: 3.2, z: 0, action: "ready" },
        { teamId: "A", jersey: "2", position: "outside_hitter", x: 3.2, z: 3.1, action: "ready" },
        { teamId: "A", jersey: "5", position: "libero", x: 6.2, z: -2.4, action: "passing_serve_receive" },
        { teamId: "A", jersey: "1", position: "setter", x: 6.8, z: 3.0, action: "ready" },
        { teamId: "A", jersey: "8", position: "opposite", x: 6.3, z: 0.3, action: "passing_serve_receive" },
        { teamId: "B", jersey: "12", position: "outside_hitter", x: -7.4, z: 2.6, action: "serving" },
        { teamId: "B", jersey: "13", position: "middle_blocker", x: -3.2, z: 0, action: "blocking" },
        { teamId: "B", jersey: "9", position: "outside_hitter", x: -3.2, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "7", position: "setter", x: -6.5, z: -3.0, action: "ready" },
        { teamId: "B", jersey: "10", position: "opposite", x: -3.2, z: 3.0, action: "ready" },
        { teamId: "B", jersey: "15", position: "libero", x: -6.5, z: 0, action: "defense_dig" },
      ]);
  }
}

export function createDefaultScene(title?: string) {
  return createPresetScene("5-1-r1-receive", title);
}
