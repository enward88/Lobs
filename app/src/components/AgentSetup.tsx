import { useState } from "react";
import { generateAgentName } from "../lib/agentNames";
import { AgentStrategy } from "../lib/agentEngine";

interface AgentSetupProps {
  lobsBalance: number;
  onDeploy: (config: { creatureName: string; aggression: AgentStrategy; lobsAmount: number; solAmount: number; maxWager: number }) => void;
  loading: boolean;
}

export function AgentSetup({ lobsBalance, onDeploy, loading }: AgentSetupProps) {
  const [name, setName] = useState(() => generateAgentName());
  const [aggression, setAggression] = useState<AgentStrategy>("balanced");
  const [lobsAmount, setLobsAmount] = useState(200000);
  const [solAmount] = useState(0.01);

  const formatLobs = (n: number) => n.toLocaleString();
  const userLobsWhole = Math.floor(lobsBalance / 1_000_000);
  const maxFund = Math.min(userLobsWhole, 10_000_000);

  return (
    <div className="space-y-5">
      {/* Creature Name */}
      <div>
        <label className="block text-[10px] text-abyss-500 uppercase tracking-[0.2em] mb-2">
          Creature Name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 32))}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white font-mono bg-abyss-900/60 border border-abyss-700/20 focus:border-biolume-cyan/40 focus:outline-none transition-colors"
            placeholder="Name your creature..."
            maxLength={32}
          />
          <button
            onClick={() => setName(generateAgentName())}
            className="px-3 py-2 rounded-xl text-[10px] text-abyss-400 border border-abyss-700/20 hover:text-white hover:border-abyss-700/40 transition-all"
            title="Random name"
          >
            &#x21BB;
          </button>
        </div>
      </div>

      {/* Strategy */}
      <div>
        <label className="block text-[10px] text-abyss-500 uppercase tracking-[0.2em] mb-2">
          Strategy
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: "conservative" as const, label: "Conservative", desc: "Safe wins, low risk", color: "#00ff88" },
            { value: "balanced" as const, label: "Balanced", desc: "Random opponents", color: "#00aaff" },
            { value: "aggressive" as const, label: "Aggressive", desc: "Strongest foes, max XP", color: "#ff4466" },
          ]).map((s) => (
            <button
              key={s.value}
              onClick={() => setAggression(s.value)}
              className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                aggression === s.value
                  ? "border-opacity-40 bg-opacity-10"
                  : "border-abyss-700/15 hover:border-abyss-700/30"
              }`}
              style={
                aggression === s.value
                  ? {
                      borderColor: `${s.color}66`,
                      backgroundColor: `${s.color}11`,
                      boxShadow: `0 0 12px ${s.color}22`,
                    }
                  : {}
              }
            >
              <div
                className="text-xs font-medium"
                style={{ color: aggression === s.value ? s.color : "#9ca3af" }}
              >
                {s.label}
              </div>
              <div className="text-[9px] text-abyss-600 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fund Amount */}
      <div>
        <label className="block text-[10px] text-abyss-500 uppercase tracking-[0.2em] mb-2">
          Fund Amount
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={50000}
            max={maxFund || 1000000}
            step={10000}
            value={lobsAmount}
            onChange={(e) => setLobsAmount(Number(e.target.value))}
            className="flex-1 accent-[#00ffd5]"
          />
          <span className="text-sm font-mono text-biolume-cyan min-w-[100px] text-right">
            {formatLobs(lobsAmount)}
          </span>
        </div>
        <div className="flex justify-between text-[9px] text-abyss-600 mt-1">
          <span>50K $LOBS</span>
          <span>+ {solAmount} SOL for fees</span>
          <span>{formatLobs(maxFund || 1000000)} max</span>
        </div>
        <div className="mt-2 text-[9px] text-abyss-500">
          <span className="text-abyss-600">Covers:</span>{" "}
          {lobsAmount >= 50000 && <span className="text-biolume-cyan">1 mint</span>}
          {lobsAmount >= 60000 && <span> + <span className="text-biolume-green">{Math.floor((lobsAmount - 50000) / 10000)} feeds</span></span>}
        </div>
      </div>

      {/* Deploy Button */}
      <button
        onClick={() => onDeploy({ creatureName: name, aggression, lobsAmount, solAmount, maxWager: 0 })}
        disabled={loading || !name.trim() || lobsAmount < 50000}
        className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wider uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: loading
            ? "rgba(0, 255, 213, 0.1)"
            : "linear-gradient(135deg, rgba(0, 255, 213, 0.15), rgba(0, 170, 255, 0.15))",
          border: "1px solid rgba(0, 255, 213, 0.3)",
          color: "#00ffd5",
          boxShadow: loading ? "none" : "0 0 20px rgba(0, 255, 213, 0.1)",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 border border-biolume-cyan/40 border-t-biolume-cyan rounded-full animate-spin" />
            Deploying...
          </span>
        ) : (
          "Release into the Deep"
        )}
      </button>
    </div>
  );
}
