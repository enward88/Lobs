import { AgentAction } from "../lib/agentEngine";

const TYPE_COLORS: Record<string, string> = {
  mint: "#aa55ff",
  feed: "#00ff88",
  battle: "#00ffd5",
  evolve: "#ffcc00",
  wager: "#00aaff",
  error: "#ff4466",
  info: "#6b7280",
};

const TYPE_ICONS: Record<string, string> = {
  mint: "\u25C9",
  feed: "\u2665",
  battle: "\u2694",
  evolve: "\u2B06",
  wager: "\u25C8",
  error: "\u26A0",
  info: "\u2022",
};

export function AgentLog({ actions }: { actions: AgentAction[] }) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-abyss-600 text-xs tracking-wider">
        No activity yet. Start your agent to begin.
      </div>
    );
  }

  return (
    <div className="divide-y divide-abyss-700/10 max-h-[400px] overflow-y-auto">
      {actions.map((action) => {
        const color = TYPE_COLORS[action.type] || "#6b7280";
        const icon = TYPE_ICONS[action.type] || "\u2022";
        const time = new Date(action.timestamp);
        const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        return (
          <div
            key={action.id}
            className="px-4 py-2.5 flex items-start gap-3"
            style={{ opacity: action.success ? 1 : 0.6 }}
          >
            <span
              className="text-[10px] font-mono flex-shrink-0 mt-0.5"
              style={{ color: "rgba(107, 114, 128, 0.6)" }}
            >
              {timeStr}
            </span>
            <span
              className="text-xs flex-shrink-0 mt-0.5"
              style={{ color, filter: `drop-shadow(0 0 4px ${color}44)` }}
            >
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-white">{action.description}</span>
              {action.txSignature && (
                <a
                  href={`https://solscan.io/tx/${action.txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[9px] font-mono mt-0.5 hover:underline"
                  style={{ color: `${color}88` }}
                >
                  {action.txSignature.slice(0, 20)}...
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
