import { db, newId, nowIso, slugify } from "@/data/store";
import { requireMembership, requireOwner, requireWriteAccess } from "@/lib/access";
import { AppError } from "@/lib/errors";
import type { Team, TeamMember, TeamMemberRole } from "@/types/domain";

export function listTeamsForUser(userId: string): (Team & { role: TeamMemberRole })[] {
  const state = db.read();
  const memberships = state.teamMembers.filter((m) => m.userId === userId);
  return memberships.map((m) => {
    const team = state.teams.find((t) => t.id === m.teamId);
    if (!team) throw new AppError(500, "Team membership is missing a team");
    return { ...team, role: m.role };
  });
}

export function createTeam(
  userId: string,
  input: { name: string; offenseColor?: string; defenseColor?: string },
): Team {
  return db.write((state) => {
    const now = nowIso();
    const team: Team = {
      id: newId(),
      name: input.name.trim(),
      slug: slugify(input.name),
      offenseColor: input.offenseColor ?? "#2563eb",
      defenseColor: input.defenseColor ?? "#dc2626",
      createdById: userId,
      createdAt: now,
      updatedAt: now,
    };
    state.teams.push(team);
    state.teamMembers.push({
      teamId: team.id,
      userId,
      role: "owner",
      createdAt: now,
    });
    return team;
  });
}

export function getTeam(userId: string, teamId: string): Team & { members: TeamMember[] } {
  requireMembership(teamId, userId);
  const state = db.read();
  const team = state.teams.find((t) => t.id === teamId);
  if (!team) throw new AppError(404, "Team not found");
  return {
    ...team,
    members: state.teamMembers.filter((m) => m.teamId === teamId),
  };
}

export function updateTeam(
  userId: string,
  teamId: string,
  patch: Partial<Pick<Team, "name" | "offenseColor" | "defenseColor">>,
): Team {
  requireOwner(teamId, userId);
  return db.write((state) => {
    const team = state.teams.find((t) => t.id === teamId);
    if (!team) throw new AppError(404, "Team not found");
    if (patch.name) team.name = patch.name.trim();
    if (patch.offenseColor) team.offenseColor = patch.offenseColor;
    if (patch.defenseColor) team.defenseColor = patch.defenseColor;
    team.updatedAt = nowIso();
    return team;
  });
}

export function addTeamMember(
  actorId: string,
  teamId: string,
  input: { userId: string; role: TeamMemberRole },
): TeamMember {
  requireOwner(teamId, actorId);
  return db.write((state) => {
    if (!state.users.some((u) => u.id === input.userId)) {
      throw new AppError(404, "User not found");
    }
    const existing = state.teamMembers.find(
      (m) => m.teamId === teamId && m.userId === input.userId,
    );
    if (existing) {
      existing.role = input.role;
      return existing;
    }
    const member: TeamMember = {
      teamId,
      userId: input.userId,
      role: input.role,
      createdAt: nowIso(),
    };
    state.teamMembers.push(member);
    return member;
  });
}

export function removeTeamMember(actorId: string, teamId: string, userId: string) {
  requireOwner(teamId, actorId);
  requireWriteAccess(teamId, actorId);
  db.write((state) => {
    const member = state.teamMembers.find((m) => m.teamId === teamId && m.userId === userId);
    if (!member) throw new AppError(404, "Member not found");
    if (member.role === "owner") {
      throw new AppError(400, "Cannot remove the team owner");
    }
    state.teamMembers = state.teamMembers.filter(
      (m) => !(m.teamId === teamId && m.userId === userId),
    );
  });
}
