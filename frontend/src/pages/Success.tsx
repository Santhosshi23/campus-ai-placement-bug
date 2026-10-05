import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import ShareBox from "../components/ShareBox";
import ShareCardPanel from "../components/ShareCardPanel";
import { PROFILE_META } from "../data/profiles";

export default function Success() {
  const navigate = useNavigate();
  const { registration } = useApp();
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (!registration) navigate("/", { replace: true });
  }, [registration, navigate]);

  if (!registration) return null;
  const meta = PROFILE_META[registration.profile_type] ?? PROFILE_META["THE EXPLORER"];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
        className="panel p-6 sm:p-9 text-center"
      >
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-xl sm:text-2xl font-bold font-mono text-glow-green">SYSTEM PATCH INSTALLED</h1>
        <p className="text-text-dim mt-1">Welcome to the CampusAI League, {registration.name.split(" ")[0]}.</p>

        {registration.college_milestone_unlocked && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 chip border-[var(--color-neon-amber)]/50 text-[var(--color-neon-amber)] mx-auto"
          >
            🎊 {registration.college} just unlocked {registration.college_milestone_unlocked}!
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-7">
          <div className="panel p-3 bg-white/[0.02]">
            <p className="text-[10px] font-mono text-text-dim">CAMPUS</p>
            <p className="font-semibold text-sm mt-1 truncate">{registration.college}</p>
          </div>
          <div className="panel p-3 bg-white/[0.02]">
            <p className="text-[10px] font-mono text-text-dim">AI PROFILE</p>
            <p className="font-semibold text-sm mt-1">
              {meta.emoji} {registration.profile_type.replace("THE ", "")}
            </p>
          </div>
          <div className="panel p-3 bg-white/[0.02]">
            <p className="text-[10px] font-mono text-text-dim">AI SCORE</p>
            <p className="font-semibold text-sm mt-1 text-glow-cyan">{registration.ai_score}/100</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-text-dim">
          Your college is now competing in the CampusAI League. Every friend you invite adds points to{" "}
          <span className="text-white">{registration.college}</span>.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link to="/league" className="btn-ghost text-sm">
            🏆 VIEW CAMPUS LEADERBOARD
          </Link>
          <button className="btn-primary text-sm" onClick={() => setShowInvite(true)}>
            📣 INVITE YOUR SQUAD
          </button>
          <Link to={`/profile/${registration.user_id}`} className="btn-ghost text-sm">
            View my profile
          </Link>
        </div>
      </motion.div>

      {showInvite && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          <ShareCardPanel
            data={{
              name: registration.name,
              college: registration.college,
              profileType: registration.profile_type,
              aiScore: registration.ai_score,
              referralCode: registration.referral_code,
            }}
            referralLink={registration.referral_link}
          />
          <ShareBox referralCode={registration.referral_code} referralLink={registration.referral_link} />
        </motion.div>
      )}
    </div>
  );
}
