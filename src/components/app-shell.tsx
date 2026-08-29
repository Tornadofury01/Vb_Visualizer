"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui";
import type { PublicUser } from "@/types/domain";

const links = [
  { href: "/plays", label: "Playbook" },
  { href: "/teams", label: "Team" },
  { href: "/film", label: "Film jobs" },
];

export function AppShell({
  user,
  children,
}: {
  user: PublicUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-full bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-black/20 px-4 py-5 md:flex">
        <Logo />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 pt-4">
          <p className="truncate text-sm font-medium">{user.displayName}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 text-xs font-medium text-zinc-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
          <Logo />
          <button type="button" onClick={logout} className="text-xs text-zinc-400">
            Sign out
          </button>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
