import { db, newId, nowIso } from "@/data/store";
import { requireMembership, requireWriteAccess } from "@/lib/access";
import { AppError } from "@/lib/errors";
import type {
  ActionMode,
  CameraSettings,
  CourtSettings,
  CourtSlot,
  JumpPoint,
  Keyframe,
  Path,
  PathKind,
  PlayerRole,
  Scene,
  SceneGraph,
  ScenePlayer,
  TeamSide,
  TimedPoint,
  Vec3,
} from "@/types/domain";

function teamIdForScene(sceneId: string): string {
  const state = db.read();
  const scene = state.scenes.find((s) => s.id === sceneId);
  if (!scene) throw new AppError(404, "Scene not found");
  const play = state.plays.find((p) => p.id === scene.playId);
  if (!play) throw new AppError(404, "Play not found");
  return play.teamId;
}

function requireSceneWrite(userId: string, sceneId: string) {
  requireWriteAccess(teamIdForScene(sceneId), userId);
}

function requireSceneRead(userId: string, sceneId: string) {
  requireMembership(teamIdForScene(sceneId), userId);
}

export function getSceneGraph(sceneId: string): SceneGraph {
  const state = db.read();
  const scene = state.scenes.find((s) => s.id === sceneId);
  if (!scene) throw new AppError(404, "Scene not found");
  const players = state.scenePlayers.filter((p) => p.sceneId === sceneId);
  const paths = state.paths
    .filter((p) => p.sceneId === sceneId)
    .map((path) => ({
      ...path,
      jumpPoints: state.jumpPoints.filter((j) => j.pathId === path.id),
    }));
  const keyframes = state.keyframes
    .filter((k) => k.sceneId === sceneId)
    .sort((a, b) => a.tMs - b.tMs);
  return { ...scene, players, paths, keyframes };
}

export function listScenes(userId: string, playId: string): SceneGraph[] {
  const play = db.read().plays.find((p) => p.id === playId);
  if (!play) throw new AppError(404, "Play not found");
  requireMembership(play.teamId, userId);
  return db
    .read()
    .scenes.filter((s) => s.playId === playId)
    .map((s) => getSceneGraph(s.id));
}

