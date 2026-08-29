import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { updateKeyframeSchema } from "@/lib/validators";
import { deleteKeyframe, updateKeyframe } from "@/services/scene-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = updateKeyframeSchema.parse(await req.json());
    return json({ keyframe: updateKeyframe(user.id, id, body) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    deleteKeyframe(user.id, id);
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
