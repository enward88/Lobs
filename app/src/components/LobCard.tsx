import { Link } from "react-router-dom";
import { LobAccount } from "../hooks/useLobs";
import {
  SPECIES_EMOJI,
  SPECIES_NAME,
  STAGE_NAME,
  EVOLUTION_THRESHOLDS,
} from "../lib/program";

interface Props {
  lob: LobAccount;
}

export function LobCard({ lob }: Props) {
  const emoji = SPECIES_EMOJI[lob.species] || "❓";
  const speciesName = SPECIES_NAME[lob.species] || "Unknown";
  const stageName = STAGE_NAME[lob.evolutionStage] || "Unknown";
  const totalBattles = lob.battlesWon + lob.battlesLost;
  const winRate =
    totalBattles > 0
      ? ((lob.battlesWon / totalBattles) * 100).toFixed(0)
      : "—";

  const xpForNext =
    lob.evolutionStage < 3
      ? EVOLUTION_THRESHOLDS[lob.evolutionStage]
      : null;
  const xpProgress =
    xpForNext !== null ? Math.min((lob.xp / xpForNext) * 100, 100) : 100;

  return (
    <Link
      to={`/lob/${lob.address.toString()}`}
      className="block bg-abyss-900/60 border border-abyss-800 rounded-xl p-4 hover:border-abyss-600 hover:bg-abyss-900/80 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-semibold text-white">{lob.name}</h3>
            <p className="text-xs text-abyss-400">
              {speciesName} · {stageName}
            </p>
          </div>
        </div>
        {!lob.isAlive && (
          <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">
            Dead
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatBadge label="STR" value={lob.strength} color="text-red-400" />
        <StatBadge label="VIT" value={lob.vitality} color="text-green-400" />
        <StatBadge label="SPD" value={lob.speed} color="text-blue-400" />
      </div>

      {/* Mood bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-abyss-400">Mood</span>
          <span className="text-abyss-300">{lob.mood}/100</span>
        </div>
        <div className="h-1.5 bg-abyss-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              lob.mood >= 60
                ? "bg-green-500"
                : lob.mood >= 30
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${lob.mood}%` }}
          />
        </div>
      </div>

      {/* XP progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-abyss-400">XP</span>
          <span className="text-abyss-300">
            {lob.xp}
            {xpForNext !== null && ` / ${xpForNext}`}
          </span>
        </div>
        <div className="h-1.5 bg-abyss-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-abyss-500 rounded-full transition-all"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Battle record */}
      <div className="flex justify-between text-xs text-abyss-400">
        <span>
          {lob.battlesWon}W / {lob.battlesLost}L
        </span>
        <span>{winRate}% win rate</span>
      </div>
    </Link>
  );
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-abyss-800/50 rounded-lg px-2 py-1 text-center">
      <div className="text-[10px] text-abyss-500 uppercase">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}
