import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { createPlayerSchema } from "@/lib/validators";
import { addPlayer } from "@/services/scene-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = createPlayerSchema.parse(await req.json());
    const player = addPlayer(user.id, id, body);
    return json({ player }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
