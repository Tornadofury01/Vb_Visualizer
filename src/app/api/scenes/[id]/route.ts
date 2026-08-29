import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { updateSceneSchema } from "@/lib/validators";
import { deleteScene, getScene, updateScene } from "@/services/scene-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    return json({ scene: getScene(user.id, id) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = updateSceneSchema.parse(await req.json());
    return json({ scene: updateScene(user.id, id, body) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    deleteScene(user.id, id);
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
