import { Link } from "react-router-dom";
import { LobAccount } from "../hooks/useLobs";
import { CreatureArt } from "./CreatureArt";
import {
  SPECIES_NAME,
  SPECIES_FAMILY,
  FAMILY_COLOR,
  STAGE_NAME,
  EVOLUTION_THRESHOLDS,
} from "../lib/program";

interface Props {
  lob: LobAccount;
}

export function LobCard({ lob }: Props) {
  const speciesName = SPECIES_NAME[lob.species] || "Unknown";
  const stageName = STAGE_NAME[lob.evolutionStage] || "Unknown";
  const totalBattles = lob.battlesWon + lob.battlesLost;
  const winRate =
    totalBattles > 0
      ? ((lob.battlesWon / totalBattles) * 100).toFixed(0)
      : "\u2014";

  const xpForNext =
    lob.evolutionStage < 3 ? EVOLUTION_THRESHOLDS[lob.evolutionStage] : null;
  const xpProgress =
    xpForNext !== null ? Math.min((lob.xp / xpForNext) * 100, 100) : 100;

  const moodClass =
    lob.mood >= 60 ? "stat-mood-high" : lob.mood >= 30 ? "stat-mood-mid" : "stat-mood-low";

  return (
    <Link
      to={`/lob/${lob.address}`}
      className="group block rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 hover-glow glow-border transition-all duration-300 hover:bg-abyss-900/50"
    >
      {/* Header: creature art + name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <CreatureArt species={lob.species} size="sm" animate={false} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{lob.name}</h3>
            {!lob.isAlive && (
              <span className="text-[9px] bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded-full border border-red-800/30">
                DEAD
              </span>
            )}
          </div>
          <p className="text-[11px] text-abyss-400 mt-0.5">
            {speciesName}
            <span className="text-abyss-600 mx-1">/</span>
            <span style={{ color: FAMILY_COLOR[SPECIES_FAMILY[lob.species]] || "#999" }}>
              {SPECIES_FAMILY[lob.species]}
            </span>
            <span className="text-abyss-600 mx-1">/</span>
            {stageName}
          </p>
          {totalBattles > 0 && (
            <p className="text-[10px] text-abyss-500 mt-1 font-mono">
              {lob.battlesWon}W {lob.battlesLost}L &middot; {winRate}%
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <StatPill label="STR" value={lob.strength} barClass="stat-str" />
        <StatPill label="VIT" value={lob.vitality} barClass="stat-vit" />
        <StatPill label="SPD" value={lob.speed} barClass="stat-spd" />
        <StatPill label="LCK" value={lob.luck} barClass="stat-lck" />
      </div>

      {/* Mood */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-abyss-500 uppercase tracking-wider">Mood</span>
          <span className="text-[10px] text-abyss-400 font-mono">{lob.mood}</span>
        </div>
        <div className="h-1 bg-abyss-800/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${moodClass} transition-all duration-500`}
            style={{ width: `${lob.mood}%` }}
          />
        </div>
      </div>

      {/* XP */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-abyss-500 uppercase tracking-wider">XP</span>
          <span className="text-[10px] text-abyss-400 font-mono">
            {lob.xp}{xpForNext !== null ? `/${xpForNext}` : ""}
          </span>
        </div>
        <div className="h-1 bg-abyss-800/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full stat-xp transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function StatPill({
  label,
  value,
  barClass,
}: {
  label: string;
  value: number;
  barClass: string;
}) {
  const pct = Math.min((value / 20) * 100, 100);
  return (
    <div className="bg-abyss-800/30 rounded-lg px-2.5 py-2">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] text-abyss-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-semibold text-abyss-200 font-mono">{value}</span>
      </div>
      <div className="h-0.5 bg-abyss-800/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
