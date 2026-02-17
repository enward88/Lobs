import { useParams, Link } from "react-router-dom";
import { useLobs } from "../hooks/useLobs";
import { CreatureModel3D } from "./CreatureModel3D";
import {
  SPECIES_NAME,
  SPECIES_FAMILY,
  SPECIES_TRAIT,
  FAMILY_COLOR,
  STAGE_NAME,
  EVOLUTION_THRESHOLDS,
  EVOLUTION_MULTIPLIERS,
} from "../lib/program";

export function LobDetail() {
  const { address } = useParams<{ address: string }>();
  const { lobs, loading } = useLobs();

  if (loading) {
    return (
      <div className="flex flex-col items-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-abyss-700/30 border-t-biolume-cyan/60 animate-spin" />
      </div>
    );
  }

  const lob = lobs.find((l) => l.address === address);

  if (!lob) {
    return (
      <div className="text-center py-20">
        <p className="text-abyss-400 text-lg mb-4">Creature not found</p>
        <Link to="/" className="text-biolume-cyan text-sm hover:underline">
          Back to the deep
        </Link>
      </div>
    );
  }

  const speciesName = SPECIES_NAME[lob.species] || "Unknown";
  const stageName = STAGE_NAME[lob.evolutionStage] || "Unknown";
  const totalBattles = lob.battlesWon + lob.battlesLost;
  const winRate = totalBattles > 0 ? ((lob.battlesWon / totalBattles) * 100).toFixed(1) : "N/A";

  const mult = EVOLUTION_MULTIPLIERS[lob.evolutionStage];
  const effStr = Math.floor((lob.strength * mult * lob.mood) / 1_000_000);
  const effVit = Math.floor((lob.vitality * mult * 10) / 10000);
  const effSpd = Math.floor((lob.speed * mult) / 10000);
  const effLck = Math.floor((lob.luck * mult) / 10000);

  const xpForNext = lob.evolutionStage < 3 ? EVOLUTION_THRESHOLDS[lob.evolutionStage] : null;
  const xpProgress = xpForNext !== null ? Math.min((lob.xp / xpForNext) * 100, 100) : 100;
  const canEvolve = xpForNext !== null && lob.xp >= xpForNext;

  const lastFedDate = new Date(lob.lastFed * 1000);
  const timeSinceFed = Math.floor((Date.now() - lob.lastFed * 1000) / 1000);
  const feedReady = timeSinceFed >= 3600;

  const moodClass = lob.mood >= 60 ? "stat-mood-high" : lob.mood >= 30 ? "stat-mood-mid" : "stat-mood-low";

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-xs text-abyss-500 hover:text-biolume-cyan transition-colors mb-6 inline-block tracking-wider uppercase">
        &larr; Back to the deep
      </Link>

      {/* Header card */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-6 mb-5 glow-border">
        <div className="flex items-start gap-6 mb-4">
          <div className="flex-shrink-0">
            <CreatureModel3D species={lob.species} size="lg" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{lob.name}</h1>
              {!lob.isAlive && (
                <span className="text-[9px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full border border-red-800/30 uppercase tracking-wider">
                  Dead
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: FAMILY_COLOR[SPECIES_FAMILY[lob.species]] || "#666" }}
              />
              <p className="text-sm text-abyss-300">
                {speciesName}
                <span className="text-abyss-600 mx-1.5">/</span>
                <span style={{ color: FAMILY_COLOR[SPECIES_FAMILY[lob.species]] || "#999" }}>
                  {SPECIES_FAMILY[lob.species]}
                </span>
                <span className="text-abyss-600 mx-1.5">/</span>
                {stageName}
              </p>
            </div>
            <p className="text-[10px] text-abyss-500 mt-1 italic">
              {SPECIES_TRAIT[lob.species]}
            </p>
            <p className="text-[10px] text-abyss-600 font-mono mt-2 break-all">
              {lob.address}
            </p>
          </div>
        </div>

        {canEvolve && (
          <div
            className="rounded-xl px-4 py-2.5 border"
            style={{
              background: "rgba(0, 255, 213, 0.05)",
              borderColor: "rgba(0, 255, 213, 0.15)",
            }}
          >
            <span className="text-xs text-biolume-cyan">
              Ready to evolve to <span className="font-semibold">{STAGE_NAME[lob.evolutionStage + 1]}</span>
            </span>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Base stats */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-4 font-medium">Base Stats</h2>
          <div className="space-y-3">
            <DetailStatBar label="Strength" value={lob.strength} max={20} barClass="stat-str" />
            <DetailStatBar label="Vitality" value={lob.vitality} max={20} barClass="stat-vit" />
            <DetailStatBar label="Speed" value={lob.speed} max={20} barClass="stat-spd" />
            <DetailStatBar label="Luck" value={lob.luck} max={20} barClass="stat-lck" />
          </div>
        </div>

        {/* Effective stats */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-1 font-medium">Effective Stats</h2>
          <p className="text-[9px] text-abyss-600 mb-4 font-mono">
            {(mult / 10000).toFixed(1)}x evolution modifier
          </p>
          <div className="space-y-3">
            <DetailStatBar label="Strength" value={effStr} max={40} barClass="stat-str" />
            <DetailStatBar label="Vitality" value={effVit} max={40} barClass="stat-vit" />
            <DetailStatBar label="Speed" value={effSpd} max={40} barClass="stat-spd" />
            <DetailStatBar label="Luck" value={effLck} max={40} barClass="stat-lck" />
          </div>
        </div>
      </div>

      {/* Mood + XP */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 mb-5">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">Mood</span>
              <span className={`text-sm font-mono font-semibold ${
                lob.mood >= 60 ? "text-green-400" : lob.mood >= 30 ? "text-yellow-400" : "text-red-400"
              }`}>
                {lob.mood}
              </span>
            </div>
            <div className="h-1.5 bg-abyss-800/60 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full ${moodClass} transition-all duration-500`} style={{ width: `${lob.mood}%` }} />
            </div>
            <p className="text-[10px] text-abyss-600">
              Fed {lastFedDate.toLocaleDateString()} {lastFedDate.toLocaleTimeString()}
              {feedReady ? (
                <span className="text-biolume-cyan ml-1">&middot; Ready</span>
              ) : (
                <span className="text-abyss-700 ml-1">&middot; Cooldown</span>
              )}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">Experience</span>
              <span className="text-sm font-mono font-semibold text-biolume-purple">
                {lob.xp}{xpForNext !== null ? <span className="text-abyss-600">/{xpForNext}</span> : ""}
              </span>
            </div>
            <div className="h-1.5 bg-abyss-800/60 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full stat-xp transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
            {xpForNext !== null && (
              <p className="text-[10px] text-abyss-600">
                {xpForNext - lob.xp} XP to {STAGE_NAME[lob.evolutionStage + 1]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Battle record */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 mb-5">
        <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-4 font-medium">Battle Record</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold font-mono text-green-400">{lob.battlesWon}</div>
            <div className="text-[9px] text-abyss-500 uppercase tracking-wider mt-1">Victories</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-red-400">{lob.battlesLost}</div>
            <div className="text-[9px] text-abyss-500 uppercase tracking-wider mt-1">Defeats</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-abyss-200">{winRate}%</div>
            <div className="text-[9px] text-abyss-500 uppercase tracking-wider mt-1">Win Rate</div>
          </div>
        </div>
        {(lob.tokensWon > 0 || lob.tokensLost > 0) && (
          <div className="border-t border-abyss-700/15 mt-4 pt-4">
            <h3 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-3 font-medium">Wager Economy</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold font-mono text-biolume-green">{(lob.tokensWon / 1e6).toFixed(0)}</div>
                <div className="text-[9px] text-abyss-500 uppercase tracking-wider mt-1">$LOBS Won</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-biolume-pink">{(lob.tokensLost / 1e6).toFixed(0)}</div>
                <div className="text-[9px] text-abyss-500 uppercase tracking-wider mt-1">$LOBS Lost</div>
              </div>
              <div>
                <div className={`text-lg font-bold font-mono ${(lob.tokensWon - lob.tokensLost) >= 0 ? "text-biolume-gold" : "text-red-400"}`}>
                  {((lob.tokensWon - lob.tokensLost) / 1e6) >= 0 ? "+" : ""}{((lob.tokensWon - lob.tokensLost) / 1e6).toFixed(0)}
                </div>
                <div className="text-[9px] text-abyss-500 uppercase tracking-wider mt-1">Net $LOBS</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Owner */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
        <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-2 font-medium">Owner Agent</h2>
        <p className="font-mono text-xs text-abyss-300 break-all">{lob.owner}</p>
        <p className="text-[10px] text-abyss-600 mt-1.5 font-mono">Lob #{lob.mintIndex}</p>
      </div>
    </div>
  );
}

function DetailStatBar({
  label,
  value,
  max,
  barClass,
}: {
  label: string;
  value: number;
  max: number;
  barClass: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-abyss-400">{label}</span>
        <span className="text-xs font-mono font-semibold text-abyss-200">{value}</span>
      </div>
      <div className="h-1 bg-abyss-800/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
