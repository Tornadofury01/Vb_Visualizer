import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { removeTeamMember } from "@/services/team-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id, userId } = await ctx.params;
    removeTeamMember(user.id, id, userId);
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
