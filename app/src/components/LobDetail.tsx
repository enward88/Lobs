import { useParams, Link } from "react-router-dom";
import { useLobs } from "../hooks/useLobs";
import {
  SPECIES_EMOJI,
  SPECIES_NAME,
  STAGE_NAME,
  EVOLUTION_THRESHOLDS,
  EVOLUTION_MULTIPLIERS,
} from "../lib/program";

export function LobDetail() {
  const { address } = useParams<{ address: string }>();
  const { lobs, loading, error } = useLobs();

  if (loading) {
    return (
      <div className="text-center py-20 text-abyss-400 animate-pulse">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-400">{error}</div>;
  }

  const lob = lobs.find((l) => l.address.toString() === address);

  if (!lob) {
    return (
      <div className="text-center py-20 text-abyss-400">
        <p className="text-xl mb-4">Lob not found</p>
        <Link to="/" className="text-abyss-500 hover:text-white underline">
          Back to all Lobs
        </Link>
      </div>
    );
  }

  const emoji = SPECIES_EMOJI[lob.species] || "❓";
  const speciesName = SPECIES_NAME[lob.species] || "Unknown";
  const stageName = STAGE_NAME[lob.evolutionStage] || "Unknown";
  const totalBattles = lob.battlesWon + lob.battlesLost;
  const winRate =
    totalBattles > 0
      ? ((lob.battlesWon / totalBattles) * 100).toFixed(1)
      : "N/A";

  const mult = EVOLUTION_MULTIPLIERS[lob.evolutionStage];
  const effStr = Math.floor((lob.strength * mult * lob.mood) / 1_000_000);
  const effVit = Math.floor((lob.vitality * mult * 10) / 10000);
  const effSpd = Math.floor((lob.speed * mult) / 10000);

  const xpForNext =
    lob.evolutionStage < 3
      ? EVOLUTION_THRESHOLDS[lob.evolutionStage]
      : null;
  const xpProgress =
    xpForNext !== null ? Math.min((lob.xp / xpForNext) * 100, 100) : 100;
  const canEvolve = xpForNext !== null && lob.xp >= xpForNext;

  const lastFedDate = new Date(lob.lastFed * 1000);
  const now = Date.now();
  const timeSinceFed = Math.floor((now - lob.lastFed * 1000) / 1000);
  const feedReady = timeSinceFed >= 3600;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="text-sm text-abyss-400 hover:text-white mb-6 inline-block"
      >
        &larr; All Lobs
      </Link>

      {/* Header */}
      <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{emoji}</span>
          <div>
            <h1 className="text-3xl font-bold">{lob.name}</h1>
            <p className="text-abyss-400">
              {speciesName} · {stageName}
              {!lob.isAlive && (
                <span className="ml-2 text-red-400">(Dead)</span>
              )}
            </p>
            <p className="text-xs text-abyss-500 mt-1 font-mono">
              {lob.address.toString()}
            </p>
          </div>
        </div>

        {canEvolve && (
          <div className="bg-abyss-700/50 border border-abyss-600 rounded-lg px-4 py-2 text-sm text-abyss-200">
            Ready to evolve to{" "}
            <span className="font-semibold">
              {STAGE_NAME[lob.evolutionStage + 1]}
            </span>
            !
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl p-4">
          <h2 className="text-xs text-abyss-500 uppercase mb-3">Base Stats</h2>
          <div className="space-y-2">
            <StatRow label="Strength" value={lob.strength} color="text-red-400" max={20} />
            <StatRow label="Vitality" value={lob.vitality} color="text-green-400" max={20} />
            <StatRow label="Speed" value={lob.speed} color="text-blue-400" max={20} />
          </div>
        </div>

        <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl p-4">
          <h2 className="text-xs text-abyss-500 uppercase mb-3">
            Effective Stats
          </h2>
          <p className="text-[10px] text-abyss-600 mb-2">
            Base × {(mult / 10000).toFixed(1)}x evo
            {lob.evolutionStage > 0 ? ` (${stageName})` : ""}
          </p>
          <div className="space-y-2">
            <StatRow label="Strength" value={effStr} color="text-red-400" max={40} />
            <StatRow label="Vitality" value={effVit} color="text-green-400" max={40} />
            <StatRow label="Speed" value={effSpd} color="text-blue-400" max={40} />
          </div>
        </div>
      </div>

      {/* Mood & XP */}
      <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-abyss-400">Mood</span>
              <span
                className={
                  lob.mood >= 60
                    ? "text-green-400"
                    : lob.mood >= 30
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {lob.mood}/100
              </span>
            </div>
            <div className="h-2 bg-abyss-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  lob.mood >= 60
                    ? "bg-green-500"
                    : lob.mood >= 30
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${lob.mood}%` }}
              />
            </div>
            <p className="text-xs text-abyss-500 mt-1">
              Last fed: {lastFedDate.toLocaleString()}
              {feedReady ? (
                <span className="text-green-400 ml-1">(Ready)</span>
              ) : (
                <span className="text-abyss-600 ml-1">(Cooldown)</span>
              )}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-abyss-400">XP</span>
              <span className="text-abyss-300">
                {lob.xp}
                {xpForNext !== null && ` / ${xpForNext}`}
              </span>
            </div>
            <div className="h-2 bg-abyss-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-abyss-500 rounded-full"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            {xpForNext !== null && (
              <p className="text-xs text-abyss-500 mt-1">
                {xpForNext - lob.xp} XP to {STAGE_NAME[lob.evolutionStage + 1]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Battle Record */}
      <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl p-4 mb-6">
        <h2 className="text-xs text-abyss-500 uppercase mb-3">
          Battle Record
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">
              {lob.battlesWon}
            </div>
            <div className="text-xs text-abyss-500">Wins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {lob.battlesLost}
            </div>
            <div className="text-xs text-abyss-500">Losses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-abyss-300">{winRate}%</div>
            <div className="text-xs text-abyss-500">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Owner */}
      <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl p-4">
        <h2 className="text-xs text-abyss-500 uppercase mb-2">Owner</h2>
        <p className="font-mono text-sm text-abyss-300 break-all">
          {lob.owner.toString()}
        </p>
        <p className="text-xs text-abyss-500 mt-1">
          Lob #{lob.mintIndex}
        </p>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
  max,
}: {
  label: string;
  value: number;
  color: string;
  max: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-abyss-500 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-abyss-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color.replace("text-", "bg-")}`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
      <span className={`text-sm font-medium w-8 text-right ${color}`}>
        {value}
      </span>
    </div>
  );
}
