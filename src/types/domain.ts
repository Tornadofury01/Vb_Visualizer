/** Shared scene/play schema for authoring, 3D, and later CV. */

export type TeamMemberRole = "owner" | "coach" | "assistant" | "viewer";
export type PlayStatus = "draft" | "published";
export type TeamSide = "offense" | "defense";
export type PlayerRole = "MB" | "OH" | "S" | "L" | "Opp" | "DS";
export type ActionMode =
  | "blocking"
  | "hitting"
  | "setting"
  | "defense"
  | "serving"
  | "running"
  | "jumping";
export type CourtSlot =
  | "left"
  | "middle"
  | "right"
  | "back_left"
  | "back_middle"
  | "back_right";
export type PathKind = "player" | "ball" | "drawing";
export type FilmJobStatus = "queued" | "processing" | "completed" | "failed";

export type Vec3 = { x: number; y: number; z: number };

export type TimedPoint = Vec3 & {
  tMs: number;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Team = {
  id: string;
  name: string;
  slug: string;
  offenseColor: string;
  defenseColor: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  createdAt: string;
};

export type Play = {
  id: string;
  teamId: string;
  title: string;
  description: string;
  status: PlayStatus;
  tags: string[];
  thumbnailUrl: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type CameraSettings = {
  followPlayerId: string | null;
  rotation: number;
  zoom: number;
  position: Vec3;
};

export type CourtSettings = {
  zoneOverlay: boolean;
  showAntennas: boolean;
  showAttackLine: boolean;
  showNetHeightRef: boolean;
};

export type Scene = {
  id: string;
  playId: string;
  name: string;
  durationMs: number;
  camera: CameraSettings;
  court: CourtSettings;
  ballTrailEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScenePlayer = {
  id: string;
  sceneId: string;
  teamSide: TeamSide;
  jerseyNumber: number | null;
  role: PlayerRole;
  courtZone: number | null;
  courtSlot: CourtSlot | null;
  actionMode: ActionMode;
  start: Vec3;
  label: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Path = {
  id: string;
  sceneId: string;
  kind: PathKind;
  playerId: string | null;
  color: string | null;
  points: TimedPoint[];
  createdAt: string;
  updatedAt: string;
};

export type JumpPoint = {
  id: string;
  pathId: string;
  takeoffTimeMs: number;
  landingTimeMs: number;
  takeoff: Vec3;
  peak: Vec3;
  landing: Vec3;
  createdAt: string;
  updatedAt: string;
};

export type Keyframe = {
  id: string;
  sceneId: string;
  tMs: number;
  label: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type FilmJob = {
  id: string;
  teamId: string;
  playId: string | null;
  status: FilmJobStatus;
  sourceUrl: string;
  result: Record<string, unknown> | null;
  error: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type SceneGraph = Scene & {
  players: ScenePlayer[];
  paths: (Path & { jumpPoints: JumpPoint[] })[];
  keyframes: Keyframe[];
};

export type PlayDetail = Play & {
  scenes: SceneGraph[];
};
