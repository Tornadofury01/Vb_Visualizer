import bcrypt from "bcryptjs";
import { db, newId, nowIso, slugify } from "@/data/store";
import { AppError } from "@/lib/errors";
import type { PublicUser, User } from "@/types/domain";

function toPublic(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  return db.write((state) => {
    if (state.users.some((u) => u.email === email)) {
      throw new AppError(409, "Email already registered");
    }
    const now = nowIso();
    const user: User = {
      id: newId(),
      email,
      displayName: input.displayName.trim(),
      passwordHash: bcrypt.hashSync(input.password, 10),
      createdAt: now,
      updatedAt: now,
    };
    const teamId = newId();
    state.users.push(user);
    state.teams.push({
      id: teamId,
      name: `${user.displayName}'s team`,
      slug: slugify(user.displayName),
      offenseColor: "#2563eb",
      defenseColor: "#dc2626",
      createdById: user.id,
      createdAt: now,
      updatedAt: now,
    });
    state.teamMembers.push({
      teamId,
      userId: user.id,
      role: "owner",
      createdAt: now,
    });
    return toPublic(user);
  });
}

export async function loginUser(email: string, password: string): Promise<PublicUser> {
  const user = db.read().users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new AppError(401, "Invalid email or password");
  }
  return toPublic(user);
}

export function getUserById(id: string): PublicUser | null {
  const user = db.read().users.find((u) => u.id === id);
  return user ? toPublic(user) : null;
}
