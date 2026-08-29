import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { createSceneSchema } from "@/lib/validators";
import { createScene, listScenes } from "@/services/scene-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    return json({ scenes: listScenes(user.id, id) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = createSceneSchema.parse(await req.json().catch(() => ({})));
    const scene = createScene(user.id, id, body.name);
    return json({ scene }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
