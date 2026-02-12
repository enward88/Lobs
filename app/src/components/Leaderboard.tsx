import { useState } from "react";
import { Link } from "react-router-dom";
import { useLobs, LobAccount } from "../hooks/useLobs";
import { SPECIES_EMOJI, SPECIES_NAME, STAGE_NAME } from "../lib/program";

type SortKey = "xp" | "battlesWon" | "evolutionStage" | "strength" | "mood";

export function Leaderboard() {
  const { lobs, loading, error } = useLobs();
  const [sortBy, setSortBy] = useState<SortKey>("xp");

  if (loading) {
    return (
      <div className="text-center py-20 text-abyss-400 animate-pulse">
        Loading leaderboard...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-400">{error}</div>;
  }

  const sorted = [...lobs].sort((a, b) => {
    switch (sortBy) {
      case "xp":
        return b.xp - a.xp;
      case "battlesWon":
        return b.battlesWon - a.battlesWon;
      case "evolutionStage":
        return b.evolutionStage - a.evolutionStage || b.xp - a.xp;
      case "strength":
        return b.strength - a.strength;
      case "mood":
        return b.mood - a.mood;
      default:
        return 0;
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="flex gap-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sortBy === opt.key
                  ? "bg-abyss-700 text-white"
                  : "text-abyss-400 hover:text-white hover:bg-abyss-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-abyss-400">
          No Lobs to rank yet
        </div>
      ) : (
        <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-abyss-800 text-xs text-abyss-400 uppercase">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Lob</th>
                <th className="px-4 py-3 text-center">Stage</th>
                <th className="px-4 py-3 text-center">STR</th>
                <th className="px-4 py-3 text-center">VIT</th>
                <th className="px-4 py-3 text-center">SPD</th>
                <th className="px-4 py-3 text-center">XP</th>
                <th className="px-4 py-3 text-center">W/L</th>
                <th className="px-4 py-3 text-center">Mood</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lob, i) => (
                <LeaderboardRow key={lob.address.toString()} lob={lob} rank={i + 1} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LeaderboardRow({ lob, rank }: { lob: LobAccount; rank: number }) {
  const emoji = SPECIES_EMOJI[lob.species] || "❓";
  const speciesName = SPECIES_NAME[lob.species] || "Unknown";
  const stageName = STAGE_NAME[lob.evolutionStage] || "?";

  const rankDisplay =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;

  return (
    <tr className="border-b border-abyss-800/50 hover:bg-abyss-800/30 transition-colors">
      <td className="px-4 py-3 text-sm">{rankDisplay}</td>
      <td className="px-4 py-3">
        <Link
          to={`/lob/${lob.address.toString()}`}
          className="flex items-center gap-2 hover:text-abyss-300 transition-colors"
        >
          <span className="text-xl">{emoji}</span>
          <div>
            <div className="font-medium text-sm">{lob.name}</div>
            <div className="text-xs text-abyss-500">{speciesName}</div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-center text-sm text-abyss-300">
        {stageName}
      </td>
      <td className="px-4 py-3 text-center text-sm text-red-400">
        {lob.strength}
      </td>
      <td className="px-4 py-3 text-center text-sm text-green-400">
        {lob.vitality}
      </td>
      <td className="px-4 py-3 text-center text-sm text-blue-400">
        {lob.speed}
      </td>
      <td className="px-4 py-3 text-center text-sm font-medium">{lob.xp}</td>
      <td className="px-4 py-3 text-center text-sm text-abyss-300">
        {lob.battlesWon}/{lob.battlesLost}
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`text-sm ${
            lob.mood >= 60
              ? "text-green-400"
              : lob.mood >= 30
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {lob.mood}
        </span>
      </td>
    </tr>
  );
}
