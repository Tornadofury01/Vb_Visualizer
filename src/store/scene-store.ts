import { contactTime, nearestContact } from "@/scene/timeline";
import { snapPoint, type SnapMode } from "@/scene/snap";
import { createPresetScene, type FormationPresetId } from "@/scene/presets";
import type { ActionState, Entity, PlayerPosition, Scene } from "@/types/scene";
import { create } from "zustand";

export type CameraMode = "orbit" | "whiteboard" | "broadcast" | "endline" | "player_pov";

type SceneStore = {
  scene: Scene | null;
  playheadSeconds: number;
  isPlaying: boolean;
  selectedEntityId: string | null;
  showZones: boolean;
  snapMode: SnapMode;
  cameraMode: CameraMode;
  placing: boolean;
  pendingDrop: { x: number; z: number } | null;
  hydrate: (scene: Scene) => void;
  setPlayhead: (seconds: number) => void;
  setPlaying: (playing: boolean) => void;
  selectEntity: (id: string | null) => void;
  setShowZones: (show: boolean) => void;
  setSnapMode: (mode: SnapMode) => void;
  setCameraMode: (mode: CameraMode) => void;
  setPlacing: (placing: boolean) => void;
  setPendingDrop: (point: { x: number; z: number } | null) => void;
  replaceScene: (scene: Scene) => void;
  applyPreset: (id: FormationPresetId) => void;
  moveEntityAtPlayhead: (entityId: string, x: number, z: number) => void;
  addPlayerAt: (input: {
    x: number;
    z: number;
    teamId: string;
    position: PlayerPosition;
    actionState: ActionState;
    jerseyNumber: string;
  }) => void;
};

export const useSceneStore = create<SceneStore>((set, get) => ({
  scene: null,
  playheadSeconds: 0,
  isPlaying: false,
  selectedEntityId: null,
  showZones: true,
  snapMode: "grid",
  cameraMode: "broadcast",
  placing: false,
  pendingDrop: null,
  hydrate: (scene) =>
    set({
      scene,
      playheadSeconds: 0,
      isPlaying: false,
      selectedEntityId: null,
      pendingDrop: null,
      placing: false,
    }),
  setPlayhead: (playheadSeconds) => set({ playheadSeconds }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  selectEntity: (selectedEntityId) => set({ selectedEntityId }),
  setShowZones: (showZones) => set({ showZones }),
  setSnapMode: (snapMode) => set({ snapMode }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setPlacing: (placing) => set({ placing, pendingDrop: placing ? get().pendingDrop : null }),
  setPendingDrop: (pendingDrop) => set({ pendingDrop, placing: false }),
  replaceScene: (scene) => set({ scene: { ...scene, updatedAt: new Date().toISOString() } }),
  applyPreset: (id) => {
    const current = get().scene;
    const next = createPresetScene(id, current?.title);
    if (current) next.id = current.id;
    set({
      scene: next,
      playheadSeconds: 0,
      isPlaying: false,
      selectedEntityId: null,
    });
  },
  moveEntityAtPlayhead: (entityId, x, z) => {
    const { scene, playheadSeconds, snapMode } = get();
    if (!scene) return;
    const snapped = snapPoint(x, z, snapMode);
    const entity = scene.entities.find((item) => item.id === entityId);
    if (!entity) return;
    const contact = nearestContact(scene.contactEvents, playheadSeconds);
    const offsetSeconds = playheadSeconds - contactTime(scene.contactEvents, contact.id);
    const nextEntity: Entity = {
      ...entity,
      keyframes: upsertKeyframe(entity, contact.id, offsetSeconds, snapped.x, snapped.z),
    };
    set({
      scene: {
        ...scene,
        entities: scene.entities.map((item) => (item.id === entityId ? nextEntity : item)),
        updatedAt: new Date().toISOString(),
      },
    });
  },
  addPlayerAt: ({ x, z, teamId, position, actionState, jerseyNumber }) => {
    const { scene, playheadSeconds, snapMode } = get();
    if (!scene) return;
    const snapped = snapPoint(x, z, snapMode);
    const contact = nearestContact(scene.contactEvents, playheadSeconds);
    const offsetSeconds = playheadSeconds - contactTime(scene.contactEvents, contact.id);
    const entity: Entity = {
      id: crypto.randomUUID(),
      type: "player",
      teamId,
      position,
      jerseyNumber,
      keyframes: [
        {
          relativeToContactId: contact.id,
          offsetSeconds,
          x: snapped.x,
          y: 0,
          z: snapped.z,
          actionState,
        },
      ],
    };
    set({
      scene: {
        ...scene,
        entities: [...scene.entities, entity],
        updatedAt: new Date().toISOString(),
      },
      selectedEntityId: entity.id,
      pendingDrop: null,
      placing: false,
    });
  },
}));

function upsertKeyframe(
  entity: Entity,
  contactId: string,
  offsetSeconds: number,
  x: number,
  z: number,
): Entity["keyframes"] {
  const idx = entity.keyframes.findIndex(
    (kf) => kf.relativeToContactId === contactId && Math.abs(kf.offsetSeconds - offsetSeconds) < 0.08,
  );
  const next = {
    relativeToContactId: contactId,
    offsetSeconds,
    x,
    y: entity.keyframes[idx]?.y ?? (entity.type === "ball" ? 1.6 : 0),
    z,
    actionState: entity.keyframes[idx]?.actionState,
  };
  if (idx >= 0) {
    return entity.keyframes.map((kf, i) => (i === idx ? next : kf));
  }
  return [...entity.keyframes, next];
}
