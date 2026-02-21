"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export function Header() {
  const summary = useQuery(api.tasks.getSummary);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("ja-JP"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-10 border-b border-border-glow bg-gradient-to-b from-[#030710] to-panel px-6 py-3 flex items-center justify-between shadow-[0_0_8px_rgba(0,212,255,0.15)]">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-[6px] text-cyan uppercase [text-shadow:0_0_20px_var(--cyan)]">
          Mission Control
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_var(--green)] animate-pulse-glow" />
          <span className="text-[10px] text-green-dim tracking-wider">
            ALL SYSTEMS NOMINAL
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <span className="text-[11px] text-text-dim tracking-widest tabular-nums">
          {time}
        </span>

        {summary && (
          <div className="flex items-center gap-3">
            <Badge color="cyan" label="Claude" count={summary.claude} />
            <Badge color="purple" label="Ray" count={summary.ray} />
            {summary.waitingRay > 0 && (
              <Badge color="amber" label="確認待ち" count={summary.waitingRay} highlight />
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function Badge({
  color,
  label,
  count,
  highlight,
}: {
  color: "cyan" | "purple" | "amber" | "green";
  label: string;
  count: number;
  highlight?: boolean;
}) {
  const colors = {
    cyan: "bg-cyan/10 border-cyan/40 text-cyan",
    purple: "bg-purple/10 border-purple/40 text-purple",
    amber: "bg-amber/10 border-amber/40 text-amber",
    green: "bg-green/10 border-green/40 text-green",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] tracking-wider border ${colors[color]} ${
        highlight ? "animate-pulse-glow shadow-[0_0_8px_var(--amber)]" : ""
      }`}
    >
      {label}: {count}
    </span>
  );
}
