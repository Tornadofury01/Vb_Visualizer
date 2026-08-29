import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { jumpPointSchema } from "@/lib/validators";
import { addJumpPoint } from "@/services/scene-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = jumpPointSchema.parse(await req.json());
    const jumpPoint = addJumpPoint(user.id, id, body);
    return json({ jumpPoint }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
