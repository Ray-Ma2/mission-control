"use client";

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "tasks", label: "Task Board", icon: "◫" },
  { id: "calendar", label: "Calendar", icon: "◷" },
];

export function Sidebar({
  activeView,
  onViewChange,
}: {
  activeView: string;
  onViewChange: (view: string) => void;
}) {
  return (
    <aside className="w-[200px] border-r border-border-glow bg-panel/80 backdrop-blur-sm flex flex-col">
      <div className="px-5 py-3 text-[9px] tracking-[3px] text-text-muted uppercase">
        Modules
      </div>

      <nav className="flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full px-5 py-2.5 flex items-center gap-3 text-left text-[11px] tracking-wider uppercase transition-all ${
              activeView === item.id
                ? "text-cyan bg-cyan/10 border-l-2 border-cyan [text-shadow:0_0_10px_var(--cyan)]"
                : "text-text-dim border-l-2 border-transparent hover:bg-border/20"
            }`}
          >
            <span className="text-sm">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* システム情報 */}
      <div className="px-5 py-4 border-t border-border">
        <div className="text-[9px] tracking-[2px] text-text-muted uppercase mb-2">
          System
        </div>
        <div className="space-y-1">
          {[
            { label: "Convex", value: "Connected", color: "green" },
            { label: "Sync", value: "Active", color: "cyan" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-[10px]">
              <span className="text-text-muted">{item.label}</span>
              <span className={`text-${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
