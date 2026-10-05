import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";

interface SquadMember {
  name: string;
  branch: string;
  profile_type: string;
  joined_at: string;
}

const AVATAR_COLORS = ["#39ff8f", "#39e8ff", "#ff4fd8", "#ffb84f", "#7c8cff"];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SquadList({ userId }: { userId: number }) {
  const { data } = useFetch<{ squad_size: number; members: SquadMember[] }>(`/user/${userId}/squad`, [userId]);

  if (!data) return null;

  return (
    <div className="panel p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono text-xs text-text-dim">YOUR SQUAD</h2>
        <span className="chip border-[var(--color-neon-pink)]/40 text-glow-pink">{data.squad_size} recruited</span>
      </div>

      {data.squad_size === 0 ? (
        <p className="text-sm text-text-dim">
          Nobody's joined through your link yet — be the first to challenge a friend above. Your squad (and
          your college's rank) will show up here the moment they register.
        </p>
      ) : (
        <>
          <div className="flex -space-x-2 mb-4">
            {data.members.slice(0, 8).map((m, i) => (
              <div
                key={i}
                title={m.name}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-[#0b0e17]"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], color: "#06120b" }}
              >
                {initials(m.name)}
              </div>
            ))}
            {data.squad_size > 8 && (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-[#0b0e17] bg-white/10">
                +{data.squad_size - 8}
              </div>
            )}
          </div>
          <ul className="space-y-1.5 text-sm">
            {data.members.slice(0, 5).map((m, i) => (
              <li key={i} className="flex items-center justify-between text-text-dim">
                <span className="text-white">{m.name}</span>
                <span className="chip !text-[10px]">{m.profile_type}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-dim mt-4">
            Every friend you bring in pushes your college up the{" "}
            <Link to="/league" className="underline hover:text-white">
              CampusAI League
            </Link>
            . Who's next?
          </p>
        </>
      )}
    </div>
  );
}
