import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useFetch } from "../hooks/useFetch";
import ProgressBar from "../components/ui/ProgressBar";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/StateViews";
import type { LeaderboardCollege, AnalyticsData } from "../types";

export default function League() {
  const { data, loading, error, reload } = useFetch<{ colleges: LeaderboardCollege[]; label: string }>("/leaderboard");
  const { data: analytics } = useFetch<AnalyticsData>("/analytics");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-8">
        <span className="chip border-[var(--color-neon-amber)]/40 text-[var(--color-neon-amber)]">DEMO DATA — SIMULATED CAMPAIGN</span>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono mt-3">🏆 CampusAI League</h1>
        <p className="text-text-dim mt-2">Every registration and referral pushes a campus up the ranks.</p>
      </div>

      {analytics && (
        <div className="panel p-5 sm:p-6 mb-8">
          <ProgressBar
            pct={analytics.progress_pct}
            label="500 REGISTRATION MISSION"
            sublabel={`${analytics.current} / ${analytics.target}`}
            height={14}
          />
          <p className="text-center text-xs text-text-dim mt-2">{analytics.remaining} registrations to go</p>
        </div>
      )}

      {loading && <LoadingState label="Fetching league standings..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && data && data.colleges.length === 0 && (
        <EmptyState title="NO_COLLEGES_YET" message="No colleges have registered yet. Be the first!" />
      )}

      {!loading && !error && data && data.colleges.length > 0 && (
        <div className="panel overflow-hidden">
          <div className="hidden sm:grid grid-cols-[50px_1fr_110px_110px_140px_60px] gap-3 px-5 py-3 text-xs font-mono text-text-dim border-b border-[var(--color-border)]">
            <span>RANK</span>
            <span>COLLEGE</span>
            <span>REGISTERED</span>
            <span>POINTS</span>
            <span>PROGRESS</span>
            <span>TREND</span>
          </div>
          {data.colleges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <Link
                to={`/college/${c.id}`}
                className="grid grid-cols-[40px_1fr_auto] sm:grid-cols-[50px_1fr_110px_110px_140px_60px] items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border)] last:border-0 hover:bg-white/5 transition-colors"
              >
                <span className={`font-mono font-bold ${i < 3 ? "text-glow-green" : "text-text-dim"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${c.rank}`}
                </span>
                <span className="font-medium truncate">
                  {c.name}
                  <span className="block sm:hidden text-xs text-text-dim font-mono">{c.registrations} patched · {c.points} pts</span>
                </span>
                <span className="hidden sm:block font-mono text-sm">{c.registrations}</span>
                <span className="hidden sm:block font-mono text-sm text-glow-cyan">{c.points}</span>
                <span className="hidden sm:block">
                  <ProgressBar pct={c.progress_pct} />
                </span>
                <span className={`text-right sm:text-left ${c.trend === "up" ? "text-glow-green" : c.trend === "down" ? "text-[var(--color-neon-red)]" : "text-text-dim"}`}>
                  {c.trend === "up" ? "▲" : c.trend === "down" ? "▼" : "–"}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
