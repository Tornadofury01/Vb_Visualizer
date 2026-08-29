import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";
import { addMemberSchema } from "@/lib/validators";
import { addTeamMember } from "@/services/team-service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const body = addMemberSchema.parse(await req.json());
    const member = addTeamMember(user.id, id, body);
    return json({ member }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
