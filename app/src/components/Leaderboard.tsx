import { useState } from "react";
import { Link } from "react-router-dom";
import { useLobs, LobAccount } from "../hooks/useLobs";
import { CreatureDot } from "./CreatureArt";
import { SPECIES_NAME, STAGE_NAME } from "../lib/program";

type SortKey = "xp" | "battlesWon" | "evolutionStage" | "strength" | "mood";

export function Leaderboard() {
  const { lobs, loading } = useLobs();
  const [sortBy, setSortBy] = useState<SortKey>("xp");

  if (loading) {
    return (
      <div className="flex flex-col items-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-abyss-700/30 border-t-biolume-cyan/60 animate-spin" />
        <p className="text-abyss-400 text-sm mt-6 tracking-wider uppercase">Loading rankings...</p>
      </div>
    );
  }

  const sorted = [...lobs].sort((a, b) => {
    switch (sortBy) {
      case "xp": return b.xp - a.xp;
      case "battlesWon": return b.battlesWon - a.battlesWon;
      case "evolutionStage": return b.evolutionStage - a.evolutionStage || b.xp - a.xp;
      case "strength": return b.strength - a.strength;
      case "mood": return b.mood - a.mood;
      default: return 0;
    }
  });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "xp", label: "XP" },
    { key: "battlesWon", label: "Wins" },
    { key: "evolutionStage", label: "Stage" },
    { key: "strength", label: "STR" },
    { key: "mood", label: "Mood" },
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #c5e4ed, #ffcc00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Rankings
          </h1>
          <p className="text-abyss-400 text-sm mt-1">The strongest survive</p>
        </div>
        <div className="flex gap-1 bg-abyss-900/40 rounded-full p-1 border border-abyss-700/20">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-wide transition-all duration-200 ${
                sortBy === opt.key
                  ? "bg-abyss-700/60 text-biolume-cyan"
                  : "text-abyss-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-abyss-500 tracking-wider uppercase text-sm">No creatures to rank yet</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
          <div className="hidden sm:grid grid-cols-[40px_1fr_60px_48px_48px_48px_60px_56px_48px] gap-0 px-5 py-3 border-b border-abyss-700/20">
            {["#", "Lob", "Stage", "STR", "VIT", "SPD", "XP", "W/L", "Mood"].map((h) => (
              <span key={h} className="text-[9px] text-abyss-500 uppercase tracking-wider font-medium text-center first:text-left [&:nth-child(2)]:text-left">
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-abyss-700/10">
            {sorted.map((lob, i) => (
              <RankRow key={lob.address} lob={lob} rank={i + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RankRow({ lob, rank }: { lob: LobAccount; rank: number }) {
  const speciesName = SPECIES_NAME[lob.species] || "?";
  const stageName = STAGE_NAME[lob.evolutionStage] || "?";

  const rankColors: Record<number, string> = {
    1: "text-biolume-gold",
    2: "text-abyss-200",
    3: "text-orange-400",
  };

  return (
    <Link
      to={`/lob/${lob.address}`}
      className="grid grid-cols-[40px_1fr_60px_48px_48px_48px_60px_56px_48px] gap-0 px-5 py-3 items-center hover:bg-abyss-800/20 transition-colors duration-200"
    >
      <span className={`text-sm font-mono font-semibold ${rankColors[rank] || "text-abyss-500"}`}>
        {rank}
      </span>
      <div className="flex items-center gap-2.5 min-w-0">
        <CreatureDot species={lob.species} />
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate">{lob.name}</div>
          <div className="text-[10px] text-abyss-500">{speciesName}</div>
        </div>
      </div>
      <span className="text-[11px] text-abyss-300 text-center">{stageName}</span>
      <span className="text-[11px] text-red-400 font-mono text-center">{lob.strength}</span>
      <span className="text-[11px] text-green-400 font-mono text-center">{lob.vitality}</span>
      <span className="text-[11px] text-blue-400 font-mono text-center">{lob.speed}</span>
      <span className="text-[11px] text-biolume-purple font-mono font-medium text-center">{lob.xp}</span>
      <span className="text-[10px] text-abyss-400 font-mono text-center">
        {lob.battlesWon}/{lob.battlesLost}
      </span>
      <span className={`text-[11px] font-mono text-center ${
        lob.mood >= 60 ? "text-green-400" : lob.mood >= 30 ? "text-yellow-400" : "text-red-400"
      }`}>
        {lob.mood}
      </span>
    </Link>
  );
}
