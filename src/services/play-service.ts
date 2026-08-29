import { db, newId, nowIso } from "@/data/store";
import { requireMembership, requireWriteAccess } from "@/lib/access";
import { AppError } from "@/lib/errors";
import { getSceneGraph } from "@/services/scene-service";
import type { Play, PlayDetail, PlayStatus } from "@/types/domain";

export function listPlays(userId: string, teamId?: string): Play[] {
  const state = db.read();
  const teamIds = new Set(
    state.teamMembers.filter((m) => m.userId === userId).map((m) => m.teamId),
  );
  return state.plays.filter((play) => {
    if (!teamIds.has(play.teamId)) return false;
    if (teamId && play.teamId !== teamId) return false;
    return true;
  });
}

export function createPlay(
  userId: string,
  input: { teamId: string; title: string; description?: string; tags?: string[] },
): Play {
  requireWriteAccess(input.teamId, userId);
  return db.write((state) => {
    const now = nowIso();
    const play: Play = {
      id: newId(),
      teamId: input.teamId,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      status: "draft",
      tags: input.tags ?? [],
      thumbnailUrl: null,
      createdById: userId,
      createdAt: now,
      updatedAt: now,
    };
    state.plays.push(play);
    const sceneId = newId();
    state.scenes.push({
      id: sceneId,
      playId: play.id,
      name: "Scene 1",
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
    });
    return play;
  });
}

function findPlayOrThrow(playId: string): Play {
  const play = db.read().plays.find((p) => p.id === playId);
  if (!play) throw new AppError(404, "Play not found");
  return play;
}

export function getPlay(userId: string, playId: string): PlayDetail {
  const play = findPlayOrThrow(playId);
  requireMembership(play.teamId, userId);
  const scenes = db.read().scenes.filter((s) => s.playId === playId);
  return {
    ...play,
    scenes: scenes.map((scene) => getSceneGraph(scene.id)),
  };
}

export function updatePlay(
  userId: string,
  playId: string,
  patch: Partial<Pick<Play, "title" | "description" | "status" | "tags" | "thumbnailUrl">>,
): Play {
  const existing = findPlayOrThrow(playId);
  requireWriteAccess(existing.teamId, userId);
  return db.write((state) => {
    const play = state.plays.find((p) => p.id === playId);
    if (!play) throw new AppError(404, "Play not found");
    if (patch.title !== undefined) play.title = patch.title.trim();
    if (patch.description !== undefined) play.description = patch.description;
    if (patch.status !== undefined) play.status = patch.status as PlayStatus;
    if (patch.tags !== undefined) play.tags = patch.tags;
    if (patch.thumbnailUrl !== undefined) play.thumbnailUrl = patch.thumbnailUrl;
    play.updatedAt = nowIso();
    return play;
  });
}

export function deletePlay(userId: string, playId: string) {
  const existing = findPlayOrThrow(playId);
  requireWriteAccess(existing.teamId, userId);
  db.write((state) => {
    const sceneIds = state.scenes.filter((s) => s.playId === playId).map((s) => s.id);
    const playerIds = state.scenePlayers
      .filter((p) => sceneIds.includes(p.sceneId))
      .map((p) => p.id);
    const pathIds = state.paths.filter((p) => sceneIds.includes(p.sceneId)).map((p) => p.id);
    state.jumpPoints = state.jumpPoints.filter((j) => !pathIds.includes(j.pathId));
    state.paths = state.paths.filter((p) => !sceneIds.includes(p.sceneId));
    state.keyframes = state.keyframes.filter((k) => !sceneIds.includes(k.sceneId));
    state.scenePlayers = state.scenePlayers.filter((p) => !playerIds.includes(p.id));
    state.scenes = state.scenes.filter((s) => s.playId !== playId);
    state.filmJobs = state.filmJobs.map((job) =>
      job.playId === playId ? { ...job, playId: null } : job,
    );
    state.plays = state.plays.filter((p) => p.id !== playId);
  });
}
