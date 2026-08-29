import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { updateFilmJobSchema } from "@/lib/validators";
import { getFilmJob, updateFilmJob } from "@/services/film-job-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    return json({ filmJob: getFilmJob(user.id, id) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = updateFilmJobSchema.parse(await req.json());
    return json({ filmJob: updateFilmJob(user.id, id, body) });
  } catch (err) {
    return handleRouteError(err);
  }
}
