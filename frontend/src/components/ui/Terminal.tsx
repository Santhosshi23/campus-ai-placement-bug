import type { ReactNode } from "react";

export default function Terminal({
  title = "placement_system.sh",
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`terminal overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1c2334] bg-[#0b0e17]">
        <span className="terminal-dot bg-[#ff5f56]" />
        <span className="terminal-dot bg-[#ffbd2e]" />
        <span className="terminal-dot bg-[#27c93f]" />
        <span className="ml-2 text-xs text-text-dim truncate">{title}</span>
      </div>
      <div className="p-4 sm:p-5 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
