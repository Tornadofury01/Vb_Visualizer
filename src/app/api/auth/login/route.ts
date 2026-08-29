import { handleRouteError, json } from "@/lib/http";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/lib/validators";
import { loginUser } from "@/services/auth-service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());
    const user = await loginUser(body.email, body.password);
    await createSession(user.id);
    return json({ user });
  } catch (err) {
    return handleRouteError(err);
  }
}
