import { requireUser } from "@/lib/auth-request";
import { handleRouteError, json } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireUser();
    return json({ user });
  } catch (err) {
    return handleRouteError(err);
  }
}
