import { useState, type ReactNode } from "react";

const DEMO_PASSWORD = "growth2026";

export default function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("campusai_admin") === "1");
  const [value, setValue] = useState("");
  const [err, setErr] = useState(false);

  if (unlocked) return <>{children}</>;

  const tryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === DEMO_PASSWORD) {
      sessionStorage.setItem("campusai_admin", "1");
      setUnlocked(true);
    } else {
      setErr(true);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-24">
      <div className="panel p-6 text-center">
        <div className="text-3xl mb-2">🔐</div>
        <h1 className="font-mono font-bold text-lg">GROWTH COMMAND CENTER</h1>
        <p className="text-text-dim text-sm mt-1">Recruiter / admin demo access only.</p>
        <form onSubmit={tryUnlock} className="mt-5 space-y-3 text-left">
          <input
            className="input"
            type="password"
            placeholder="Demo access code"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setErr(false);
            }}
            autoFocus
          />
          {err && <p className="text-xs text-[var(--color-neon-red)]">Incorrect code. Hint: see README demo credentials.</p>}
          <button className="btn-primary w-full text-sm">Unlock Dashboard</button>
        </form>
        <p className="text-[11px] text-text-dim mt-4">Demo code: <code className="font-mono">growth2026</code></p>
      </div>
    </div>
  );
}
