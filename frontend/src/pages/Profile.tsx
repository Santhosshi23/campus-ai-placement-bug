import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { LoadingState, ErrorState } from "../components/ui/StateViews";
import StatCard from "../components/ui/StatCard";
import ShareBox from "../components/ShareBox";
import ShareCardPanel from "../components/ShareCardPanel";
import SquadList from "../components/SquadList";
import ProgressBar from "../components/ui/ProgressBar";
import type { UserProfile } from "../types";
import { PROFILE_META } from "../data/profiles";

export default function Profile() {
  const { id } = useParams();
  const { data: user, loading, error, reload } = useFetch<UserProfile>(`/user/${id}`, [id]);

  if (loading) return <LoadingState label="Loading profile..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!user) return null;

  const meta = PROFILE_META[user.profile_type] ?? PROFILE_META["THE EXPLORER"];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="panel p-6 sm:p-8 text-center">
        <div className="text-4xl mb-2">{meta.emoji}</div>
        <h1 className="text-xl sm:text-2xl font-bold font-mono uppercase">{user.name}</h1>
        <p className="text-glow-green font-mono mt-1">{user.profile_type}</p>
        <p className="text-text-dim text-sm mt-2">
          {user.branch} · Class of {user.graduation_year} ·{" "}
          <Link to={`/college/${user.college_id}`} className="underline hover:text-white">
            {user.college}
          </Link>
        </p>
        <div className="max-w-xs mx-auto mt-5">
          <ProgressBar pct={user.ai_score} label="AI SCORE" sublabel={`${user.ai_score}/100`} height={14} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <StatCard label="College Rank" value={`#${user.college_rank ?? "–"}`} accent="cyan" />
        <StatCard label="Your Rank" value={`#${user.personal_rank ?? "–"}`} accent="green" />
        <StatCard label="Referrals" value={user.successful_referrals} accent="pink" />
        <StatCard label="Conversion" value={`${user.referral_conversion_pct}%`} accent="amber" />
      </div>

      <div className="mt-6 space-y-4">
        <ShareCardPanel
          data={{
            name: user.name,
            college: user.college,
            profileType: user.profile_type,
            aiScore: user.ai_score,
            referralCode: user.referral_code,
          }}
          referralLink={user.referral_link}
        />
        <ShareBox referralCode={user.referral_code} referralLink={user.referral_link} />
        <SquadList userId={user.id} />
      </div>

      {user.next_badge && (
        <div className="panel p-5 mt-6 text-center">
          <p className="font-mono text-xs text-text-dim">NEXT BADGE</p>
          <p className="mt-1 font-semibold">
            {user.next_badge.emoji} {user.next_badge.remaining} more referral{user.next_badge.remaining === 1 ? "" : "s"} →{" "}
            {user.next_badge.name}
          </p>
        </div>
      )}

      <div className="panel p-5 sm:p-6 mt-6">
        <h2 className="font-mono text-sm text-text-dim mb-4">BADGES</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {user.badges.map((b) => (
            <div
              key={b.code}
              className={`panel p-3 text-center ${b.unlocked ? "border-[var(--color-neon-green)]/50" : "opacity-50"}`}
            >
              <div className="text-2xl">{b.unlocked ? b.emoji : "🔒"}</div>
              <p className="text-xs font-semibold mt-1">{b.name}</p>
              <p className="text-[10px] text-text-dim mt-0.5">{b.requirement}+ referrals</p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel p-5 sm:p-6 mt-6">
        <h2 className="font-mono text-sm text-text-dim mb-3">PROJECT INTERESTS</h2>
        {user.project_interests.length === 0 ? (
          <p className="text-sm text-text-dim">
            No interests saved yet.{" "}
            <Link to="/projects" className="underline hover:text-white">
              Explore AI project ideas →
            </Link>
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {user.project_interests.map((p) => (
              <li key={p.id} className="chip">
                {p.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
