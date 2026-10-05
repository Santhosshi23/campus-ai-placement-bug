export function LoadingState({ label = "Loading system data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-dim" role="status" aria-live="polite">
      <div className="font-mono text-sm text-glow-green flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-neon-green)] animate-pulse" />
        {label}
      </div>
      <div className="w-56 progress-track">
        <div className="progress-fill animate-pulse" style={{ width: "70%" }} />
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="panel p-8 text-center max-w-md mx-auto my-16" role="alert">
      <div className="text-3xl mb-2">⚠️</div>
      <p className="font-mono text-sm text-[var(--color-neon-red)] mb-1">SYSTEM_ERROR</p>
      <p className="text-text-dim text-sm mb-5">{message}</p>
      {onRetry && (
        <button className="btn-ghost text-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="panel p-8 text-center max-w-md mx-auto my-16">
      <div className="text-3xl mb-2">🛰️</div>
      <p className="font-mono text-sm text-glow-cyan mb-1">{title}</p>
      <p className="text-text-dim text-sm">{message}</p>
    </div>
  );
}
