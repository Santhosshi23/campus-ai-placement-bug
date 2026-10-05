import { forwardRef } from "react";
import { PROFILE_META } from "../data/profiles";

export interface ShareCardData {
  name: string;
  college: string;
  profileType: string;
  aiScore: number;
  referralCode: string;
}

/**
 * A Spotify-Wrapped-style vertical result card designed to be captured as a
 * PNG (see useShareCardImage) and shared to WhatsApp/Instagram/LinkedIn.
 * Visual virality > a plain text link.
 */
const ShareCard = forwardRef<HTMLDivElement, { data: ShareCardData }>(({ data }, ref) => {
  const meta = PROFILE_META[data.profileType] ?? PROFILE_META["THE EXPLORER"];
  const firstName = data.name.split(" ")[0];

  return (
    <div
      ref={ref}
      style={{
        width: 540,
        height: 780,
        background: "radial-gradient(circle at 20% 0%, #103323 0%, #05060a 55%)",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        color: "#e7ecf5",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: 40,
        boxSizing: "border-box",
      }}
    >
      {/* grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(57,255,143,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(57,255,143,0.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: 999,
          background: "#39e8ff",
          opacity: 0.18,
          filter: "blur(90px)",
        }}
      />

      {/* header */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 22 }}>
        <span>🐞</span>
        <span>
          Campus<span style={{ color: "#39ff8f" }}>AI</span>
        </span>
      </div>
      <div style={{ position: "relative", fontSize: 11, color: "#8893a8", marginTop: 4, letterSpacing: 1 }}>
        PLACEMENT SYSTEM DIAGNOSIS
      </div>

      {/* main */}
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 64 }}>{meta.emoji}</div>
        <div style={{ fontSize: 13, color: "#8893a8", marginTop: 10 }}>{firstName.toUpperCase()}'S AI PROFILE</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#39ff8f", marginTop: 6, textShadow: "0 0 18px rgba(57,255,143,0.55)" }}>
          {data.profileType}
        </div>

        <div
          style={{
            marginTop: 30,
            width: 220,
            height: 220,
            borderRadius: 999,
            border: "10px solid #141a28",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg width="220" height="220" style={{ position: "absolute", top: -10, left: -10, transform: "rotate(-90deg)" }}>
            <circle cx="110" cy="110" r="100" stroke="#141a28" strokeWidth="10" fill="none" />
            <circle
              cx="110"
              cy="110"
              r="100"
              stroke="#39ff8f"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(data.aiScore / 100) * 628} 628`}
            />
          </svg>
          <div>
            <div style={{ fontSize: 46, fontWeight: 800 }}>{data.aiScore}</div>
            <div style={{ fontSize: 12, color: "#8893a8", marginTop: -4 }}>AI SCORE / 100</div>
          </div>
        </div>

        <div style={{ marginTop: 26, fontSize: 14, color: "#c7ceda", maxWidth: 380, lineHeight: 1.5 }}>
          Think you can beat my score? 👀
        </div>
      </div>

      {/* footer */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            border: "1px solid #1f2636",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: "#8893a8" }}>CAMPUS</div>
            <div style={{ fontSize: 14, fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {data.college}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#8893a8" }}>JOIN VIA</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#39e8ff" }}>{data.referralCode}</div>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "#566077", marginTop: 12 }}>
          Take the Placement Bug Challenge · NxtWave AI Workshop · campusai.app
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
export default ShareCard;
