import { AppError } from "@/lib/errors";
import { getSessionUserId } from "@/lib/session";
import { getUserById } from "@/services/auth-service";
import type { PublicUser } from "@/types/domain";

export async function requireUser(): Promise<PublicUser> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new AppError(401, "Not authenticated");
  }
  const user = getUserById(userId);
  if (!user) {
    throw new AppError(401, "Not authenticated");
  }
  return user;
}
