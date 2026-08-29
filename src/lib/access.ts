import { AppError } from "@/lib/errors";
import { db } from "@/data/store";
import type { TeamMember, TeamMemberRole } from "@/types/domain";

const WRITE_ROLES: TeamMemberRole[] = ["owner", "coach", "assistant"];

export function getMembership(teamId: string, userId: string): TeamMember | undefined {
  return db.read().teamMembers.find((m) => m.teamId === teamId && m.userId === userId);
}

export function requireMembership(teamId: string, userId: string): TeamMember {
  const member = getMembership(teamId, userId);
  if (!member) {
    throw new AppError(403, "Not a member of this team");
  }
  return member;
}

export function requireWriteAccess(teamId: string, userId: string): TeamMember {
  const member = requireMembership(teamId, userId);
  if (!WRITE_ROLES.includes(member.role)) {
    throw new AppError(403, "Read-only access");
  }
  return member;
}

export function requireOwner(teamId: string, userId: string): TeamMember {
  const member = requireMembership(teamId, userId);
  if (member.role !== "owner") {
    throw new AppError(403, "Owner access required");
  }
  return member;
}
