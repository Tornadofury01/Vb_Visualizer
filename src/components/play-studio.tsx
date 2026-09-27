"use client";

import dynamic from "next/dynamic";
import gsap from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { usePlayQuery, useSaveScene } from "@/hooks/use-play";
import { api } from "@/lib/api";
import { ACTION_STATES } from "@/scene/court";
import { FORMATION_PRESETS } from "@/scene/presets";
import { contactTime, sceneDuration, sortedContacts } from "@/scene/timeline";
import { validateScene } from "@/scene/validate";
import { useSceneStore, type CameraMode } from "@/store/scene-store";
import { POSITION_ABBR, type ActionState, type PlayerPosition } from "@/types/scene";

const AuthoringCanvas = dynamic(
  () => import("@/components/authoring-canvas").then((m) => m.AuthoringCanvas),
  { ssr: false },
);
const Viewer3D = dynamic(
  () => import("@/components/viewer-3d").then((m) => m.Viewer3D),
  { ssr: false },
);

const POSITIONS: PlayerPosition[] = [
  "setter",
  "outside_hitter",
  "opposite",
  "middle_blocker",
  "libero",
  "defensive_specialist",
];

const CAMERAS: { id: CameraMode; label: string }[] = [
  { id: "broadcast", label: "Broadcast" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "endline", label: "End line" },
  { id: "orbit", label: "Orbit" },
  { id: "player_pov", label: "Player POV" },
];

