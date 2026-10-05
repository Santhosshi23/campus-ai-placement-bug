import { useState } from "react";

export default function ShareBox({ referralCode, referralLink }: { referralCode: string; referralLink: string }) {
  const [copied, setCopied] = useState(false);

  const message = `Hey! I just took the 60-second Placement Bug Challenge and unlocked a free NxtWave AI workshop 🐞🚀\n\nOur college is competing in the CampusAI League — join through my link, see your own AI score, and help us climb the leaderboard: ${referralLink}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      /* fallback below */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "CampusAI League", text: message, url: referralLink });
      } catch {
        /* user cancelled */
      }
    }
  };

  return (
    <div className="panel p-4 sm:p-5">
      <div className="font-mono text-xs text-text-dim mb-2">OR JUST SHARE YOUR CODE</div>
      <div className="flex items-center justify-between gap-3 bg-black/30 border border-[var(--color-border)] rounded-lg px-4 py-3 mb-4">
        <span className="font-mono text-lg sm:text-xl font-bold text-glow-green tracking-wider break-all">{referralCode}</span>
      </div>

      <div className="font-mono text-xs text-text-dim mb-2">SHARE YOUR LINK</div>
      <div className="flex items-center gap-2 bg-black/30 border border-[var(--color-border)] rounded-lg px-3 py-2.5 mb-4">
        <input
          readOnly
          value={referralLink}
          aria-label="Referral link"
          className="bg-transparent flex-1 min-w-0 text-sm font-mono text-text-dim outline-none"
        />
        <button onClick={copyLink} className="btn-ghost !py-1.5 !px-3 text-xs shrink-0">
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="btn-primary !bg-[#25D366] !shadow-none text-sm flex items-center gap-2"
        >
          📲 Share on WhatsApp
        </a>
        <a href={twitterHref} target="_blank" rel="noreferrer" className="btn-ghost text-sm">
          Share elsewhere
        </a>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button onClick={nativeShare} className="btn-ghost text-sm">
            More options
          </button>
        )}
      </div>
    </div>
  );
}
