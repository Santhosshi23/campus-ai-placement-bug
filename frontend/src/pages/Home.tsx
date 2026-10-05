import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Terminal from "../components/ui/Terminal";
import ProgressBar from "../components/ui/ProgressBar";
import { useFetch } from "../hooks/useFetch";
import type { AnalyticsData, LeaderboardCollege, Project } from "../types";
import { useApp } from "../context/AppContext";

const SYSTEM_MODULES = [
  { name: "CODING_MODULE", status: "ONLINE", ok: true },
  { name: "DSA_MODULE", status: "ONLINE", ok: true },
  { name: "PROJECT_MODULE", status: "ONLINE", ok: true },
  { name: "AI_MODULE", status: "NOT_FOUND", ok: false },
  { name: "GENAI_EXPERIENCE", status: "LOW", ok: false },
];

function TickerBar({ analytics, leaderboard }: { analytics: AnalyticsData | null; leaderboard: LeaderboardCollege[] }) {
  const messages: string[] = [];
  if (analytics) {
    messages.push(`🐞 ${analytics.current} students have already patched their placement system`);
    messages.push(`🎯 ${analytics.remaining} registrations left to hit the 500 target`);
    messages.push(`🤖 ${analytics.project_interest_total} AI project interests logged`);
  }
  if (leaderboard[0]) {
    messages.push(`🏆 ${leaderboard[0].name} leads the CampusAI League with ${leaderboard[0].registrations} patches`);
  }
  if (leaderboard[1]) {
    messages.push(`⚡ ${leaderboard[1].name} is only ${leaderboard[1].next_milestone_gap} registrations from its next milestone`);
  }
  messages.push("📊 All stats shown are simulated demo data for this campaign");

  if (messages.length === 0) return null;
  const loopItems = [...messages, ...messages];

  return (
    <div className="border-y border-[var(--color-border)] bg-white/[0.02] overflow-hidden py-2.5">
      <div className="marquee-track font-mono text-xs sm:text-sm text-text-dim">
        {loopItems.map((m, i) => (
          <span key={i} className="px-6 whitespace-nowrap">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { logEvent } = useApp();
  const { data: analytics } = useFetch<AnalyticsData>("/analytics");
  const { data: lb } = useFetch<{ colleges: LeaderboardCollege[] }>("/leaderboard");
  const { data: projectsData } = useFetch<{ projects: Project[] }>("/projects");
  const [scanDone, setScanDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScanDone(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const leaderboard = lb?.colleges ?? [];
  const projects = (projectsData?.projects ?? []).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="chip border-[var(--color-neon-red)]/40 text-[var(--color-neon-red)] mb-5"
            >
              ⚠️ PLACEMENT SYSTEM ERROR
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl sm:text-5xl font-bold leading-[1.1] font-mono"
            >
              Candidate detected.
              <br />
              Your placement journey
              <br />
              has encountered <span className="text-glow-red" style={{ color: "var(--color-neon-red)" }}>an unknown bug</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-5 text-lg text-text-dim max-w-lg"
            >
              Can you debug yourself before your campus does? Run a 60-second diagnostic, discover your
              AI-readiness gap, and see exactly what's standing between you and your first AI project.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-7 flex flex-wrap items-center gap-3">
              <button
                className="btn-primary text-base"
                onClick={() => {
                  logEvent("game_started");
                  navigate("/debug");
                }}
              >
                ▶ START DEBUGGING
              </button>
              <Link to="/league" className="btn-ghost text-base">
                View CampusAI League
              </Link>
            </motion.div>

            <p className="mt-4 text-sm text-text-dim">
              Join hundreds of engineering students preparing for the AI era.{" "}
              <span className="text-white">Free NxtWave workshop</span> at the end of the mission.
            </p>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
            <Terminal title="placement_diagnostics.sh">
              <p className="text-text-dim"># running system scan...</p>
              <p className="mt-2 text-white">SYSTEM STATUS</p>
              <p className="text-text-dim">{"-".repeat(34)}</p>
              <div className="my-1.5 space-y-1.5">
                {SYSTEM_MODULES.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={scanDone ? { opacity: 1, x: 0 } : { opacity: 0.25 }}
                    transition={{ delay: i * 0.18 }}
                    className="flex items-center justify-between"
                  >
                    <span>{m.name}</span>
                    <span className={m.ok ? "text-glow-green" : "text-[var(--color-neon-red)]"}>
                      {scanDone ? m.status : "SCANNING..."}
                    </span>
                  </motion.div>
                ))}
              </div>
              <p className="text-text-dim">{"-".repeat(34)}</p>
              <p className={`mt-3 font-bold ${scanDone ? "scanline-flicker" : ""}`}>
                {scanDone ? (
                  <>
                    Can you <span className="text-glow-cyan">debug yourself</span>
                    <span className="blink-cursor" />
                  </>
                ) : (
                  "Analyzing candidate profile..."
                )}
              </p>
            </Terminal>
          </motion.div>
        </div>
      </section>

      <TickerBar analytics={analytics} leaderboard={leaderboard} />

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold font-mono text-center">How the mission works</h2>
        <p className="text-text-dim text-center mt-2 max-w-xl mx-auto">
          No boring forms upfront. The game comes first — the workshop is your reward for debugging yourself.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {[
            { step: "01", title: "PLAY", desc: "Fix 5 placement bugs in 60 seconds — code, logic & AI scenarios.", emoji: "🎮" },
            { step: "02", title: "DIAGNOSE", desc: "Get a personalised AI-readiness profile — your strength & biggest gap.", emoji: "🩺" },
            { step: "03", title: "REGISTER", desc: "Patch your system by joining the free AI workshop in 60 seconds.", emoji: "🛠️" },
            { step: "04", title: "COMPETE", desc: "Get your referral code, invite your squad, and climb the CampusAI League.", emoji: "🏆" },
          ].map((s) => (
            <div key={s.step} className="panel p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-text-dim">STEP {s.step}</span>
                <span className="text-xl" aria-hidden="true">{s.emoji}</span>
              </div>
              <h3 className="mt-3 font-mono font-bold text-glow-green tracking-wide">{s.title}</h3>
              <p className="mt-1.5 text-sm text-text-dim">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEAGUE PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="panel p-5 sm:p-7">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2 className="text-xl sm:text-2xl font-bold font-mono">🏆 CampusAI League</h2>
            <Link to="/league" className="btn-ghost text-sm">
              View full leaderboard →
            </Link>
          </div>
          {analytics && (
            <div className="mb-6">
              <ProgressBar
                pct={analytics.progress_pct}
                label={`500 REGISTRATION MISSION — ${analytics.current}/${analytics.target}`}
                sublabel={`${analytics.remaining} to go`}
              />
            </div>
          )}
          <div className="grid gap-2">
            {leaderboard.slice(0, 5).map((c) => (
              <Link
                to={`/college/${c.id}`}
                key={c.id}
                className="flex items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors"
              >
                <span className="font-mono text-text-dim w-6">#{c.rank}</span>
                <span className="flex-1 font-medium truncate">{c.name}</span>
                <span className="hidden sm:block w-32">
                  <ProgressBar pct={c.progress_pct} />
                </span>
                <span className="font-mono text-sm text-glow-cyan w-20 text-right">{c.registrations} reg</span>
                <span className={`text-sm ${c.trend === "up" ? "text-glow-green" : c.trend === "down" ? "text-[var(--color-neon-red)]" : "text-text-dim"}`}>
                  {c.trend === "up" ? "▲" : c.trend === "down" ? "▼" : "–"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECT DISCOVERY PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold font-mono">What would you build with AI?</h2>
          <Link to="/projects" className="btn-ghost text-sm">
            Explore all projects →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="panel p-4 flex flex-col">
              <span className="chip w-fit mb-3">{p.category}</span>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-text-dim mt-1.5 flex-1">{p.description}</p>
              <p className="mt-3 text-xs font-mono text-glow-green">{p.interest_count} students interested</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold font-mono">Ready to debug yourself?</h2>
        <p className="text-text-dim mt-2">It takes 60 seconds. Your campus is waiting.</p>
        <button
          className="btn-primary text-base mt-6"
          onClick={() => {
            logEvent("game_started");
            navigate("/debug");
          }}
        >
          ▶ START DEBUGGING
        </button>
      </section>
    </div>
  );
}
