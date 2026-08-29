import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-accent/70";

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-accent text-zinc-900 hover:bg-[#e3ff8a]",
    ghost: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-semibold disabled:opacity-50 ${styles} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-300">
      {children}
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/plays" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-black text-zinc-900">
        VB
      </span>
      <span className="text-sm font-semibold tracking-tight">Visualizer</span>
    </Link>
  );
}
