import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { updateTeamSchema } from "@/lib/validators";
import { getTeam, updateTeam } from "@/services/team-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    return json({ team: getTeam(user.id, id) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = updateTeamSchema.parse(await req.json());
    return json({ team: updateTeam(user.id, id, body) });
  } catch (err) {
    return handleRouteError(err);
  }
}
