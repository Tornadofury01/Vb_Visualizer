import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { createFilmJobSchema } from "@/lib/validators";
import { createFilmJob, listFilmJobs } from "@/services/film-job-service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    return json({
      filmJobs: listFilmJobs(user.id, {
        teamId: url.searchParams.get("teamId") ?? undefined,
        playId: url.searchParams.get("playId") ?? undefined,
      }),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = createFilmJobSchema.parse(await req.json());
    const filmJob = createFilmJob(user.id, body);
    return json({ filmJob }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
