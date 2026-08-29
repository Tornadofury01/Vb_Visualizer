import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { updatePlaySchema } from "@/lib/validators";
import { deletePlay, getPlay, updatePlay } from "@/services/play-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    return json({ play: getPlay(user.id, id) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = updatePlaySchema.parse(await req.json());
    return json({ play: updatePlay(user.id, id, body) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    deletePlay(user.id, id);
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
