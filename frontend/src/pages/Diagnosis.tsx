import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Terminal from "../components/ui/Terminal";
import ProgressBar from "../components/ui/ProgressBar";
import { useApp } from "../context/AppContext";
import { PROFILE_META } from "../data/profiles";

export default function Diagnosis() {
  const navigate = useNavigate();
  const { gameResult, logEvent } = useApp();

  useEffect(() => {
    if (!gameResult) navigate("/debug", { replace: true });
  }, [gameResult, navigate]);

  if (!gameResult) return null;

  const { diagnosis, ai_score, profile_type } = gameResult;
  const meta = PROFILE_META[profile_type] ?? PROFILE_META["THE EXPLORER"];
  const entries = Object.entries(diagnosis.scores);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-7">
          <span className="chip border-[var(--color-neon-cyan)]/40 text-glow-cyan mb-3">DIAGNOSIS COMPLETE</span>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono mt-2">Placement System Diagnosis</h1>
        </div>

        <Terminal title="diagnosis_report.log">
          <p className="text-white font-semibold">SYSTEM DIAGNOSTICS</p>
          <p className="text-text-dim">{"-".repeat(36)}</p>
          <div className="my-3 space-y-2.5">
            {entries.map(([label, value], i) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{label}</span>
                  <span className="text-glow-cyan">{value}%</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: i * 0.1 }}
                  className="progress-track"
                  style={{ height: 8 }}
                >
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.1 }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
          <p className="text-text-dim">{"-".repeat(36)}</p>
          <p className="mt-3">
            SYSTEM STATUS: <span className="text-glow-green font-bold">{diagnosis.status}</span>
          </p>
          <p>
            DETECTED GAP: <span className="text-[var(--color-neon-red)] font-bold">{diagnosis.gap}</span>
          </p>
        </Terminal>

        <div className="panel p-5 sm:p-7 mt-6 text-center">
          <div className="text-4xl mb-2">{meta.emoji}</div>
          <p className="font-mono text-xs text-text-dim">YOUR PROFILE</p>
          <h2 className="text-xl sm:text-2xl font-bold text-glow-green font-mono mt-1">{profile_type}</h2>
          <p className="text-text-dim mt-2 max-w-md mx-auto">{meta.tagline}</p>

          <div className="mt-5 max-w-xs mx-auto">
            <ProgressBar pct={ai_score} label="AI READINESS SCORE" sublabel={`${ai_score}/100`} height={14} />
          </div>

          <p className="mt-6 text-sm">
            You're already strong at <span className="text-glow-cyan">{diagnosis.strength}</span>.
            <br />
            Your biggest missing module is <span className="text-[var(--color-neon-red)]">{diagnosis.gap}</span>.
          </p>
          <p className="mt-2 text-sm text-text-dim">
            That's exactly what <em>"Build Your First AI Project in 60 Minutes"</em> is designed to help you explore.
          </p>

          <button
            className="btn-primary text-base mt-7"
            onClick={() => {
              logEvent("registration_started");
              navigate("/register");
            }}
          >
            🔧 PATCH MY SYSTEM
          </button>
        </div>
      </motion.div>
    </div>
  );
}
