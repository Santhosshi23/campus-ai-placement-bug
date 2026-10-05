import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import ShareCard, { type ShareCardData } from "./ShareCard";

const CARD_W = 540;
const CARD_H = 780;
const PREVIEW_W = 240;

export default function ShareCardPanel({ data, referralLink }: { data: ShareCardData; referralLink: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<"downloaded" | "shared" | null>(null);

  const challengeMessage = `I just scored ${data.aiScore}/100 on the Placement Bug Challenge and got tagged "${data.profileType}" 🐞\n\nThink you can beat my score? Take the 60-second challenge (it unlocks a free NxtWave AI workshop + our college is racing to the top of the CampusAI League) 🚀\n\n${referralLink}`;

  const generatePng = async (): Promise<string> => {
    if (!cardRef.current) throw new Error("Card not ready");
    // small delay helps ensure fonts/SVG are painted before capture
    await new Promise((r) => setTimeout(r, 50));
    return toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
  };

  const download = async () => {
    setBusy(true);
    try {
      const dataUrl = await generatePng();
      const link = document.createElement("a");
      link.download = `campusai-score-card-${data.referralCode}.png`;
      link.href = dataUrl;
      link.click();
      setDone("downloaded");
      setTimeout(() => setDone(null), 2500);
    } catch {
      /* ignore — user can still use the text share buttons below */
    } finally {
      setBusy(false);
    }
  };

  const shareCard = async () => {
    setBusy(true);
    try {
      const dataUrl = await generatePng();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "campusai-score-card.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "CampusAI — Placement Bug Challenge",
          text: challengeMessage,
        });
        setDone("shared");
      } else {
        // fallback: download the image, then open WhatsApp with the challenge text
        const link = document.createElement("a");
        link.download = `campusai-score-card-${data.referralCode}.png`;
        link.href = dataUrl;
        link.click();
        window.open(`https://wa.me/?text=${encodeURIComponent(challengeMessage)}`, "_blank");
        setDone("downloaded");
      }
      setTimeout(() => setDone(null), 2500);
    } catch {
      /* user likely cancelled the native share sheet */
    } finally {
      setBusy(false);
    }
  };

  const scale = PREVIEW_W / CARD_W;

  return (
    <div className="panel p-4 sm:p-5">
      <div className="font-mono text-xs text-text-dim mb-3">YOUR SHAREABLE AI SCORE CARD</div>
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
        <div
          className="shrink-0 rounded-xl overflow-hidden border border-[var(--color-border)] shadow-lg"
          style={{ width: PREVIEW_W, height: CARD_H * scale }}
        >
          <div style={{ width: CARD_W, height: CARD_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <ShareCard ref={cardRef} data={data} />
          </div>
        </div>

        <div className="flex-1 w-full">
          <p className="text-sm text-text-dim mb-4">
            Posting your score card gets way more friends to try the challenge than a plain link — people love
            a reason to prove they can beat you. 😏
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={shareCard} disabled={busy} className="btn-primary !bg-[#25D366] !shadow-none text-sm">
              {busy ? "Preparing..." : "📲 Share my Score Card"}
            </button>
            <button onClick={download} disabled={busy} className="btn-ghost text-sm">
              ⬇ Download PNG
            </button>
          </div>
          {done && (
            <p className="text-xs text-glow-green mt-2">
              {done === "shared" ? "Shared! Your friends are about to get challenged. 🔥" : "Saved — attach it to your WhatsApp status or DM it to a friend!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
