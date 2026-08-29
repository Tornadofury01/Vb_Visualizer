"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CourtPreview } from "@/components/court-preview";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { api } from "@/lib/api";
import type {
  ActionMode,
  CourtSlot,
  PlayDetail,
  PlayerRole,
  SceneGraph,
  TeamSide,
} from "@/types/domain";

const ROLES: PlayerRole[] = ["MB", "OH", "S", "L", "Opp", "DS"];
const ACTIONS: ActionMode[] = [
  "blocking",
  "hitting",
  "setting",
  "defense",
  "serving",
  "running",
  "jumping",
];
const SLOTS: CourtSlot[] = [
  "left",
  "middle",
  "right",
  "back_left",
  "back_middle",
  "back_right",
];

export function PlayEditor({ playId }: { playId: string }) {
  const router = useRouter();
  const [play, setPlay] = useState<PlayDetail | null>(null);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await api<{ play: PlayDetail }>(`/api/plays/${playId}`);
    setPlay(res.play);
    setSceneId((current) => current ?? res.play.scenes[0]?.id ?? null);
  }, [playId]);

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [load]);

  const scene: SceneGraph | undefined = play?.scenes.find((s) => s.id === sceneId);

  async function savePlay(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      await api(`/api/plays/${playId}`, { method: "PATCH", body: JSON.stringify(patch) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveScene(patch: Record<string, unknown>) {
    if (!scene) return;
    setSaving(true);
    try {
      await api(`/api/scenes/${scene.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addScene() {
    await api(`/api/plays/${playId}/scenes`, { method: "POST", body: JSON.stringify({}) });
    await load();
  }

  async function addPlayer(formData: FormData) {
    if (!scene) return;
    await api(`/api/scenes/${scene.id}/players`, {
      method: "POST",
      body: JSON.stringify({
        teamSide: formData.get("teamSide") as TeamSide,
        role: formData.get("role"),
        actionMode: formData.get("actionMode"),
        courtZone: formData.get("courtZone") ? Number(formData.get("courtZone")) : null,
        courtSlot: formData.get("courtSlot") || null,
        jerseyNumber: formData.get("jerseyNumber") ? Number(formData.get("jerseyNumber")) : null,
        label: formData.get("label") || null,
      }),
    });
    await load();
  }

  async function addPath(kind: "player" | "ball" | "drawing") {
    if (!scene) return;
    await api(`/api/scenes/${scene.id}/paths`, {
      method: "POST",
      body: JSON.stringify({ kind, points: [] }),
    });
    await load();
  }

  async function removePlay() {
    if (!confirm("Delete this play?")) return;
    await api(`/api/plays/${playId}`, { method: "DELETE" });
    router.push("/plays");
  }

  if (!play) {
    return <p className="text-sm text-zinc-400">{error || "Loading play…"}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/plays" className="text-xs text-zinc-400 hover:text-white">
            ← Playbook
          </Link>
          <input
            className="mt-2 block w-full bg-transparent text-3xl font-semibold tracking-tight outline-none"
            defaultValue={play.title}
            key={play.title}
            onBlur={(e) => {
              if (e.target.value !== play.title) savePlay({ title: e.target.value });
            }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{play.status}</Badge>
            {play.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            {saving ? <span className="text-xs text-zinc-500">Saving…</span> : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              savePlay({ status: play.status === "draft" ? "published" : "draft" })
            }
          >
            {play.status === "draft" ? "Publish" : "Unpublish"}
          </Button>
          <Button type="button" variant="danger" onClick={removePlay}>
            Delete
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Card>
        <Field label="Coach notes">
          <textarea
            className={inputClass}
            defaultValue={play.description}
            key={play.description}
            rows={2}
            onBlur={(e) => {
              if (e.target.value !== play.description) savePlay({ description: e.target.value });
            }}
          />
        </Field>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {play.scenes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSceneId(item.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              item.id === sceneId ? "bg-accent text-zinc-900" : "bg-white/10 text-zinc-300"
            }`}
          >
            {item.name}
          </button>
        ))}
        <Button type="button" variant="ghost" onClick={addScene}>
          Add scene
        </Button>
      </div>

      {scene ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="overflow-hidden p-3">
            <CourtPreview scene={scene} showZones={scene.court.zoneOverlay} />
          </Card>
          <div className="space-y-4">
            <Card>
              <h2 className="font-semibold">Court & camera</h2>
              <div className="mt-3 space-y-2 text-sm">
                {(
                  [
                    ["zoneOverlay", "Zone numbers 1–6"],
                    ["showAttackLine", "Attack line"],
                    ["showAntennas", "Antennas"],
                    ["showNetHeightRef", "Net height reference"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={scene.court[key]}
                      onChange={(e) =>
                        saveScene({ court: { ...scene.court, [key]: e.target.checked } })
                      }
                    />
                    {label}
                  </label>
                ))}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scene.ballTrailEnabled}
                    onChange={(e) => saveScene({ ballTrailEnabled: e.target.checked })}
                  />
                  Ball trail
                </label>
                <Field label="Duration (ms)">
                  <input
                    className={inputClass}
                    type="number"
                    defaultValue={scene.durationMs}
                    key={scene.durationMs}
                    onBlur={(e) => saveScene({ durationMs: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Camera rotation">
                  <input
                    className="w-full"
                    type="range"
                    min={0}
                    max={360}
                    defaultValue={scene.camera.rotation}
                    key={`rot-${scene.id}-${scene.camera.rotation}`}
                    onPointerUp={(e) =>
                      saveScene({
                        camera: { ...scene.camera, rotation: Number(e.currentTarget.value) },
                      })
                    }
                  />
                </Field>
                <Field label="Zoom">
                  <input
                    className="w-full"
                    type="range"
                    min={0.5}
                    max={3}
                    step={0.1}
                    defaultValue={scene.camera.zoom}
                    key={`zoom-${scene.id}-${scene.camera.zoom}`}
                    onPointerUp={(e) =>
                      saveScene({ camera: { ...scene.camera, zoom: Number(e.currentTarget.value) } })
                    }
                  />
                </Field>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {scene ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-semibold">Drop a player</h2>
            <form action={addPlayer} className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Side">
                <select className={inputClass} name="teamSide" defaultValue="offense">
                  <option value="offense">Offense</option>
                  <option value="defense">Defense</option>
                </select>
              </Field>
              <Field label="Role">
                <select className={inputClass} name="role">
                  {ROLES.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </Field>
              <Field label="Action">
                <select className={inputClass} name="actionMode">
                  {ACTIONS.map((action) => (
                    <option key={action}>{action}</option>
                  ))}
                </select>
              </Field>
              <Field label="Zone">
                <select className={inputClass} name="courtZone" defaultValue="3">
                  {[1, 2, 3, 4, 5, 6].map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Slot">
                <select className={inputClass} name="courtSlot">
                  {SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Jersey">
                <input className={inputClass} name="jerseyNumber" type="number" min={0} max={99} />
              </Field>
              <div className="col-span-2">
                <Field label="Label">
                  <input className={inputClass} name="label" placeholder="MB1" />
                </Field>
              </div>
              <div className="col-span-2">
                <Button type="submit">Add to court</Button>
              </div>
            </form>
            <ul className="mt-5 space-y-2">
              {scene.players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                >
                  <span>
                    #{player.jerseyNumber ?? "—"} {player.label ?? player.role} · {player.actionMode} ·
                    zone {player.courtZone ?? "—"}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-zinc-400 hover:text-red-400"
                    onClick={async () => {
                      await api(`/api/players/${player.id}`, { method: "DELETE" });
                      await load();
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="font-semibold">Paths & timings</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Player routes, ball flight, and drawn arrows. Jump points mark takeoff and landing.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={() => addPath("player")}>
                Player path
              </Button>
              <Button type="button" variant="ghost" onClick={() => addPath("ball")}>
                Ball path
              </Button>
              <Button type="button" variant="ghost" onClick={() => addPath("drawing")}>
                Draw line
              </Button>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {scene.paths.map((path) => (
                <li key={path.id} className="rounded-lg bg-white/5 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{path.kind} path</span>
                    <span className="text-xs text-zinc-500">
                      {path.jumpPoints.length} jump point{path.jumpPoints.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {path.kind === "player" ? (
                    <button
                      type="button"
                      className="mt-1 text-xs text-accent"
                      onClick={async () => {
                        await api(`/api/paths/${path.id}/jump-points`, {
                          method: "POST",
                          body: JSON.stringify({
                            takeoffTimeMs: 1200,
                            landingTimeMs: 1800,
                            takeoff: { x: 0, y: 0, z: 0 },
                            peak: { x: 0, y: 1.1, z: 0 },
                            landing: { x: 0, y: 0, z: 0.4 },
                          }),
                        });
                        await load();
                      }}
                    >
                      Add jump timing
                    </button>
                  ) : null}
                </li>
              ))}
              {scene.paths.length === 0 ? (
                <li className="text-zinc-500">No paths yet</li>
              ) : null}
            </ul>
            <h3 className="mt-6 text-sm font-semibold">Keyframes</h3>
            <form
              className="mt-2 flex gap-2"
              action={async (formData) => {
                await api(`/api/scenes/${scene.id}/keyframes`, {
                  method: "POST",
                  body: JSON.stringify({
                    tMs: Number(formData.get("tMs")),
                    label: formData.get("label"),
                  }),
                });
                await load();
              }}
            >
              <input className={inputClass} name="tMs" type="number" placeholder="ms" required />
              <input className={inputClass} name="label" placeholder="Contact" />
              <Button type="submit">Add</Button>
            </form>
            <ul className="mt-3 space-y-1 text-sm text-zinc-300">
              {scene.keyframes.map((kf) => (
                <li key={kf.id}>
                  {kf.tMs}ms {kf.label ? `· ${kf.label}` : ""}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
