import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <div className="font-mono font-bold text-base mb-2">
            Campus<span className="text-glow-green">AI</span>
          </div>
          <p className="text-text-dim">
            A gamified growth experiment built for the NxtWave Growth Challenge — turning workshop
            registration into a campus-vs-campus placement debugging mission.
          </p>
        </div>
        <div>
          <div className="font-mono text-xs text-text-dim mb-2 tracking-wide">EXPLORE</div>
          <ul className="space-y-1.5">
            <li><Link to="/debug" className="hover:text-[var(--color-neon-green)]">Start Debugging</Link></li>
            <li><Link to="/league" className="hover:text-[var(--color-neon-green)]">CampusAI League</Link></li>
            <li><Link to="/projects" className="hover:text-[var(--color-neon-green)]">AI Project Ideas</Link></li>
            <li><Link to="/admin" className="hover:text-[var(--color-neon-green)]">Growth Command Center</Link></li>
            <li><Link to="/growth-plan" className="hover:text-[var(--color-neon-green)]">Growth Plan & AI Notes</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-xs text-text-dim mb-2 tracking-wide">THE CHALLENGE</div>
          <p className="text-text-dim">
            Workshop: <span className="text-white">"Build Your First AI Project in 60 Minutes"</span> — a free
            NxtWave live session. Target: 500 final-year engineering student registrations.
          </p>
          <p className="mt-2 text-text-dim">All stats in this app are <span className="chip !inline-flex">demo data</span></p>
        </div>
      </div>
    </footer>
  );
}
