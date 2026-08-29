"use client";

import { useEffect, useState } from "react";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { api } from "@/lib/api";
import type { Team } from "@/types/domain";

type TeamRow = Team & { role: string; members?: { userId: string; role: string }[] };

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const list = await api<{ teams: TeamRow[] }>("/api/teams");
    const detailed = await Promise.all(
      list.teams.map(async (team) => {
        const res = await api<{ team: TeamRow }>(`/api/teams/${team.id}`);
        return { ...res.team, role: team.role };
      }),
    );
    setTeams(detailed);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Club</p>
      <h1 className="mt-1 text-3xl font-semibold">Team colors & roster access</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Offense and defense stay visually distinct on the court, separate from position labels.
      </p>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      <div className="mt-8 space-y-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <form
              className="grid gap-4 sm:grid-cols-2"
              action={async (formData) => {
                await api(`/api/teams/${team.id}`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    name: formData.get("name"),
                    offenseColor: formData.get("offenseColor"),
                    defenseColor: formData.get("defenseColor"),
                  }),
                });
                await load();
              }}
            >
              <div className="sm:col-span-2">
                <Field label="Team name">
                  <input className={inputClass} name="name" defaultValue={team.name} />
                </Field>
              </div>
              <Field label="Offense color">
                <input
                  className="h-10 w-full rounded-lg border border-white/10 bg-transparent"
                  name="offenseColor"
                  type="color"
                  defaultValue={team.offenseColor}
                />
              </Field>
              <Field label="Defense color">
                <input
                  className="h-10 w-full rounded-lg border border-white/10 bg-transparent"
                  name="defenseColor"
                  type="color"
                  defaultValue={team.defenseColor}
                />
              </Field>
              <div className="sm:col-span-2 flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  Your role: {team.role} · {team.members?.length ?? 1} member
                  {(team.members?.length ?? 1) === 1 ? "" : "s"}
                </p>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
