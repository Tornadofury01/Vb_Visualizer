import { CONTACT_GAP_SECONDS } from "@/scene/court";
import type { ContactEvent, Entity, Keyframe, SampledPose, Scene } from "@/types/scene";

export function sortedContacts(contacts: ContactEvent[]): ContactEvent[] {
  return [...contacts].sort((a, b) => a.order - b.order);
}

/** Absolute time of a contact. Gaps are uniform until a CV pipeline supplies real timestamps. */
export function contactTime(
  contacts: ContactEvent[],
  contactId: string,
  gapSeconds = CONTACT_GAP_SECONDS,
): number {
  const list = sortedContacts(contacts);
  const index = list.findIndex((c) => c.id === contactId);
  if (index < 0) return 0;
  return index * gapSeconds;
}

export function keyframeTime(
  keyframe: Keyframe,
  contacts: ContactEvent[],
  gapSeconds = CONTACT_GAP_SECONDS,
): number {
  return contactTime(contacts, keyframe.relativeToContactId, gapSeconds) + keyframe.offsetSeconds;
}

export function nearestContact(
  contacts: ContactEvent[],
  absoluteSeconds: number,
  gapSeconds = CONTACT_GAP_SECONDS,
): ContactEvent {
  const list = sortedContacts(contacts);
  if (list.length === 0) {
    throw new Error("Scene has no contact events");
  }
  return list.reduce((best, contact) => {
    const bestDist = Math.abs(contactTime(contacts, best.id, gapSeconds) - absoluteSeconds);
    const dist = Math.abs(contactTime(contacts, contact.id, gapSeconds) - absoluteSeconds);
    return dist < bestDist ? contact : best;
  });
}

export function sceneDuration(scene: Scene, gapSeconds = CONTACT_GAP_SECONDS): number {
  let max = gapSeconds;
  for (const entity of scene.entities) {
    for (const keyframe of entity.keyframes) {
      max = Math.max(max, keyframeTime(keyframe, scene.contactEvents, gapSeconds));
    }
  }
  return Math.max(max + 0.4, gapSeconds);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function sampleEntity(
  entity: Entity,
  contacts: ContactEvent[],
  absoluteSeconds: number,
  gapSeconds = CONTACT_GAP_SECONDS,
): SampledPose | null {
  if (entity.keyframes.length === 0) return null;
  const frames = [...entity.keyframes].sort(
    (a, b) => keyframeTime(a, contacts, gapSeconds) - keyframeTime(b, contacts, gapSeconds),
  );
  const t = absoluteSeconds;
  const firstT = keyframeTime(frames[0], contacts, gapSeconds);
  const last = frames[frames.length - 1];
  const lastT = keyframeTime(last, contacts, gapSeconds);
  if (t <= firstT) {
    return {
      x: frames[0].x,
      y: frames[0].y,
      z: frames[0].z,
      actionState: frames[0].actionState,
    };
  }
  if (t >= lastT) {
    return { x: last.x, y: last.y, z: last.z, actionState: last.actionState };
  }
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    const ta = keyframeTime(a, contacts, gapSeconds);
    const tb = keyframeTime(b, contacts, gapSeconds);
    if (t >= ta && t <= tb) {
      const u = tb === ta ? 0 : (t - ta) / (tb - ta);
      return {
        x: lerp(a.x, b.x, u),
        y: lerp(a.y, b.y, u),
        z: lerp(a.z, b.z, u),
        actionState: u < 0.5 ? a.actionState : b.actionState,
      };
    }
  }
  return { x: last.x, y: last.y, z: last.z, actionState: last.actionState };
}

export function sampleScene(scene: Scene, absoluteSeconds: number) {
  return scene.entities.map((entity) => ({
    entity,
    pose: sampleEntity(entity, scene.contactEvents, absoluteSeconds),
  }));
}

export function entityPathPoints(entity: Entity, contacts: ContactEvent[]) {
  return [...entity.keyframes]
    .sort((a, b) => keyframeTime(a, contacts) - keyframeTime(b, contacts))
    .map((kf) => ({
      x: kf.x,
      y: kf.y,
      z: kf.z,
      t: keyframeTime(kf, contacts),
      actionState: kf.actionState,
    }));
}
