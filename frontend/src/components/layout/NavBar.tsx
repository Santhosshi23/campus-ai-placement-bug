import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const links = [
  { to: "/projects", label: "AI Projects" },
  { to: "/league", label: "CampusAI League" },
  { to: "/admin", label: "Growth HQ" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { currentUserId } = useApp();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#05060a]/80 border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-mono font-bold text-lg" onClick={() => setOpen(false)}>
          <span aria-hidden="true">🐞</span>
          <span>
            Campus<span className="text-glow-green">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-[var(--color-neon-green)] bg-white/5" : "text-text-dim hover:text-white hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {currentUserId && (
            <NavLink
              to={`/profile/${currentUserId}`}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "text-[var(--color-neon-green)] bg-white/5" : "text-text-dim hover:text-white hover:bg-white/5"
                }`
              }
            >
              My Profile
            </NavLink>
          )}
          <Link to="/debug" className="ml-2 btn-primary text-sm !py-2 !px-4">
            Start Debugging
          </Link>
        </nav>

        <button
          className="md:hidden p-2 text-white"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[var(--color-border)] px-4 py-3 flex flex-col gap-1" aria-label="Mobile">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-dim hover:text-white hover:bg-white/5"
            >
              {l.label}
            </NavLink>
          ))}
          {currentUserId && (
            <NavLink
              to={`/profile/${currentUserId}`}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-dim hover:text-white hover:bg-white/5"
            >
              My Profile
            </NavLink>
          )}
          <Link to="/debug" onClick={() => setOpen(false)} className="btn-primary text-sm text-center mt-2">
            Start Debugging
          </Link>
        </nav>
      )}
    </header>
  );
}
