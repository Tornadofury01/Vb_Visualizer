import { sampleEntity } from "@/scene/timeline";
import type { Entity, Scene } from "@/types/scene";

export type OverlapIssue = {
  entityId: string;
  message: string;
};

function localCoords(teamId: string, x: number, z: number) {
  if (teamId === "B") return { x: -x, z: -z };
  return { x, z };
}

/** Indoor overlap at the serve contact: relative order, not exact zone numbers. */
export function overlapIssues(scene: Scene): OverlapIssue[] {
  const serve = [...scene.contactEvents].sort((a, b) => a.order - b.order)[0];
  if (!serve) return [];
  const issues: OverlapIssue[] = [];

  for (const teamId of ["A", "B"]) {
    const players = scene.entities.filter((e) => e.type === "player" && e.teamId === teamId);
    const posed = players
      .map((entity) => {
        const pose = sampleEntity(entity, scene.contactEvents, 0);
        if (!pose) return null;
        return { entity, ...localCoords(teamId, pose.x, pose.z) };
      })
      .filter((row): row is { entity: Entity; x: number; z: number } => row !== null);

    if (posed.length < 4) continue;
    const byNet = [...posed].sort((a, b) => a.x - b.x);
    const front = byNet.slice(0, Math.min(3, byNet.length)).sort((a, b) => a.z - b.z);
    const back = byNet.slice(Math.min(3, byNet.length)).sort((a, b) => a.z - b.z);

    for (let i = 0; i < Math.min(front.length, back.length); i++) {
      if (front[i].x >= back[i].x - 0.05) {
        issues.push({
          entityId: front[i].entity.id,
          message: `Team ${teamId}: front-row player is not closer to the net than the matching back-row player at serve`,
        });
        issues.push({
          entityId: back[i].entity.id,
          message: `Team ${teamId}: back-row overlap at serve`,
        });
      }
    }
    for (let i = 0; i < front.length - 1; i++) {
      if (front[i].z >= front[i + 1].z - 0.05) {
        issues.push({
          entityId: front[i].entity.id,
          message: `Team ${teamId}: front-row players overlap left/right at serve`,
        });
      }
    }
    for (let i = 0; i < back.length - 1; i++) {
      if (back[i].z >= back[i + 1].z - 0.05) {
        issues.push({
          entityId: back[i].entity.id,
          message: `Team ${teamId}: back-row players overlap left/right at serve`,
        });
      }
    }
  }
  return issues;
}

export function illegalEntityIds(scene: Scene) {
  return new Set(overlapIssues(scene).map((issue) => issue.entityId));
}
