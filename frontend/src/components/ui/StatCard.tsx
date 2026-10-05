import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  sub,
  accent = "green",
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: "green" | "cyan" | "pink" | "amber";
  icon?: ReactNode;
}) {
  const color =
    accent === "cyan" ? "text-glow-cyan" : accent === "pink" ? "text-glow-pink" : accent === "amber" ? "text-[var(--color-neon-amber)]" : "text-glow-green";
  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex items-center justify-between font-mono text-[11px] tracking-wide text-text-dim uppercase">
        <span>{label}</span>
        {icon}
      </div>
      <div className={`mt-2 text-2xl sm:text-3xl font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-text-dim">{sub}</div>}
    </div>
  );
}