export function createScene(userId: string, playId: string, name?: string): Scene {
  const play = db.read().plays.find((p) => p.id === playId);
  if (!play) throw new AppError(404, "Play not found");
  requireWriteAccess(play.teamId, userId);
  return db.write((state) => {
    const now = nowIso();
    const scene: Scene = {
      id: newId(),
      playId,
      name: name?.trim() || `Scene ${state.scenes.filter((s) => s.playId === playId).length + 1}`,
      durationMs: 8000,
      camera: {
        followPlayerId: null,
        rotation: 0,
        zoom: 1,
        position: { x: 0, y: 8, z: 12 },
      },
      court: {
        zoneOverlay: true,
        showAntennas: true,
        showAttackLine: true,
        showNetHeightRef: true,
      },
      ballTrailEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
    state.scenes.push(scene);
    return scene;
  });
}

export function getScene(userId: string, sceneId: string): SceneGraph {
  requireSceneRead(userId, sceneId);
  return getSceneGraph(sceneId);
}

export function updateScene(
  userId: string,
  sceneId: string,
  patch: {
    name?: string;
    durationMs?: number;
    camera?: Partial<CameraSettings>;
    court?: Partial<CourtSettings>;
    ballTrailEnabled?: boolean;
  },
): Scene {
  requireSceneWrite(userId, sceneId);
  return db.write((state) => {
    const scene = state.scenes.find((s) => s.id === sceneId);
    if (!scene) throw new AppError(404, "Scene not found");
    if (patch.name !== undefined) scene.name = patch.name.trim();
    if (patch.durationMs !== undefined) scene.durationMs = patch.durationMs;
    if (patch.ballTrailEnabled !== undefined) scene.ballTrailEnabled = patch.ballTrailEnabled;
    if (patch.camera) scene.camera = { ...scene.camera, ...patch.camera };
    if (patch.court) scene.court = { ...scene.court, ...patch.court };
    scene.updatedAt = nowIso();
    return scene;
  });
}

export function deleteScene(userId: string, sceneId: string) {
  requireSceneWrite(userId, sceneId);
  db.write((state) => {
    const pathIds = state.paths.filter((p) => p.sceneId === sceneId).map((p) => p.id);
    state.jumpPoints = state.jumpPoints.filter((j) => !pathIds.includes(j.pathId));
    state.paths = state.paths.filter((p) => p.sceneId !== sceneId);
    state.keyframes = state.keyframes.filter((k) => k.sceneId !== sceneId);
    state.scenePlayers = state.scenePlayers.filter((p) => p.sceneId !== sceneId);
    state.scenes = state.scenes.filter((s) => s.id !== sceneId);
  });
}

export function addPlayer(
  userId: string,
  sceneId: string,
  input: {
    teamSide: TeamSide;
    jerseyNumber?: number | null;
    role: PlayerRole;
    courtZone?: number | null;
    courtSlot?: CourtSlot | null;
    actionMode: ActionMode;
    start?: Vec3;
    label?: string | null;
  },
): ScenePlayer {
  requireSceneWrite(userId, sceneId);
  if (input.courtZone != null && (input.courtZone < 1 || input.courtZone > 6)) {
    throw new AppError(400, "courtZone must be 1–6");
  }
  return db.write((state) => {
    const now = nowIso();
    const player: ScenePlayer = {
      id: newId(),
      sceneId,
      teamSide: input.teamSide,
      jerseyNumber: input.jerseyNumber ?? null,
      role: input.role,
      courtZone: input.courtZone ?? null,
      courtSlot: input.courtSlot ?? null,
      actionMode: input.actionMode,
      start: input.start ?? { x: 0, y: 0, z: 0 },
      label: input.label ?? null,
      createdAt: now,
      updatedAt: now,
    };
    state.scenePlayers.push(player);
    return player;
  });
}

export function updatePlayer(
  userId: string,
  playerId: string,
  patch: Partial<
    Pick<
      ScenePlayer,
      "teamSide" | "jerseyNumber" | "role" | "courtZone" | "courtSlot" | "actionMode" | "start" | "label"
    >
  >,
): ScenePlayer {
  const player = db.read().scenePlayers.find((p) => p.id === playerId);
  if (!player) throw new AppError(404, "Player not found");
  requireSceneWrite(userId, player.sceneId);
  if (patch.courtZone != null && (patch.courtZone < 1 || patch.courtZone > 6)) {
    throw new AppError(400, "courtZone must be 1–6");
  }
  return db.write((state) => {
    const row = state.scenePlayers.find((p) => p.id === playerId);
    if (!row) throw new AppError(404, "Player not found");
    Object.assign(row, patch, { updatedAt: nowIso() });
    return row;
  });
}

export function deletePlayer(userId: string, playerId: string) {
  const player = db.read().scenePlayers.find((p) => p.id === playerId);
  if (!player) throw new AppError(404, "Player not found");
  requireSceneWrite(userId, player.sceneId);
  db.write((state) => {
    state.paths = state.paths.map((path) =>
      path.playerId === playerId ? { ...path, playerId: null } : path,
    );
    state.scenes = state.scenes.map((scene) =>
      scene.camera.followPlayerId === playerId
        ? { ...scene, camera: { ...scene.camera, followPlayerId: null } }
        : scene,
    );
    state.scenePlayers = state.scenePlayers.filter((p) => p.id !== playerId);
  });
}

export function addPath(
  userId: string,
  sceneId: string,
  input: {
    kind: PathKind;
    playerId?: string | null;
    color?: string | null;
    points?: TimedPoint[];
  },
): Path {
  requireSceneWrite(userId, sceneId);
  if (input.playerId) {
    const player = db.read().scenePlayers.find((p) => p.id === input.playerId);
    if (!player || player.sceneId !== sceneId) {
      throw new AppError(400, "playerId does not belong to this scene");
    }
  }
  return db.write((state) => {
    const now = nowIso();
    const path: Path = {
      id: newId(),
      sceneId,
      kind: input.kind,
      playerId: input.playerId ?? null,
      color: input.color ?? null,
      points: input.points ?? [],
      createdAt: now,
      updatedAt: now,
    };
    state.paths.push(path);
    return path;
  });
}

export function updatePath(
  userId: string,
  pathId: string,
  patch: Partial<Pick<Path, "kind" | "playerId" | "color" | "points">>,
): Path {
  const path = db.read().paths.find((p) => p.id === pathId);
  if (!path) throw new AppError(404, "Path not found");
  requireSceneWrite(userId, path.sceneId);
  return db.write((state) => {
    const row = state.paths.find((p) => p.id === pathId);
    if (!row) throw new AppError(404, "Path not found");
    Object.assign(row, patch, { updatedAt: nowIso() });
    return row;
  });
}

export function deletePath(userId: string, pathId: string) {
  const path = db.read().paths.find((p) => p.id === pathId);
  if (!path) throw new AppError(404, "Path not found");
  requireSceneWrite(userId, path.sceneId);
  db.write((state) => {
    state.jumpPoints = state.jumpPoints.filter((j) => j.pathId !== pathId);
    state.paths = state.paths.filter((p) => p.id !== pathId);
  });
}

export function addJumpPoint(
  userId: string,
  pathId: string,
  input: Omit<JumpPoint, "id" | "pathId" | "createdAt" | "updatedAt">,
): JumpPoint {
  const path = db.read().paths.find((p) => p.id === pathId);
  if (!path) throw new AppError(404, "Path not found");
  requireSceneWrite(userId, path.sceneId);
  return db.write((state) => {
    const now = nowIso();
    const jump: JumpPoint = {
      id: newId(),
      pathId,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    state.jumpPoints.push(jump);
    return jump;
  });
}

export function updateJumpPoint(
  userId: string,
  jumpId: string,
  patch: Partial<Omit<JumpPoint, "id" | "pathId" | "createdAt" | "updatedAt">>,
): JumpPoint {
  const jump = db.read().jumpPoints.find((j) => j.id === jumpId);
  if (!jump) throw new AppError(404, "Jump point not found");
  const path = db.read().paths.find((p) => p.id === jump.pathId);
  if (!path) throw new AppError(404, "Path not found");
  requireSceneWrite(userId, path.sceneId);
  return db.write((state) => {
    const row = state.jumpPoints.find((j) => j.id === jumpId);
    if (!row) throw new AppError(404, "Jump point not found");
    Object.assign(row, patch, { updatedAt: nowIso() });
    return row;
  });
}

export function deleteJumpPoint(userId: string, jumpId: string) {
  const jump = db.read().jumpPoints.find((j) => j.id === jumpId);
  if (!jump) throw new AppError(404, "Jump point not found");
  const path = db.read().paths.find((p) => p.id === jump.pathId);
  if (!path) throw new AppError(404, "Path not found");
  requireSceneWrite(userId, path.sceneId);
  db.write((state) => {
    state.jumpPoints = state.jumpPoints.filter((j) => j.id !== jumpId);
  });
}

export function addKeyframe(
  userId: string,
  sceneId: string,
  input: { tMs: number; label?: string | null; payload?: Record<string, unknown> },
): Keyframe {
  requireSceneWrite(userId, sceneId);
  return db.write((state) => {
    const now = nowIso();
    const keyframe: Keyframe = {
      id: newId(),
      sceneId,
      tMs: input.tMs,
      label: input.label ?? null,
      payload: input.payload ?? {},
      createdAt: now,
      updatedAt: now,
    };
    state.keyframes.push(keyframe);
    return keyframe;
  });
}

export function updateKeyframe(
  userId: string,
  keyframeId: string,
  patch: Partial<Pick<Keyframe, "tMs" | "label" | "payload">>,
): Keyframe {
  const keyframe = db.read().keyframes.find((k) => k.id === keyframeId);
  if (!keyframe) throw new AppError(404, "Keyframe not found");
  requireSceneWrite(userId, keyframe.sceneId);
  return db.write((state) => {
    const row = state.keyframes.find((k) => k.id === keyframeId);
    if (!row) throw new AppError(404, "Keyframe not found");
    Object.assign(row, patch, { updatedAt: nowIso() });
    return row;
  });
}

export function deleteKeyframe(userId: string, keyframeId: string) {
  const keyframe = db.read().keyframes.find((k) => k.id === keyframeId);
  if (!keyframe) throw new AppError(404, "Keyframe not found");
  requireSceneWrite(userId, keyframe.sceneId);
  db.write((state) => {
    state.keyframes = state.keyframes.filter((k) => k.id !== keyframeId);
  });
}
