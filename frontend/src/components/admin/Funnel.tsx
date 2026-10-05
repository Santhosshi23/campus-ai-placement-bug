import { motion } from "framer-motion";

export default function Funnel({ steps }: { steps: { step: string; count: number; pct_of_top: number }[] }) {
  const max = steps[0]?.count || 1;
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={s.step}>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>{s.step}</span>
            <span className="text-text-dim">
              {s.count.toLocaleString()} ({s.pct_of_top}%)
            </span>
          </div>
          <div className="progress-track" style={{ height: 14 }}>
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(s.count / max) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
