import { useParams, Link } from "react-router-dom";
import { useLobs } from "../hooks/useLobs";
import { CreatureArt } from "./CreatureArt";
import { GearSlot } from "./GearSlot";
import { getAgentName } from "../data/mockBots";
import {
  SPECIES_NAME,
  SPECIES_FAMILY,
  SPECIES_TRAIT,
  FAMILY_COLOR,
  STAGE_NAME,
  EVOLUTION_THRESHOLDS,
  EVOLUTION_MULTIPLIERS,
} from "../lib/program";
import {
  getCreatureGear,
  totalGearBonuses,
  gearScore,
  gearScoreLabel,
  GEAR_SLOTS,
  CreatureGear,
} from "../lib/gear";

export function Armory() {
  const { address } = useParams<{ address: string }>();
  const { lobs, loading } = useLobs();

  if (loading) {
    return (
      <div className="flex flex-col items-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-abyss-700/30 border-t-biolume-cyan/60 animate-spin" />
        <p className="text-abyss-500 text-xs mt-4 tracking-wider uppercase">Loading armory...</p>
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

  const gear: CreatureGear = getCreatureGear(lob.address);
  const agentName = getAgentName(lob.owner);
  const family = SPECIES_FAMILY[lob.species] || "Unknown";
  const familyColor = FAMILY_COLOR[family] || "#666";
  const speciesName = SPECIES_NAME[lob.species] || "Unknown";
  const stageName = STAGE_NAME[lob.evolutionStage] || "Unknown";
  const bonuses = totalGearBonuses(gear);
  const score = gearScore(gear);
  const scoreInfo = gearScoreLabel(score);
  const totalBattles = lob.battlesWon + lob.battlesLost;
  const winRate = totalBattles > 0 ? ((lob.battlesWon / totalBattles) * 100).toFixed(1) : "N/A";

  const mult = EVOLUTION_MULTIPLIERS[lob.evolutionStage];
  const multDisplay = (mult / 10000).toFixed(1);

  // Effective stats = (base + gear) * evolution * mood factor
  const effStr = Math.floor(((lob.strength + bonuses.str) * mult * lob.mood) / 1_000_000);
  const effVit = Math.floor(((lob.vitality + bonuses.vit) * mult * 10) / 10000);
  const effSpd = Math.floor(((lob.speed + bonuses.spd) * mult) / 10000);
  const effLck = Math.floor(((lob.luck + bonuses.lck) * mult) / 10000);

  const xpForNext = lob.evolutionStage < 3 ? EVOLUTION_THRESHOLDS[lob.evolutionStage] : null;
  const xpProgress = xpForNext !== null ? Math.min((lob.xp / xpForNext) * 100, 100) : 100;

  // Power score
  const powerScore = effStr + effVit + effSpd + effLck;

  // Equipped count
  const equippedCount = Object.keys(gear).length;

  const leftSlots = GEAR_SLOTS.filter((s) => s.side === "left");
  const rightSlots = GEAR_SLOTS.filter((s) => s.side === "right");

  // Other creatures by the same owner
  const siblings = lobs.filter((l) => l.owner === lob.owner && l.address !== lob.address);

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="text-xs text-abyss-500 hover:text-biolume-cyan transition-colors mb-6 inline-block tracking-wider uppercase"
      >
        &larr; Back to the deep
      </Link>

      {/* ═══ Header Bar ═══ */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{lob.name}</h1>
            {!lob.isAlive && (
              <span className="text-[9px] bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full border border-red-800/30 uppercase tracking-wider">
                Dead
              </span>
            )}
          </div>
          {agentName && (
            <Link
              to={`/agent-profile/${lob.owner}`}
              className="text-[11px] text-biolume-cyan/70 hover:text-biolume-cyan transition-colors tracking-wider mt-0.5 inline-block"
            >
              owned by {agentName}
            </Link>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: familyColor }} />
            <span className="text-sm text-abyss-300">
              {speciesName}
              <span className="text-abyss-600 mx-1.5">/</span>
              <span style={{ color: familyColor }}>{family}</span>
              <span className="text-abyss-600 mx-1.5">/</span>
              {stageName}
            </span>
          </div>
          <p className="text-[10px] text-abyss-600 italic mt-0.5">{SPECIES_TRAIT[lob.species]}</p>
        </div>
        {/* Gear score badge */}
        {score > 0 && (
          <div className="text-right">
            <div className="text-[9px] text-abyss-500 uppercase tracking-wider mb-0.5">Gear Score</div>
            <div className="text-2xl font-bold font-mono" style={{ color: scoreInfo.color }}>
              {score}
            </div>
            <div className="text-[9px] font-mono" style={{ color: scoreInfo.color }}>
              {scoreInfo.label}
            </div>
          </div>
        )}
      </div>

      {/* ═══ Character Frame — Gear Slots + Creature Art ═══ */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-4 sm:p-6 mb-5 glow-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: familyColor }} />
          <span className="text-[10px] text-abyss-500 uppercase tracking-[0.2em] font-medium">
            Equipment
          </span>
          <span className="text-[9px] text-abyss-600 font-mono ml-2">
            {equippedCount}/8 slots
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {/* Left slots */}
          <div className="flex flex-col gap-3">
            {leftSlots.map((s) => (
              <GearSlot key={s.slot} slot={s.slot} item={gear[s.slot]} creatureFamily={family} />
            ))}
          </div>

          {/* Creature art — centered */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl px-6 py-8 sm:px-10 sm:py-10"
            style={{
              minWidth: "140px",
              minHeight: "160px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              border: `1px solid ${familyColor}22`,
              boxShadow: `inset 0 0 40px ${familyColor}08, 0 0 20px ${familyColor}06`,
            }}
          >
            <CreatureArt species={lob.species} size="lg" />
          </div>

          {/* Right slots */}
          <div className="flex flex-col gap-3">
            {rightSlots.map((s) => (
              <GearSlot key={s.slot} slot={s.slot} item={gear[s.slot]} creatureFamily={family} />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Stats Panel — Base / Gear / Effective ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Base stats */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-4 font-medium">Base Stats</h2>
          <div className="space-y-3">
            <ArmoryStatBar label="STR" base={lob.strength} bonus={bonuses.str} max={20} color="#ff4466" />
            <ArmoryStatBar label="VIT" base={lob.vitality} bonus={bonuses.vit} max={20} color="#00ff88" />
            <ArmoryStatBar label="SPD" base={lob.speed} bonus={bonuses.spd} max={20} color="#00aaff" />
            <ArmoryStatBar label="LCK" base={lob.luck} bonus={bonuses.lck} max={20} color="#ffcc00" />
          </div>
        </div>

        {/* Gear bonuses */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-4 font-medium">
            Gear Bonuses
          </h2>
          {score > 0 ? (
            <div className="space-y-3">
              <GearBonusRow label="STR" value={bonuses.str} color="#ff4466" />
              <GearBonusRow label="VIT" value={bonuses.vit} color="#00ff88" />
              <GearBonusRow label="SPD" value={bonuses.spd} color="#00aaff" />
              <GearBonusRow label="LCK" value={bonuses.lck} color="#ffcc00" />
              <div className="border-t border-abyss-700/15 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-abyss-400">Total Score</span>
                  <span className="text-sm font-mono font-bold" style={{ color: scoreInfo.color }}>
                    {score}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <p className="text-[10px] text-abyss-600 italic">No gear equipped</p>
            </div>
          )}
        </div>

        {/* Effective stats */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-1 font-medium">
            Effective Stats
          </h2>
          <p className="text-[9px] text-abyss-600 mb-4 font-mono">
            {multDisplay}x evo &middot; mood {lob.mood}
          </p>
          <div className="space-y-3">
            <EffectiveStatRow label="STR" value={effStr} color="#ff4466" />
            <EffectiveStatRow label="VIT" value={effVit} color="#00ff88" />
            <EffectiveStatRow label="SPD" value={effSpd} color="#00aaff" />
            <EffectiveStatRow label="LCK" value={effLck} color="#ffcc00" />
          </div>
          <div className="border-t border-abyss-700/15 pt-2 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-abyss-400">Power</span>
              <span className="text-sm font-mono font-bold text-white">{powerScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Battle Record + Evolution ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Battle record */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-4 font-medium">
            Battle Record
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div>
              <div className="text-xl font-bold font-mono text-green-400">{lob.battlesWon}</div>
              <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">Wins</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-red-400">{lob.battlesLost}</div>
              <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">Losses</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-abyss-200">{winRate}%</div>
              <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">Rate</div>
            </div>
          </div>
          {(lob.tokensWon > 0 || lob.tokensLost > 0) && (
            <div className="border-t border-abyss-700/15 pt-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm font-bold font-mono text-biolume-green">
                    {(lob.tokensWon / 1e6).toFixed(0)}
                  </div>
                  <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">Won</div>
                </div>
                <div>
                  <div className="text-sm font-bold font-mono text-biolume-pink">
                    {(lob.tokensLost / 1e6).toFixed(0)}
                  </div>
                  <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">Lost</div>
                </div>
                <div>
                  <div
                    className={`text-sm font-bold font-mono ${
                      lob.tokensWon - lob.tokensLost >= 0 ? "text-biolume-gold" : "text-red-400"
                    }`}
                  >
                    {((lob.tokensWon - lob.tokensLost) / 1e6) >= 0 ? "+" : ""}
                    {((lob.tokensWon - lob.tokensLost) / 1e6).toFixed(0)}
                  </div>
                  <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">Net</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Evolution + mood */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-4 font-medium">
            Evolution
          </h2>
          {/* Stage badges */}
          <div className="flex gap-1.5 mb-4">
            {["Larva", "Juvenile", "Adult", "Elder"].map((stage, i) => (
              <div
                key={stage}
                className="flex-1 text-center py-1.5 rounded-lg text-[9px] font-mono tracking-wider"
                style={{
                  backgroundColor:
                    i <= lob.evolutionStage ? `${familyColor}20` : "rgba(15, 23, 42, 0.4)",
                  border: `1px solid ${i <= lob.evolutionStage ? `${familyColor}40` : "rgba(100, 116, 139, 0.15)"}`,
                  color: i <= lob.evolutionStage ? familyColor : "#475569",
                }}
              >
                {i === lob.evolutionStage ? "\u25C9 " : ""}
                {stage}
              </div>
            ))}
          </div>

          {/* XP bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-abyss-500">Experience</span>
              <span className="text-[10px] font-mono text-abyss-300">
                {lob.xp}
                {xpForNext !== null ? <span className="text-abyss-600">/{xpForNext}</span> : ""}
              </span>
            </div>
            <div className="h-1.5 bg-abyss-800/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${xpProgress}%`,
                  background: `linear-gradient(90deg, ${familyColor}88, ${familyColor})`,
                }}
              />
            </div>
            {xpForNext !== null && (
              <p className="text-[9px] text-abyss-600 mt-1">
                {xpForNext - lob.xp} XP to {STAGE_NAME[lob.evolutionStage + 1]}
              </p>
            )}
          </div>

          {/* Mood */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-abyss-500">Mood</span>
              <span
                className="text-[10px] font-mono font-semibold"
                style={{
                  color: lob.mood >= 60 ? "#00ff88" : lob.mood >= 30 ? "#ffcc00" : "#ff4466",
                }}
              >
                {lob.mood}
              </span>
            </div>
            <div className="h-1.5 bg-abyss-800/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${lob.mood}%`,
                  backgroundColor: lob.mood >= 60 ? "#00ff88" : lob.mood >= 30 ? "#ffcc00" : "#ff4466",
                }}
              />
            </div>
          </div>

          {/* Evolution multiplier */}
          <div className="mt-4 flex items-center justify-between text-[10px]">
            <span className="text-abyss-500">Stat Multiplier</span>
            <span className="font-mono font-bold" style={{ color: familyColor }}>
              {multDisplay}x
            </span>
          </div>
        </div>
      </div>

      {/* ═══ Owner / Agent ═══ */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 mb-5">
        <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-3 font-medium">
          Owner Agent
        </h2>
        <div className="flex items-center justify-between">
          <div>
            {agentName && (
              <Link
                to={`/agent-profile/${lob.owner}`}
                className="text-sm font-semibold text-biolume-cyan hover:text-white transition-colors"
              >
                {agentName}
              </Link>
            )}
            <p className="font-mono text-[10px] text-abyss-400 break-all mt-0.5">{lob.owner}</p>
            <p className="text-[10px] text-abyss-600 mt-1 font-mono">
              Lob #{lob.mintIndex} &middot; {siblings.length + 1} creatures owned
            </p>
          </div>
          <Link
            to={`/agent-profile/${lob.owner}`}
            className="text-[10px] text-biolume-cyan/70 hover:text-biolume-cyan tracking-wider uppercase transition-colors flex-shrink-0 ml-4"
          >
            View all &rarr;
          </Link>
        </div>
      </div>

      {/* ═══ Other Creatures by This Agent ═══ */}
      {siblings.length > 0 && (
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
              Other Creatures
            </h2>
            <Link
              to={`/agent-profile/${lob.owner}`}
              className="text-[9px] text-biolume-cyan/60 hover:text-biolume-cyan tracking-wider uppercase transition-colors"
            >
              See all {siblings.length + 1} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {siblings.slice(0, 4).map((sib) => {
              const sibGear = getCreatureGear(sib.address);
              const sibScore = gearScore(sibGear);
              const sibScoreInfo = gearScoreLabel(sibScore);
              const sibFamily = SPECIES_FAMILY[sib.species] || "Unknown";
              return (
                <Link
                  key={sib.address}
                  to={`/armory/${sib.address}`}
                  className="group rounded-xl bg-abyss-800/20 border border-abyss-700/10 p-3 hover:bg-abyss-800/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CreatureArt species={sib.species} size="sm" animate={false} />
                    <div className="min-w-0">
                      <div className="text-xs text-white font-semibold truncate group-hover:text-biolume-cyan transition-colors">
                        {sib.name}
                      </div>
                      <div className="text-[9px] text-abyss-500">
                        <span style={{ color: FAMILY_COLOR[sibFamily] || "#666" }}>{sibFamily}</span>
                        {" / "}
                        {STAGE_NAME[sib.evolutionStage]}
                      </div>
                    </div>
                  </div>
                  {sibScore > 0 && (
                    <div className="text-[9px] font-mono" style={{ color: sibScoreInfo.color }}>
                      GS {sibScore}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Address */}
      <div className="mt-5 text-center">
        <p className="text-[9px] text-abyss-700 font-mono break-all">{lob.address}</p>
      </div>
    </div>
  );
}

function ArmoryStatBar({
  label,
  base,
  bonus,
  max,
  color,
}: {
  label: string;
  base: number;
  bonus: number;
  max: number;
  color: string;
}) {
  const basePct = Math.min((base / max) * 100, 100);
  const bonusPct = Math.min((bonus / max) * 100, 100 - basePct);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-abyss-400">{label}</span>
        <span className="text-xs font-mono text-abyss-200">
          {base}
          {bonus > 0 && (
            <span style={{ color }} className="ml-1">
              +{bonus}
            </span>
          )}
        </span>
      </div>
      <div className="h-1 bg-abyss-800/60 rounded-full overflow-hidden flex">
        <div
          className="h-full rounded-l-full"
          style={{ width: `${basePct}%`, backgroundColor: `${color}88` }}
        />
        {bonus > 0 && (
          <div
            className="h-full rounded-r-full"
            style={{ width: `${bonusPct}%`, backgroundColor: color }}
          />
        )}
      </div>
    </div>
  );
}

function GearBonusRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-abyss-400">{label}</span>
      <span className="text-xs font-mono font-semibold" style={{ color: value > 0 ? color : "#475569" }}>
        {value > 0 ? `+${value}` : "—"}
      </span>
    </div>
  );
}

function EffectiveStatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-abyss-400">{label}</span>
      <span className="text-sm font-mono font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
