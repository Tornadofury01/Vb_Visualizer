import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { createTeamSchema } from "@/lib/validators";
import { createTeam, listTeamsForUser } from "@/services/team-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return json({ teams: listTeamsForUser(user.id) });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = createTeamSchema.parse(await req.json());
    const team = createTeam(user.id, body);
    return json({ team }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
