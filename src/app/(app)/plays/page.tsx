"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { api } from "@/lib/api";
import type { Play, Team } from "@/types/domain";

export default function PlaysPage() {
  const router = useRouter();
  const [plays, setPlays] = useState<Play[]>([]);
  const [teams, setTeams] = useState<(Team & { role: string })[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function load() {
    const [playsRes, teamsRes] = await Promise.all([
      api<{ plays: Play[] }>("/api/plays"),
      api<{ teams: (Team & { role: string })[] }>("/api/teams"),
    ]);
    setPlays(playsRes.plays);
    setTeams(teamsRes.teams);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function createPlay(formData: FormData) {
    setPending(true);
    setError("");
    try {
      const tags = String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await api<{ play: Play }>("/api/plays", {
        method: "POST",
        body: JSON.stringify({
          teamId: formData.get("teamId"),
          title: formData.get("title"),
          description: formData.get("description"),
          tags,
        }),
      });
      router.push(`/plays/${res.play.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create play");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Playbook
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Drawn-up plays</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Author routes, jump timings, and serve-receive before you put it on the court.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          New play
        </Button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {plays.length === 0 ? (
        <Card className="mt-8 py-16 text-center">
          <p className="text-lg font-medium">No plays yet</p>
          <p className="mt-1 text-sm text-zinc-400">
            Start with a slide, a serve-receive, or a free-ball conversion.
          </p>
          <Button className="mt-6" type="button" onClick={() => setOpen(true)}>
            Draw first play
          </Button>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plays.map((play) => (
            <Link key={play.id} href={`/plays/${play.id}`}>
              <Card className="h-full transition hover:border-accent/40 hover:bg-white/[0.07]">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{play.title}</h2>
                  <Badge>{play.status}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                  {play.description || "No notes yet"}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {play.tags.length ? (
                    play.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)
                  ) : (
                    <span className="text-xs text-zinc-500">No tags</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4">
          <Card className="w-full max-w-md bg-[#0f1a16]">
            <h2 className="text-lg font-semibold">New play</h2>
            <form action={createPlay} className="mt-4 space-y-4">
              <Field label="Team">
                <select className={inputClass} name="teamId" required>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Title">
                <input className={inputClass} name="title" placeholder="Slide vs commit block" required />
              </Field>
              <Field label="Notes">
                <textarea className={inputClass} name="description" rows={3} />
              </Field>
              <Field label="Tags">
                <input className={inputClass} name="tags" placeholder="middle, slide, tempo" />
              </Field>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating…" : "Create"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
