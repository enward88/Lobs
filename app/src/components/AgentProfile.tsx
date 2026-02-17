import { useParams, Link } from "react-router-dom";
import { useLobs } from "../hooks/useLobs";
import { CreatureArt } from "./CreatureArt";
import {
  SPECIES_NAME,
  SPECIES_FAMILY,
  FAMILY_COLOR,
  STAGE_NAME,
} from "../lib/program";
import {
  getCreatureGear,
  gearScore,
  gearScoreLabel,
  totalGearBonuses,
} from "../lib/gear";

export function AgentProfile() {
  const { owner } = useParams<{ owner: string }>();
  const { lobs, loading } = useLobs();

  if (loading) {
    return (
      <div className="flex flex-col items-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-abyss-700/30 border-t-biolume-cyan/60 animate-spin" />
        <p className="text-abyss-500 text-xs mt-4 tracking-wider uppercase">Loading agent...</p>
      </div>
    );
  }

  const creatures = lobs.filter((l) => l.owner === owner);

  if (creatures.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-abyss-400 text-lg mb-4">Agent not found</p>
        <Link to="/" className="text-biolume-cyan text-sm hover:underline">
          Back to the deep
        </Link>
      </div>
    );
  }

  // Aggregate stats
  const totalBattles = creatures.reduce((s, c) => s + c.battlesWon + c.battlesLost, 0);
  const totalWins = creatures.reduce((s, c) => s + c.battlesWon, 0);
  const totalLobs = creatures.reduce((s, c) => s + c.tokensWon - c.tokensLost, 0);
  const totalGearScores = creatures.map((c) => gearScore(getCreatureGear(c.address)));
  const avgGearScore = totalGearScores.length > 0
    ? Math.round(totalGearScores.reduce((a, b) => a + b, 0) / totalGearScores.length)
    : 0;
  const bestGearScore = Math.max(...totalGearScores, 0);
  const overallWinRate = totalBattles > 0 ? ((totalWins / totalBattles) * 100).toFixed(1) : "N/A";

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/"
        className="text-xs text-abyss-500 hover:text-biolume-cyan transition-colors mb-6 inline-block tracking-wider uppercase"
      >
        &larr; Back to the deep
      </Link>

      {/* Agent header */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 mb-6 glow-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-biolume-cyan animate-glow-pulse" />
          <span className="text-[10px] text-abyss-500 uppercase tracking-[0.2em] font-medium">
            Agent Profile
          </span>
        </div>
        <p className="font-mono text-sm text-abyss-200 break-all mb-4">{owner}</p>

        {/* Aggregate stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <AgentStat label="Creatures" value={String(creatures.length)} color="#00ffd5" />
          <AgentStat label="Total Battles" value={String(totalBattles)} color="#00aaff" />
          <AgentStat label="Win Rate" value={`${overallWinRate}%`} color="#00ff88" />
          <AgentStat
            label="Net $LOBS"
            value={`${totalLobs >= 0 ? "+" : ""}${(totalLobs / 1e6).toFixed(0)}`}
            color={totalLobs >= 0 ? "#ffcc00" : "#ff4466"}
          />
          <AgentStat label="Avg Gear Score" value={String(avgGearScore)} color="#aa55ff" />
        </div>
      </div>

      {/* Creature grid */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] text-abyss-500 uppercase tracking-[0.2em] font-medium">
          Creatures
        </span>
        <span className="text-[9px] text-abyss-600 font-mono">
          {creatures.length} total
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {creatures.map((creature) => {
          const gear = getCreatureGear(creature.address);
          const score = gearScore(gear);
          const scoreInfo = gearScoreLabel(score);
          const bonuses = totalGearBonuses(gear);
          const family = SPECIES_FAMILY[creature.species] || "Unknown";
          const familyColor = FAMILY_COLOR[family] || "#666";
          const cBattles = creature.battlesWon + creature.battlesLost;
          const cRate = cBattles > 0 ? ((creature.battlesWon / cBattles) * 100).toFixed(0) : "—";

          return (
            <Link
              key={creature.address}
              to={`/armory/${creature.address}`}
              className="group block rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-4 hover:bg-abyss-900/50 transition-all duration-300 hover-glow"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <CreatureArt species={creature.species} size="sm" animate={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white truncate group-hover:text-biolume-cyan transition-colors">
                      {creature.name}
                    </h3>
                    {!creature.isAlive && (
                      <span className="text-[8px] bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded-full border border-red-800/30">
                        DEAD
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-abyss-400 mt-0.5">
                    {SPECIES_NAME[creature.species]}
                    <span className="text-abyss-600 mx-1">/</span>
                    <span style={{ color: familyColor }}>{family}</span>
                    <span className="text-abyss-600 mx-1">/</span>
                    {STAGE_NAME[creature.evolutionStage]}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                <MiniStat label="STR" base={creature.strength} bonus={bonuses.str} color="#ff4466" />
                <MiniStat label="VIT" base={creature.vitality} bonus={bonuses.vit} color="#00ff88" />
                <MiniStat label="SPD" base={creature.speed} bonus={bonuses.spd} color="#00aaff" />
                <MiniStat label="LCK" base={creature.luck} bonus={bonuses.lck} color="#ffcc00" />
              </div>

              {/* Footer: battle record + gear score */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-abyss-500 font-mono">
                  {creature.battlesWon}W {creature.battlesLost}L &middot; {cRate}%
                </span>
                {score > 0 && (
                  <span className="text-[9px] font-mono font-semibold" style={{ color: scoreInfo.color }}>
                    GS {score}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AgentStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center p-3 rounded-xl bg-abyss-800/20 border border-abyss-700/10">
      <div className="text-lg font-bold font-mono" style={{ color }}>
        {value}
      </div>
      <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function MiniStat({
  label,
  base,
  bonus,
  color,
}: {
  label: string;
  base: number;
  bonus: number;
  color: string;
}) {
  return (
    <div className="bg-abyss-800/30 rounded-lg px-2 py-1.5 text-center">
      <div className="text-[8px] text-abyss-500 uppercase tracking-wider">{label}</div>
      <div className="text-[11px] font-mono font-semibold text-abyss-200">
        {base}
        {bonus > 0 && (
          <span style={{ color, fontSize: "9px" }} className="ml-0.5">
            +{bonus}
          </span>
        )}
      </div>
    </div>
  );
}