export function PlayStudio({ playId }: { playId: string }) {
  const router = useRouter();
  const playQuery = usePlayQuery(playId);
  const saveScene = useSaveScene(playId);
  const scene = useSceneStore((s) => s.scene);
  const hydrate = useSceneStore((s) => s.hydrate);
  const playhead = useSceneStore((s) => s.playheadSeconds);
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const setPlayhead = useSceneStore((s) => s.setPlayhead);
  const setPlaying = useSceneStore((s) => s.setPlaying);
  const showZones = useSceneStore((s) => s.showZones);
  const setShowZones = useSceneStore((s) => s.setShowZones);
  const selectedId = useSceneStore((s) => s.selectedEntityId);
  const cameraMode = useSceneStore((s) => s.cameraMode);
  const setCameraMode = useSceneStore((s) => s.setCameraMode);
  const snapMode = useSceneStore((s) => s.snapMode);
  const setSnapMode = useSceneStore((s) => s.setSnapMode);
  const placing = useSceneStore((s) => s.placing);
  const setPlacing = useSceneStore((s) => s.setPlacing);
  const pendingDrop = useSceneStore((s) => s.pendingDrop);
  const setPendingDrop = useSceneStore((s) => s.setPendingDrop);
  const addPlayerAt = useSceneStore((s) => s.addPlayerAt);
  const applyPreset = useSceneStore((s) => s.applyPreset);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [dropTeam, setDropTeam] = useState("A");
  const [dropPosition, setDropPosition] = useState<PlayerPosition>("outside_hitter");
  const [dropAction, setDropAction] = useState<ActionState>("ready");
  const [dropJersey, setDropJersey] = useState("9");

  useEffect(() => {
    const loaded = playQuery.data?.play.scene;
    if (!loaded) return;
    if (useSceneStore.getState().scene?.id === loaded.id) return;
    hydrate(loaded);
  }, [hydrate, playQuery.data?.play.scene]);

  useEffect(() => {
    if (!scene || !isPlaying) {
      tween.current?.kill();
      return;
    }
    const duration = sceneDuration(scene);
    const start = useSceneStore.getState().playheadSeconds;
    const remaining = Math.max(duration - start, 0.05);
    const proxy = { t: start };
    tween.current = gsap.to(proxy, {
      t: duration,
      duration: remaining,
      ease: "none",
      onUpdate: () => setPlayhead(proxy.t),
      onComplete: () => setPlaying(false),
    });
    return () => {
      tween.current?.kill();
    };
  }, [isPlaying, scene, setPlayhead, setPlaying]);

  const mutateScene = saveScene.mutate;
  useEffect(() => {
    if (!scene) return;
    const handle = window.setTimeout(() => mutateScene(scene), 900);
    return () => window.clearTimeout(handle);
  }, [scene, mutateScene]);

  const play = playQuery.data?.play;
  const duration = scene ? sceneDuration(scene) : 1;
  const selected = scene?.entities.find((e) => e.id === selectedId);
  const check = scene ? validateScene(scene) : null;

  if (playQuery.isLoading) {
    return <p className="text-sm text-zinc-400">Loading play…</p>;
  }
  if (!play || !scene) {
    return <p className="text-sm text-red-400">{playQuery.error?.message ?? "Play not found"}</p>;
  }

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/plays" className="text-xs text-zinc-400 hover:text-white">
            ← Playbook
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{play.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{scene.rotationLabel ?? "Unlabeled"}</Badge>
            <Badge>{scene.situationTag ?? "custom"}</Badge>
            {saveScene.isPending ? <span className="text-xs text-zinc-500">Saving…</span> : null}
          </div>
        </div>
        <Button
          type="button"
          variant="danger"
          onClick={async () => {
            if (!confirm("Delete this play?")) return;
            await api(`/api/plays/${playId}`, { method: "DELETE" });
            router.push("/plays");
          }}
        >
          Delete
        </Button>
      </div>

      {check && check.issues.length > 0 ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {check.issues[0]}
          {check.issues.length > 1 ? ` · +${check.issues.length - 1} more` : ""}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
        <Button type="button" onClick={() => setPlaying(!isPlaying)}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <input
          className="min-w-[140px] flex-1"
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={playhead}
          onChange={(e) => {
            setPlaying(false);
            setPlayhead(Number(e.target.value));
          }}
        />
        <span className="w-14 text-right text-xs tabular-nums text-zinc-400">{playhead.toFixed(2)}s</span>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} />
          Zones
        </label>
        <select
          className={`${inputClass} w-auto`}
          value={snapMode}
          onChange={(e) => setSnapMode(e.target.value as typeof snapMode)}
        >
          <option value="grid">Snap: grid</option>
          <option value="zone">Snap: zone</option>
          <option value="off">Snap: off</option>
        </select>
        <Button type="button" variant={placing ? "primary" : "ghost"} onClick={() => setPlacing(!placing)}>
          {placing ? "Click court to drop" : "Add player"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CAMERAS.map((cam) => (
          <button
            key={cam.id}
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              cameraMode === cam.id ? "bg-accent text-zinc-900" : "bg-white/10"
            }`}
            onClick={() => setCameraMode(cam.id)}
          >
            {cam.label}
          </button>
        ))}
        {FORMATION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20"
            onClick={() => applyPreset(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {sortedContacts(scene.contactEvents).map((contact) => (
          <button
            key={contact.id}
            type="button"
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium hover:bg-accent hover:text-zinc-900"
            onClick={() => {
              setPlaying(false);
              setPlayhead(contactTime(scene.contactEvents, contact.id));
            }}
          >
            {contact.label.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            2D authoring
          </div>
          <div className="h-[420px]">
            <AuthoringCanvas />
          </div>
        </Card>
        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            3D viewer
          </div>
          <div className="h-[520px]">
            <Viewer3D />
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-sm text-zinc-400">
          Silhouette poses follow the action-state machine. Red rings mark serve-overlap violations.
          Player POV follows the selected athlete and looks at the ball.
        </p>
        {selected ? (
          <p className="mt-3 text-sm">
            Selected:{" "}
            {selected.type === "ball"
              ? "Ball"
              : `#${selected.jerseyNumber ?? "—"} ${selected.position ? POSITION_ABBR[selected.position] : ""}`}{" "}
            · team {selected.teamId}
          </p>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">Select a player, then use Player POV.</p>
        )}
      </Card>

      {pendingDrop ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 p-4">
          <Card className="w-full max-w-md bg-[#0b141c]">
            <h2 className="text-lg font-semibold">Tag this player</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Dropped at {pendingDrop.x.toFixed(1)}m, {pendingDrop.z.toFixed(1)}m
            </p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                addPlayerAt({
                  x: pendingDrop.x,
                  z: pendingDrop.z,
                  teamId: dropTeam,
                  position: dropPosition,
                  actionState: dropAction,
                  jerseyNumber: dropJersey,
                });
              }}
            >
              <Field label="Team">
                <select className={inputClass} value={dropTeam} onChange={(e) => setDropTeam(e.target.value)}>
                  <option value="A">Team A (blue)</option>
                  <option value="B">Team B (red)</option>
                </select>
              </Field>
              <Field label="Position">
                <select
                  className={inputClass}
                  value={dropPosition}
                  onChange={(e) => setDropPosition(e.target.value as PlayerPosition)}
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {POSITION_ABBR[pos]} · {pos.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Action state">
                <select
                  className={inputClass}
                  value={dropAction}
                  onChange={(e) => setDropAction(e.target.value as ActionState)}
                >
                  {ACTION_STATES.map((action) => (
                    <option key={action} value={action}>
                      {action.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Jersey">
                <input className={inputClass} value={dropJersey} onChange={(e) => setDropJersey(e.target.value)} />
              </Field>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setPendingDrop(null)}>
                  Cancel
                </Button>
                <Button type="submit">Place player</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
