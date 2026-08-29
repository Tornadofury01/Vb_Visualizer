import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { createKeyframeSchema } from "@/lib/validators";
import { addKeyframe } from "@/services/scene-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = createKeyframeSchema.parse(await req.json());
    const keyframe = addKeyframe(user.id, id, body);
    return json({ keyframe }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
