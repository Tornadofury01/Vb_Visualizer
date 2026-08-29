import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { updatePathSchema } from "@/lib/validators";
import { deletePath, updatePath } from "@/services/scene-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = updatePathSchema.parse(await req.json());
    return json({ path: updatePath(user.id, id, body) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    deletePath(user.id, id);
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
