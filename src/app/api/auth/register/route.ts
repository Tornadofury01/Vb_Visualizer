import { handleRouteError, json } from "@/lib/http";
import { createSession } from "@/lib/session";
import { registerSchema } from "@/lib/validators";
import { registerUser } from "@/services/auth-service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());
    const user = await registerUser(body);
    await createSession(user.id);
    return json({ user }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
