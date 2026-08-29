import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUserId } from "@/lib/session";
import { getUserById } from "@/services/auth-service";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const user = getUserById(userId);
  if (!user) redirect("/login");
  return <AppShell user={user}>{children}</AppShell>;
}
