import { db, newId, nowIso } from "@/data/store";
import { requireMembership, requireWriteAccess } from "@/lib/access";
import { AppError } from "@/lib/errors";
import type { FilmJob, FilmJobStatus } from "@/types/domain";

export function listFilmJobs(userId: string, filters: { teamId?: string; playId?: string }): FilmJob[] {
  const state = db.read();
  const teamIds = new Set(
    state.teamMembers.filter((m) => m.userId === userId).map((m) => m.teamId),
  );
  return state.filmJobs.filter((job) => {
    if (!teamIds.has(job.teamId)) return false;
    if (filters.teamId && job.teamId !== filters.teamId) return false;
    if (filters.playId && job.playId !== filters.playId) return false;
    return true;
  });
}

export function createFilmJob(
  userId: string,
  input: { teamId: string; playId?: string | null; sourceUrl: string },
): FilmJob {
  requireWriteAccess(input.teamId, userId);
  if (input.playId) {
    const play = db.read().plays.find((p) => p.id === input.playId);
    if (!play || play.teamId !== input.teamId) {
      throw new AppError(400, "playId does not belong to this team");
    }
  }
  return db.write((state) => {
    const now = nowIso();
    const job: FilmJob = {
      id: newId(),
      teamId: input.teamId,
      playId: input.playId ?? null,
      status: "queued",
      sourceUrl: input.sourceUrl,
      result: null,
      error: null,
      createdById: userId,
      createdAt: now,
      updatedAt: now,
    };
    state.filmJobs.push(job);
    return job;
  });
}

export function getFilmJob(userId: string, jobId: string): FilmJob {
  const job = db.read().filmJobs.find((j) => j.id === jobId);
  if (!job) throw new AppError(404, "Film job not found");
  requireMembership(job.teamId, userId);
  return job;
}

export function updateFilmJob(
  userId: string,
  jobId: string,
  patch: Partial<Pick<FilmJob, "status" | "result" | "error" | "playId">>,
): FilmJob {
  const existing = db.read().filmJobs.find((j) => j.id === jobId);
  if (!existing) throw new AppError(404, "Film job not found");
  requireWriteAccess(existing.teamId, userId);
  if (patch.status && !isStatus(patch.status)) {
    throw new AppError(400, "Invalid film job status");
  }
  return db.write((state) => {
    const job = state.filmJobs.find((j) => j.id === jobId);
    if (!job) throw new AppError(404, "Film job not found");
    Object.assign(job, patch, { updatedAt: nowIso() });
    return job;
  });
}

function isStatus(value: string): value is FilmJobStatus {
  return ["queued", "processing", "completed", "failed"].includes(value);
}
