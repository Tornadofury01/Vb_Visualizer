import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { createPlaySchema } from "@/lib/validators";
import { createPlay, listPlays } from "@/services/play-service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const teamId = new URL(req.url).searchParams.get("teamId") ?? undefined;
    return json({ plays: listPlays(user.id, teamId) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = createPlaySchema.parse(await req.json());
    const play = createPlay(user.id, body);
    return json({ play }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
