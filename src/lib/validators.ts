import { z } from "zod";

export const vec3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const timedPointSchema = vec3Schema.extend({
  tMs: z.number().nonnegative(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(80),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createTeamSchema = z.object({
  name: z.string().min(1).max(80),
  offenseColor: z.string().optional(),
  defenseColor: z.string().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["owner", "coach", "assistant", "viewer"]),
});

export const createPlaySchema = z.object({
  teamId: z.string().uuid(),
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export const updatePlaySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["draft", "published"]).optional(),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  scene: z.unknown().optional(),
});

export const createSceneSchema = z.object({
  name: z.string().min(1).max(80).optional(),
});

export const updateSceneSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  durationMs: z.number().int().positive().optional(),
  ballTrailEnabled: z.boolean().optional(),
  camera: z
    .object({
      followPlayerId: z.string().uuid().nullable().optional(),
      rotation: z.number().optional(),
      zoom: z.number().positive().optional(),
      position: vec3Schema.optional(),
    })
    .optional(),
  court: z
    .object({
      zoneOverlay: z.boolean().optional(),
      showAntennas: z.boolean().optional(),
      showAttackLine: z.boolean().optional(),
      showNetHeightRef: z.boolean().optional(),
    })
    .optional(),
});

export const createPlayerSchema = z.object({
  teamSide: z.enum(["offense", "defense"]),
  jerseyNumber: z.number().int().min(0).max(99).nullable().optional(),
  role: z.enum(["MB", "OH", "S", "L", "Opp", "DS"]),
  courtZone: z.number().int().min(1).max(6).nullable().optional(),
  courtSlot: z
    .enum(["left", "middle", "right", "back_left", "back_middle", "back_right"])
    .nullable()
    .optional(),
  actionMode: z.enum([
    "blocking",
    "hitting",
    "setting",
    "defense",
    "serving",
    "running",
    "jumping",
  ]),
  start: vec3Schema.optional(),
  label: z.string().max(40).nullable().optional(),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export const createPathSchema = z.object({
  kind: z.enum(["player", "ball", "drawing"]),
  playerId: z.string().uuid().nullable().optional(),
  color: z.string().nullable().optional(),
  points: z.array(timedPointSchema).optional(),
});

export const updatePathSchema = createPathSchema.partial();

export const jumpPointSchema = z.object({
  takeoffTimeMs: z.number().nonnegative(),
  landingTimeMs: z.number().nonnegative(),
  takeoff: vec3Schema,
  peak: vec3Schema,
  landing: vec3Schema,
});

export const updateJumpPointSchema = jumpPointSchema.partial();

export const createKeyframeSchema = z.object({
  tMs: z.number().nonnegative(),
  label: z.string().max(80).nullable().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const updateKeyframeSchema = createKeyframeSchema.partial();

export const createFilmJobSchema = z.object({
  teamId: z.string().uuid(),
  playId: z.string().uuid().nullable().optional(),
  sourceUrl: z.string().url(),
});

export const updateFilmJobSchema = z.object({
  status: z.enum(["queued", "processing", "completed", "failed"]).optional(),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
  error: z.string().nullable().optional(),
  playId: z.string().uuid().nullable().optional(),
});
