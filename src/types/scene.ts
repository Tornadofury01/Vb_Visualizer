/** Canonical play document. Coach authoring and future CV output both emit this. */

export const SCENE_SCHEMA_VERSION = 1;

export type EntityType = "player" | "ball";

export type PlayerPosition =
  | "setter"
  | "outside_hitter"
  | "opposite"
  | "middle_blocker"
  | "libero"
  | "defensive_specialist";

export type ActionState =
  | "ready"
  | "shuffle"
  | "approach"
  | "jump_start"
  | "jump_peak_contact"
  | "landing"
  | "blocking"
  | "hitting"
  | "setting"
  | "serving"
  | "passing_serve_receive"
  | "defense_dig"
  | "running";

export type SituationTag = "serve_receive" | "transition" | "free_ball" | "serve";

export type ContactEvent = {
  id: string;
  label: string;
  order: number;
};

export type Keyframe = {
  relativeToContactId: string;
  offsetSeconds: number;
  x: number;
  y: number;
  z: number;
  actionState?: ActionState;
};

export type PathEvent = {
  type: "jump_start" | "jump_peak" | "landing" | "custom";
  keyframeIndex: number;
  label?: string;
};

export type Entity = {
  id: string;
  type: EntityType;
  position?: PlayerPosition;
  jerseyNumber?: string;
  teamId: string;
  keyframes: Keyframe[];
  pathEvents?: PathEvent[];
};

export type Annotation = {
  id: string;
  type: "arrow" | "circle" | "text";
  points: { x: number; y: number; z: number }[];
  text?: string;
};

export type Scene = {
  id: string;
  schemaVersion: number;
  title: string;
  rotationLabel?: string;
  situationTag?: SituationTag;
  contactEvents: ContactEvent[];
  entities: Entity[];
  annotations?: Annotation[];
  createdAt: string;
  updatedAt: string;
};

export type SampledPose = {
  x: number;
  y: number;
  z: number;
  actionState?: ActionState;
};

export const POSITION_ABBR: Record<PlayerPosition, string> = {
  setter: "S",
  outside_hitter: "OH",
  opposite: "Opp",
  middle_blocker: "MB",
  libero: "L",
  defensive_specialist: "DS",
};
