import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminGate from "../components/admin/AdminGate";
import Funnel from "../components/admin/Funnel";
import StatCard from "../components/ui/StatCard";
import ProgressBar from "../components/ui/ProgressBar";
import { LoadingState, ErrorState } from "../components/ui/StateViews";
import { useFetch } from "../hooks/useFetch";
import type { AnalyticsData, GrowthInsight, CampaignPlan } from "../types";

const PIE_COLORS = ["#39ff8f", "#39e8ff", "#ff4fd8", "#ffb84f", "#7c8cff", "#8893a8"];

function AdminDashboard() {
  const { data: analytics, loading, error, reload } = useFetch<AnalyticsData>("/analytics");
  const { data: insightsData } = useFetch<{ insights: GrowthInsight[]; label: string }>("/growth-insights");
  const { data: plan } = useFetch<CampaignPlan>("/campaign-plan");
  const [activeDay, setActiveDay] = useState(1);

  if (loading) return <LoadingState label="Loading growth telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!analytics) return null;

  const sourceLabels: Record<string, string> = {
    mini_game: "Mini Game",
    referral: "Referrals",
    whatsapp: "WhatsApp",
    college_clubs: "College Clubs",
    direct: "Direct",
    other: "Other",
  };

  const pieData = analytics.acquisition_sources
    .filter((s) => s.registrations > 0)
    .map((s) => ({ name: sourceLabels[s.source] ?? s.source, value: s.registrations }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono">📊 Growth Command Center</h1>
        <span className="chip border-[var(--color-neon-amber)]/40 text-[var(--color-neon-amber)]">{analytics.label}</span>
      </div>
      <p className="text-text-dim mb-8">Live simulation of the push toward 500 workshop registrations.</p>

      {/* 500 target */}
      <div className="panel p-5 sm:p-7 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 className="font-mono font-bold">500 REGISTRATION MISSION</h2>
          <span className="font-mono text-glow-green text-lg">
            {analytics.current} / {analytics.target}
          </span>
        </div>
        <ProgressBar pct={analytics.progress_pct} height={18} />
        <p className="text-sm text-text-dim mt-2">{analytics.remaining} registrations to go</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Conversion Rate" value={`${analytics.conversion_rate}%`} sub="visitors → registered" accent="green" />
        <StatCard label="Game Completion" value={`${analytics.game_completion_rate}%`} sub="started → finished" accent="cyan" />
        <StatCard label="Referral Rate" value={analytics.referral_rate_per_link} sub="successes / link" accent="pink" />
        <StatCard label="Colleges Active" value={analytics.total_colleges} sub="competing campuses" accent="amber" />
        <StatCard label="Top College" value={analytics.top_college ?? "–"} accent="green" />
        <StatCard label="Top Referrer" value={analytics.top_referrer ?? "–"} accent="cyan" />
        <StatCard label="Referral Links" value={analytics.referral_performance.total_referral_links} accent="pink" />
        <StatCard label="Project Interests" value={analytics.project_interest_total} accent="amber" />
      </div>

      {/* charts row */}
      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="panel p-5">
          <h2 className="font-mono text-sm text-text-dim mb-4">REGISTRATION GROWTH (7 DAYS)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics.daily_growth}>
              <CartesianGrid stroke="#1f2636" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#8893a8" fontSize={11} />
              <YAxis stroke="#8893a8" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0b0e17", border: "1px solid #1f2636", borderRadius: 8 }} />
              <Line type="monotone" dataKey="registrations" stroke="#39ff8f" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-5">
          <h2 className="font-mono text-sm text-text-dim mb-4">ACQUISITION SOURCE DISTRIBUTION</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0b0e17", border: "1px solid #1f2636", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1 text-xs text-text-dim">
            {pieData.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {p.name} ({p.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* funnel */}
      <div className="panel p-5 sm:p-7 mb-8">
        <h2 className="font-mono text-sm text-text-dim mb-4">REGISTRATION FUNNEL</h2>
        <Funnel steps={analytics.funnel} />
      </div>

      {/* top colleges + referral performance */}
      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="panel p-5 sm:p-6">
          <h2 className="font-mono text-sm text-text-dim mb-4">TOP COLLEGES</h2>
          <div className="space-y-2">
            {analytics.top_colleges.map((c) => (
              <div key={c.rank} className="flex items-center justify-between text-sm">
                <span>
                  #{c.rank} {c.name}
                </span>
                <span className="font-mono text-glow-cyan">
                  {c.registrations} reg · {c.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <h2 className="font-mono text-sm text-text-dim mb-4">REFERRAL PERFORMANCE</h2>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-text-dim text-xs">Total Links</p>
              <p className="font-mono text-lg">{analytics.referral_performance.total_referral_links}</p>
            </div>
            <div>
              <p className="text-text-dim text-xs">Total Clicks</p>
              <p className="font-mono text-lg">{analytics.referral_performance.total_clicks}</p>
            </div>
            <div>
              <p className="text-text-dim text-xs">Successful Regs</p>
              <p className="font-mono text-lg text-glow-green">{analytics.referral_performance.successful_registrations}</p>
            </div>
            <div>
              <p className="text-text-dim text-xs">Conversion</p>
              <p className="font-mono text-lg text-glow-cyan">{analytics.referral_performance.conversion_rate}%</p>
            </div>
          </div>
          <p className="text-xs font-mono text-text-dim mb-1.5">TOP REFERRERS</p>
          {analytics.referral_performance.top_referrers.map((r, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{r.name}</span>
              <span className="text-glow-pink font-mono">{r.referrals}</span>
            </div>
          ))}
        </div>
      </div>

      {/* growth insights */}
      {insightsData && (
        <div className="panel p-5 sm:p-7 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm text-text-dim">🤖 AI GROWTH INSIGHTS</h2>
            <span className="chip">{insightsData.label}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {insightsData.insights.map((ins, i) => (
              <div key={i} className="panel p-4 bg-white/[0.02]">
                <p className="font-semibold text-sm text-glow-green">{ins.title}</p>
                <p className="text-sm text-text-dim mt-1.5">{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* campaign plan */}
      {plan && (
        <div className="space-y-6">
          <div className="panel p-5 sm:p-7">
            <h2 className="font-mono text-sm text-text-dim mb-1">CAMPAIGN STRATEGY — PRIORITISED CHANNELS</h2>
            <p className="text-xs text-text-dim mb-4">{plan.assumption_note}</p>
            <div className="space-y-3">
              {plan.channels.map((c) => (
                <div key={c.channel} className="panel p-4 bg-white/[0.02]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold">{c.channel}</h3>
                    <span className="chip border-[var(--color-neon-green)]/40 text-glow-green">
                      ~{c.expected_registrations} registrations
                    </span>
                  </div>
                  <p className="text-sm text-text-dim mt-2"><span className="text-white">Why:</span> {c.why}</p>
                  <p className="text-sm text-text-dim mt-1"><span className="text-white">Role:</span> {c.role}</p>
                  <p className="text-sm text-text-dim mt-1"><span className="text-white">Action:</span> {c.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="panel p-5 sm:p-6">
              <h2 className="font-mono text-sm text-text-dim mb-1">₹{plan.budget_inr} BUDGET ALLOCATION</h2>
              <p className="text-xs text-text-dim mb-4">Planning assumptions for this simulation.</p>
              <div className="space-y-3">
                {plan.budget_allocation.map((b) => (
                  <div key={b.item}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{b.item}</span>
                      <span className="font-mono text-glow-amber" style={{ color: "var(--color-neon-amber)" }}>
                        ₹{b.amount_inr}
                      </span>
                    </div>
                    <ProgressBar pct={(b.amount_inr / plan.budget_inr) * 100} />
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5 sm:p-6">
              <h2 className="font-mono text-sm text-text-dim mb-4">{plan.duration_days}-DAY CAMPAIGN TIMELINE</h2>
              <div className="flex gap-1.5 mb-4 flex-wrap">
                {plan.timeline.map((t) => (
                  <button
                    key={t.day}
                    onClick={() => setActiveDay(t.day)}
                    className={`chip ${activeDay === t.day ? "border-[var(--color-neon-green)] text-glow-green" : ""}`}
                  >
                    Day {t.day}
                  </button>
                ))}
              </div>
              {plan.timeline
                .filter((t) => t.day === activeDay)
                .map((t) => (
                  <div key={t.day}>
                    <h3 className="font-semibold">{t.title}</h3>
                    <p className="text-sm text-text-dim mt-1.5">{t.detail}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}
