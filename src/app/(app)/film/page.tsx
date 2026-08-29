"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { api } from "@/lib/api";
import type { FilmJob, Play, Team } from "@/types/domain";

export default function FilmPage() {
  const [jobs, setJobs] = useState<FilmJob[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [teams, setTeams] = useState<(Team & { role: string })[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const [jobsRes, playsRes, teamsRes] = await Promise.all([
      api<{ filmJobs: FilmJob[] }>("/api/film-jobs"),
      api<{ plays: Play[] }>("/api/plays"),
      api<{ teams: (Team & { role: string })[] }>("/api/teams"),
    ]);
    setJobs(jobsRes.filmJobs);
    setPlays(playsRes.plays);
    setTeams(teamsRes.teams);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Film</p>
      <h1 className="mt-1 text-3xl font-semibold">Analysis jobs</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Queue film for later computer-vision processing. Results will attach to a play when ready.
      </p>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      <Card className="mt-8">
        <h2 className="font-semibold">Queue a clip</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          action={async (formData) => {
            await api("/api/film-jobs", {
              method: "POST",
              body: JSON.stringify({
                teamId: formData.get("teamId"),
                playId: formData.get("playId") || null,
                sourceUrl: formData.get("sourceUrl"),
              }),
            });
            await load();
          }}
        >
          <Field label="Team">
            <select className={inputClass} name="teamId" required>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Attach to play">
            <select className={inputClass} name="playId">
              <option value="">None yet</option>
              {plays.map((play) => (
                <option key={play.id} value={play.id}>
                  {play.title}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Source URL">
              <input
                className={inputClass}
                name="sourceUrl"
                type="url"
                placeholder="https://"
                required
              />
            </Field>
          </div>
          <Button type="submit">Queue job</Button>
        </form>
      </Card>

      <div className="mt-6 space-y-3">
        {jobs.map((job) => (
          <Card key={job.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="truncate text-sm font-medium">{job.sourceUrl}</p>
              <p className="text-xs text-zinc-500">{new Date(job.createdAt).toLocaleString()}</p>
            </div>
            <Badge>{job.status}</Badge>
          </Card>
        ))}
        {jobs.length === 0 ? (
          <p className="text-sm text-zinc-500">No film jobs queued.</p>
        ) : null}
      </div>
    </div>
  );
}
