import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { createPathSchema } from "@/lib/validators";
import { addPath } from "@/services/scene-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = createPathSchema.parse(await req.json());
    const path = addPath(user.id, id, body);
    return json({ path }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
