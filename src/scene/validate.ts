import { overlapIssues } from "@/scene/rotation";
import type { Scene } from "@/types/scene";

export function validateScene(scene: Scene): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (scene.schemaVersion < 1) issues.push("Unknown schema version");
  if (scene.contactEvents.length === 0) issues.push("Scene needs at least one ball-contact event");
  if (!scene.entities.some((e) => e.type === "ball")) issues.push("Scene is missing a ball entity");
  const orders = scene.contactEvents.map((c) => c.order);
  if (new Set(orders).size !== orders.length) issues.push("Contact event order values must be unique");
  for (const issue of overlapIssues(scene)) {
    if (!issues.includes(issue.message)) issues.push(issue.message);
  }
  return { ok: issues.length === 0, issues };
}
