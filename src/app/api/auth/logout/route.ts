import { handleRouteError, json } from "@/lib/http";
import { clearSession } from "@/lib/session";

export async function POST() {
  try {
    await clearSession();
    return json({ ok: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
