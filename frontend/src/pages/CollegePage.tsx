import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api/client";
import ProgressBar from "../components/ui/ProgressBar";
import Terminal from "../components/ui/Terminal";
import { LoadingState, ErrorState } from "../components/ui/StateViews";
import type { CollegeDetail } from "../types";
import { useApp } from "../context/AppContext";

const BOSS_QUESTION = {
  prompt: "THE PLACEMENT ALGORITHM — A recruiter's filter rejects strong candidates with non-traditional resumes. What's the fairest fix?",
  options: [
    { id: "a", label: "Remove the filter entirely, review everything manually" },
    { id: "b", label: "Add a skills-based assessment alongside resume screening" },
    { id: "c", label: "Keep the filter, it saves time" },
    { id: "d", label: "Only accept resumes from top-ranked colleges" },
  ],
  correct: "b",
};

export default function CollegePage() {
  const { id } = useParams();
  const { currentUserId } = useApp();
  const { data: college, loading, error, reload } = useFetch<CollegeDetail>(`/college/${id}`, [id]);
  const [bossAnswer, setBossAnswer] = useState<string | null>(null);
  const [bossResult, setBossResult] = useState<string | null>(null);

  if (loading) return <LoadingState label="Loading campus dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!college) return null;

  const submitBoss = async (optionId: string) => {
    if (bossAnswer) return;
    setBossAnswer(optionId);
    const correct = optionId === BOSS_QUESTION.correct;
    try {
      const res = await api.post<{ points_gained: number; total_points: number }>(
        `/college/${college.id}/boss-battle`,
        { correct, user_id: currentUserId }
      );
      setBossResult(
        correct
          ? `Boss damaged! +${res.points_gained} campus points (total: ${res.total_points}).`
          : `Hit landed anyway — +${res.points_gained} participation points (total: ${res.total_points}).`
      );
    } catch {
      setBossResult("Couldn't record that attempt, but nice try!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-7">
        <span className="chip">CAMPUS #{college.rank}</span>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono mt-3">{college.name}</h1>
        <p className="text-text-dim mt-1">Placement System Status</p>
      </div>

      <Terminal title={`${college.short_code.toLowerCase()}_tracker.sh`}>
        <p className="text-white font-semibold mb-2">PLACEMENT SYSTEM STATUS</p>
        <ProgressBar pct={college.progress_pct} height={18} />
        <p className="mt-3">
          {college.registrations} / {college.target} students patched
        </p>
        <p>
          BUGS REMAINING: <span className="text-[var(--color-neon-red)]">{college.bugs_remaining}</span>
        </p>
        {college.next_milestone && (
          <>
            <p className="mt-2">
              NEXT MILESTONE: <span className="text-glow-cyan">{college.next_milestone}</span>
            </p>
            <p className="text-text-dim mt-1">
              "{college.next_milestone_gap} more students needed to unlock the next Campus Mission."
            </p>
          </>
        )}
      </Terminal>

      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        {college.milestones.map((m) => {
          const reached = college.registrations >= m.threshold;
          return (
            <div key={m.level} className={`panel p-4 ${reached ? "border-[var(--color-neon-green)]/50" : ""}`}>
              <p className="font-mono text-xs text-text-dim">LEVEL {m.level}</p>
              <p className={`font-semibold text-sm mt-1 ${reached ? "text-glow-green" : "text-text-dim"}`}>{m.name}</p>
              <p className="text-xs text-text-dim mt-1">{m.threshold} students</p>
              <p className="text-xs mt-2">{reached ? `✅ ${m.reward}` : "🔒 Locked"}</p>
            </div>
          );
        })}
      </div>

      <div className="panel p-5 sm:p-6 mt-6">
        <h2 className="font-mono text-sm text-text-dim mb-3">TOP REFERRERS AT {college.short_code}</h2>
        {college.top_referrers.length === 0 ? (
          <p className="text-sm text-text-dim">No referrals logged yet — be the first to invite a friend!</p>
        ) : (
          <ol className="space-y-2">
            {college.top_referrers.map((r, i) => (
              <li key={r.name + i} className="flex items-center justify-between text-sm">
                <span>
                  #{i + 1} {r.name} <span className="text-text-dim text-xs">· {r.profile}</span>
                </span>
                <span className="font-mono text-glow-cyan">{r.referrals} referrals</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {college.boss_battle_unlocked ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-5 sm:p-6 mt-6 border-[var(--color-neon-pink)]/40">
          <h2 className="font-mono text-sm text-glow-pink mb-2">⚔️ CAMPUS BOSS BATTLE — "The Placement Algorithm"</h2>
          <p className="text-sm mb-4">{BOSS_QUESTION.prompt}</p>
          <div className="grid gap-2">
            {BOSS_QUESTION.options.map((o) => (
              <button
                key={o.id}
                disabled={!!bossAnswer}
                onClick={() => submitBoss(o.id)}
                className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-colors disabled:cursor-default ${
                  bossAnswer === o.id
                    ? o.id === BOSS_QUESTION.correct
                      ? "border-[var(--color-neon-green)] bg-[var(--color-neon-green)]/10"
                      : "border-[var(--color-neon-red)] bg-[var(--color-neon-red)]/10"
                    : "border-[var(--color-border)] hover:border-[var(--color-neon-pink)]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {bossResult && <p className="mt-3 text-sm text-glow-green">{bossResult}</p>}
        </motion.div>
      ) : (
        <div className="panel p-5 sm:p-6 mt-6 text-center text-sm text-text-dim">
          ⚔️ Campus Boss Battle unlocks at Level 3 (150 patched students). Help {college.name} get there!
        </div>
      )}

      <div className="text-center mt-8">
        <Link to="/league" className="btn-ghost text-sm">
          ← Back to full league
        </Link>
      </div>
    </div>
  );
}
