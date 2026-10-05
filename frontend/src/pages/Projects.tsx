import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { LoadingState, ErrorState } from "../components/ui/StateViews";
import { api } from "../api/client";
import { useApp } from "../context/AppContext";
import type { Project } from "../types";

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-glow-green",
  Medium: "text-[var(--color-neon-amber)]",
  Hard: "text-[var(--color-neon-red)]",
};

function getInterestedSet(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem("campusai_interests") || "[]"));
  } catch {
    return new Set();
  }
}

export default function Projects() {
  const navigate = useNavigate();
  const { currentUserId, logEvent } = useApp();
  const { data, loading, error, reload } = useFetch<{ projects: Project[] }>("/projects");
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [interested, setInterested] = useState<Set<number>>(getInterestedSet);
  const [category, setCategory] = useState("All");

  const projects = data?.projects ?? [];
  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category)))], [projects]);
  const filtered = category === "All" ? projects : projects.filter((p) => p.category === category);

  const markInterested = async (p: Project) => {
    if (interested.has(p.id)) return;
    const nextSet = new Set(interested).add(p.id);
    setInterested(nextSet);
    localStorage.setItem("campusai_interests", JSON.stringify([...nextSet]));
    setCounts((c) => ({ ...c, [p.id]: (c[p.id] ?? p.interest_count) + 1 }));
    logEvent("project_interest", { project_id: p.id, title: p.title });
    try {
      await api.post(`/projects/${p.id}/interest`, { user_id: currentUserId });
    } catch {
      /* keep optimistic UI even if network hiccups */
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono">What would you build with AI?</h1>
        <p className="text-text-dim mt-2 max-w-xl mx-auto">
          Browse real project ideas across categories final-year students are exploring. Tap a card to register
          interest — no login required.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`chip transition-colors ${category === c ? "border-[var(--color-neon-green)] text-glow-green" : "hover:border-white/30"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <LoadingState label="Loading project ideas..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const count = counts[p.id] ?? p.interest_count;
            const isInterested = interested.has(p.id);
            return (
              <div key={p.id} className="panel p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="chip">{p.category}</span>
                  <span className={`text-xs font-mono ${DIFFICULTY_COLOR[p.difficulty]}`}>{p.difficulty}</span>
                </div>
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="text-sm text-text-dim mt-1.5 flex-1">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.skills.map((s) => (
                    <span key={s} className="chip !text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs font-mono text-glow-cyan">{count} students interested</p>
                <button
                  onClick={() => markInterested(p)}
                  disabled={isInterested}
                  className={`mt-3 text-sm ${isInterested ? "btn-ghost opacity-70" : "btn-primary"}`}
                >
                  {isInterested ? "✓ Marked interested" : "I'M INTERESTED"}
                </button>
                {isInterested && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-text-dim">Want to learn how AI projects like this are built?</p>
                    <button className="btn-ghost text-xs mt-2" onClick={() => navigate("/register")}>
                      JOIN THE WORKSHOP →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
