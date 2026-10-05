import { motion } from "framer-motion";

export default function ProgressBar({
  pct,
  label,
  sublabel,
  height = 10,
}: {
  pct: number;
  label?: string;
  sublabel?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="w-full">
      {(label || sublabel) && (
        <div className="flex items-center justify-between mb-1.5 font-mono text-xs text-text-dim">
          <span>{label}</span>
          <span>{sublabel ?? `${clamped.toFixed(0)}%`}</span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
