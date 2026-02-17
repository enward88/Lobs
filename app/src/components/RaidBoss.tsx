import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLobs } from "../hooks/useLobs";
import { CreatureDot } from "./CreatureArt";
import { getGearById, RARITY_CONFIG, GearItem } from "../lib/gear";
import { FAMILY_COLOR } from "../lib/program";
import { BossModel3D } from "./BossModel3D";
import {
  getBossById,
  TIER_CONFIG,
  deriveRaidHistory,
  getBossKillCount,
  getBossWipeCount,
  timeAgo,
  RaidResult,
  RaidBoss as RaidBossData,
  RaidCombatTurn,
  DroppedLoot,
  BossAbility,
} from "../lib/raids";

export function RaidBoss() {
  const { bossId } = useParams<{ bossId: string }>();
  const { lobs, loading } = useLobs();
  const [expandedRaid, setExpandedRaid] = useState<string | null>(null);

  const boss = getBossById(bossId || "");
  const history = useMemo(() => deriveRaidHistory(lobs), [lobs]);
  const bossHistory = useMemo(
    () => history.filter(r => r.bossId === bossId).sort((a, b) => a.minutesAgo - b.minutesAgo),
    [history, bossId],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-abyss-700/30 border-t-biolume-pink/60 animate-spin" />
        <p className="text-abyss-500 text-xs mt-4 tracking-wider uppercase">Loading raid data...</p>
      </div>
    );
  }

  if (!boss) {
    return (
      <div className="text-center py-20">
        <p className="text-abyss-400 text-lg mb-4">Boss not found</p>
        <Link to="/raids" className="text-biolume-cyan text-sm hover:underline">
          Back to raids
        </Link>
      </div>
    );
  }

  const tier = TIER_CONFIG[boss.tier];
  const kills = getBossKillCount(boss.id, history);
  const wipes = getBossWipeCount(boss.id, history);
  const total = kills + wipes;
  const killRate = total > 0 ? Math.round((kills / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/raids"
        className="text-xs text-abyss-500 hover:text-biolume-cyan transition-colors mb-6 inline-block tracking-wider uppercase"
      >
        &larr; Back to raids
      </Link>

      {/* ═══ Boss Header ═══ */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-6 mb-5 glow-border">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* 3D Boss Model */}
          <div className="flex-shrink-0">
            <BossModel3D bossId={boss.id} size="lg" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{boss.name}</h1>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold"
                style={{
                  color: tier.color,
                  borderColor: `${tier.color}44`,
                  backgroundColor: tier.bgColor,
                }}
              >
                Tier {tier.icon} &middot; {tier.label}
              </span>
            </div>
            <p className="text-sm text-abyss-400 italic mb-3">{boss.title}</p>
            <p className="text-[11px] text-abyss-300 leading-relaxed mb-4">{boss.description}</p>

            <div className="flex flex-wrap gap-4 text-[10px] text-abyss-400">
              <span>Party: <span className="text-white font-semibold">{boss.minPartySize}-{boss.maxPartySize}</span></span>
              <span>Loot: <span style={{ color: tier.color }} className="font-semibold">{tier.rarityRange}</span></span>
              <span>Enrage: <span className="text-red-400 font-semibold">Turn {boss.enrageTurn} ({boss.enrageMultiplier}x)</span></span>
            </div>
          </div>
        </div>

        {/* Kill/wipe stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center p-2 rounded-lg bg-abyss-800/20 border border-abyss-700/10">
            <div className="text-lg font-bold font-mono text-green-400">{kills}</div>
            <div className="text-[8px] text-abyss-500 uppercase tracking-wider">Kills</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-abyss-800/20 border border-abyss-700/10">
            <div className="text-lg font-bold font-mono text-red-400">{wipes}</div>
            <div className="text-[8px] text-abyss-500 uppercase tracking-wider">Wipes</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-abyss-800/20 border border-abyss-700/10">
            <div className="text-lg font-bold font-mono text-abyss-300">{killRate}%</div>
            <div className="text-[8px] text-abyss-500 uppercase tracking-wider">Kill Rate</div>
          </div>
        </div>
      </div>

      {/* ═══ Stats + Abilities ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {/* Stats panel */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-3 font-medium">Boss Stats</h2>

          {/* HP */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-abyss-400">HP</span>
              <span className="text-sm font-mono font-bold" style={{ color: tier.color }}>
                {boss.hp.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-abyss-800/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "100%", backgroundColor: tier.color, opacity: 0.7 }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2.5">
            <BossStatBar label="STR" value={boss.strength} max={70} color="#ff4466" />
            <BossStatBar label="VIT" value={boss.vitality} max={70} color="#00ff88" />
            <BossStatBar label="SPD" value={boss.speed} max={40} color="#00aaff" />
            <BossStatBar label="LCK" value={boss.luck} max={20} color="#ffcc00" />
          </div>
        </div>

        {/* Abilities */}
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider mb-3 font-medium">Abilities</h2>
          <div className="space-y-3">
            {boss.abilities.map(ability => (
              <AbilityCard key={ability.name} ability={ability} />
            ))}
          </div>

          {/* Enrage warning */}
          <div className="mt-4 p-3 rounded-lg bg-red-900/15 border border-red-800/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">
                Enrage
              </span>
              <span className="text-[9px] text-red-300/70">
                After turn {boss.enrageTurn} &mdash; {boss.enrageMultiplier}x damage
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Loot Table ═══ */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">Loot Table</h2>
          <span className="text-[9px] text-abyss-600 font-mono">
            {boss.lootDropCount.min}-{boss.lootDropCount.max} items per kill
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {boss.lootTable.map(entry => {
            const item = getGearById(entry.itemId);
            if (!item) return null;
            return (
              <LootTableItem key={entry.itemId} item={item} dropRate={entry.dropRate} />
            );
          })}
        </div>
      </div>

      {/* ═══ Fight History ═══ */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
        <div className="px-5 py-3 border-b border-abyss-700/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-biolume-pink animate-glow-pulse" />
            <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
              Fight History
            </span>
          </div>
          <span className="text-[9px] text-abyss-600 font-mono">{bossHistory.length} raids</span>
        </div>

        {bossHistory.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-abyss-600 text-xs">No raid attempts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-abyss-700/10">
            {bossHistory.map(raid => (
              <RaidHistoryEntry
                key={raid.id}
                raid={raid}
                boss={boss}
                expanded={expandedRaid === raid.id}
                onToggle={() => setExpandedRaid(expandedRaid === raid.id ? null : raid.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function BossStatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] text-abyss-500 uppercase w-7 font-mono">{label}</span>
      <div className="flex-1 h-1.5 bg-abyss-800/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color, opacity: 0.7 }}
        />
      </div>
      <span className="text-[10px] font-mono font-semibold w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

function AbilityCard({ ability }: { ability: BossAbility }) {
  const typeColors: Record<string, string> = {
    aoe: "#ff4466",
    stun: "#ffcc00",
    dot: "#aa55ff",
    heal: "#00ff88",
    enrage: "#ff00aa",
    summon: "#00aaff",
  };
  const color = typeColors[ability.type] || "#9ca3af";

  return (
    <div className="p-3 rounded-lg bg-abyss-800/20 border border-abyss-700/10">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-semibold text-white">{ability.name}</span>
        <span
          className="text-[7px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider"
          style={{ color, backgroundColor: `${color}22`, border: `1px solid ${color}33` }}
        >
          {ability.type}
        </span>
      </div>
      <p className="text-[9px] text-abyss-400 leading-relaxed">{ability.description}</p>
      <div className="flex items-center gap-3 mt-1.5 text-[8px] text-abyss-500 font-mono">
        <span>CD: {ability.cooldown}t</span>
        {ability.damage && <span className="text-red-400">{ability.damage} dmg</span>}
        {ability.healAmount && <span className="text-green-400">+{ability.healAmount} HP</span>}
        {ability.triggerBelowHpPct && <span className="text-yellow-400">&lt;{ability.triggerBelowHpPct}% HP</span>}
      </div>
    </div>
  );
}

function LootTableItem({ item, dropRate }: { item: GearItem; dropRate: number }) {
  const rarity = RARITY_CONFIG[item.rarity];
  const bonuses = Object.entries(item.statBonuses)
    .filter(([, v]) => v && v > 0)
    .map(([k, v]) => `+${v} ${k.toUpperCase()}`)
    .join("  ");

  return (
    <div
      className="p-3 rounded-lg border"
      style={{
        borderColor: `${rarity.color}33`,
        backgroundColor: `${rarity.color}08`,
        boxShadow: rarity.glow !== "none" ? rarity.glow.replace(/\)/, ", 0.15)") : "none",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm" title={item.slot}>{item.icon}</span>
            <span className="text-[11px] font-semibold truncate" style={{ color: rarity.color }}>
              {item.name}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[8px] uppercase tracking-wider" style={{ color: rarity.color }}>
              {rarity.label}
            </span>
            <span className="text-[8px] text-abyss-600">{item.slot}</span>
            {item.familyAffinity && (
              <span
                className="text-[7px] px-1 py-0.5 rounded border"
                style={{
                  color: FAMILY_COLOR[item.familyAffinity] || "#666",
                  borderColor: `${FAMILY_COLOR[item.familyAffinity] || "#666"}33`,
                }}
              >
                {item.familyAffinity}
              </span>
            )}
          </div>
          <div className="text-[9px] text-abyss-300 font-mono mt-1">{bonuses}</div>
        </div>
        <div className="flex-shrink-0 text-right ml-3">
          <div className="text-[11px] font-mono font-bold text-abyss-300">
            {Math.round(dropRate * 100)}%
          </div>
          <div className="text-[7px] text-abyss-600 uppercase tracking-wider">Drop</div>
        </div>
      </div>
    </div>
  );
}

function RaidHistoryEntry({
  raid,
  boss,
  expanded,
  onToggle,
}: {
  raid: RaidResult;
  boss: RaidBossData;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isVictory = raid.outcome === "victory";
  const survived = raid.party.filter(p => p.koTurn === null).length;

  return (
    <div>
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-3 hover:bg-abyss-800/15 transition-colors duration-200 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{
              backgroundColor: isVictory ? "rgba(0,255,136,0.15)" : "rgba(255,68,102,0.15)",
              color: isVictory ? "#00ff88" : "#ff4466",
              border: `1px solid ${isVictory ? "rgba(0,255,136,0.3)" : "rgba(255,68,102,0.3)"}`,
            }}
          >
            {isVictory ? "W" : "X"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {raid.party.map(p => (
                <CreatureDot key={p.creatureAddress} species={p.species} />
              ))}
              <span className="text-[8px] text-abyss-600 ml-1">
                {survived}/{raid.party.length} survived
              </span>
            </div>
            <div className="text-[8px] text-abyss-600 mt-0.5">
              {raid.party.map(p => p.creatureName).join(", ")}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-[9px] text-abyss-500 font-mono">{raid.totalTurns} turns</div>
            <div className="text-[8px] text-abyss-600">{timeAgo(raid.minutesAgo)}</div>
          </div>

          <span className="text-[10px] text-abyss-600 flex-shrink-0 ml-2">
            {expanded ? "\u25B2" : "\u25BC"}
          </span>
        </div>

        {/* Loot summary */}
        {raid.lootDrops.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 ml-10">
            <span className="text-[8px] text-abyss-600 uppercase tracking-wider">Loot:</span>
            {raid.lootDrops.map((drop, i) => {
              const item = getGearById(drop.itemId);
              if (!item) return null;
              return (
                <span
                  key={i}
                  className="text-[8px] font-mono px-1.5 py-0.5 rounded border"
                  style={{
                    color: RARITY_CONFIG[item.rarity].color,
                    borderColor: `${RARITY_CONFIG[item.rarity].color}33`,
                    backgroundColor: `${RARITY_CONFIG[item.rarity].color}11`,
                  }}
                >
                  {item.name}
                </span>
              );
            })}
          </div>
        )}
      </button>

      {/* Expanded combat log */}
      {expanded && (
        <RaidInstance raid={raid} boss={boss} />
      )}
    </div>
  );
}

function RaidInstance({ raid, boss }: { raid: RaidResult; boss: RaidBossData }) {
  const tier = TIER_CONFIG[boss.tier];

  // Filter to highlight turns only (crits, KOs, abilities, enrage triggers, dodges)
  const highlights = raid.combatLog.filter(
    t => t.crit || t.ko || t.abilityUsed || t.dodge || (t.isEnraged && t.turn === boss.enrageTurn + 1) || t.damage < 0,
  );
  const allTurns = raid.combatLog;
  const [showAll, setShowAll] = useState(false);
  const visibleTurns = showAll ? allTurns : highlights;

  return (
    <div className="px-5 pb-5 border-t border-abyss-700/10">
      {/* Party status */}
      <div className="py-3 mb-3">
        <span className="text-[9px] text-abyss-500 uppercase tracking-wider font-medium">Party</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {raid.party.map(p => {
            const familyColor = FAMILY_COLOR[p.family] || "#666";
            return (
              <div
                key={p.creatureAddress}
                className="flex items-center gap-2 p-2 rounded-lg bg-abyss-800/20 border border-abyss-700/10"
              >
                <CreatureDot species={p.species} />
                <div className="min-w-0">
                  <div className="text-[10px] font-medium text-white truncate">{p.creatureName}</div>
                  <div className="text-[8px] text-abyss-500">
                    <span style={{ color: familyColor }}>{p.family}</span>
                    <span className="text-abyss-600 mx-1">&middot;</span>
                    HP {p.maxHp}
                    {p.koTurn !== null && (
                      <span className="text-red-400 ml-1">KO T{p.koTurn}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combat log toggle */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-abyss-500 uppercase tracking-wider font-medium">Combat Log</span>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[8px] text-biolume-cyan/60 hover:text-biolume-cyan transition-colors uppercase tracking-wider"
        >
          {showAll ? `Highlights (${highlights.length})` : `All turns (${allTurns.length})`}
        </button>
      </div>

      {/* Combat log */}
      <div className="space-y-0.5 max-h-[400px] overflow-y-auto rounded-lg bg-abyss-800/10 border border-abyss-700/10 p-3">
        {visibleTurns.map((turn, i) => (
          <CombatLogLine key={i} turn={turn} bossName={boss.name} tierColor={tier.color} />
        ))}

        {/* Final outcome */}
        <div className="pt-2 mt-2 border-t border-abyss-700/15">
          {raid.outcome === "victory" ? (
            <div className="text-center text-green-400 text-[11px] font-bold tracking-wider">
              VICTORY &mdash; {boss.name} defeated in {raid.totalTurns} turns
            </div>
          ) : (
            <div className="text-center text-red-400 text-[11px] font-bold tracking-wider">
              WIPE &mdash; Party eliminated at turn {raid.totalTurns}
              <span className="text-[9px] text-abyss-500 ml-2">
                ({Math.round((raid.bossHpRemaining / boss.hp) * 100)}% HP remaining)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Loot rolls */}
      {raid.lootDrops.length > 0 && (
        <div className="mt-4">
          <span className="text-[9px] text-abyss-500 uppercase tracking-wider font-medium">
            Loot Rolls
          </span>
          <div className="space-y-3 mt-2">
            {raid.lootDrops.map((drop, i) => (
              <LootRollDisplay key={i} drop={drop} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CombatLogLine({
  turn,
  bossName,
  tierColor,
}: {
  turn: RaidCombatTurn;
  bossName: string;
  tierColor: string;
}) {
  const isBoss = turn.actorType === "boss";
  const actorColor = isBoss ? tierColor : "#00ffd5";
  const isHeal = turn.damage < 0;

  let badge = "";
  let badgeColor = "";
  if (turn.crit) { badge = "CRIT"; badgeColor = "#ffcc00"; }
  if (turn.dodge) { badge = "DODGE"; badgeColor = "#00aaff"; }
  if (turn.ko) { badge = "KO"; badgeColor = "#ff4466"; }
  if (turn.abilityUsed) { badge = turn.abilityUsed; badgeColor = isBoss ? tierColor : "#aa55ff"; }
  if (isHeal) { badge = `+${Math.abs(turn.damage)} HP`; badgeColor = "#00ff88"; }

  // Enrage line
  if (turn.abilityUsed && (turn.abilityUsed === "Final Rage" || turn.abilityUsed === "Ancient Wrath")) {
    return (
      <div className="text-[9px] font-mono py-0.5 text-red-400 font-bold">
        T{turn.turn} &mdash; {bossName} ENRAGES!
      </div>
    );
  }

  // Summon line
  if (turn.abilityUsed === "Summon Spawn") {
    return (
      <div className="text-[9px] font-mono py-0.5 text-abyss-400">
        T{turn.turn} &mdash; <span style={{ color: tierColor }}>{bossName}</span> summons an Abyssal Spawn!
      </div>
    );
  }

  return (
    <div className="text-[9px] font-mono py-0.5 flex items-center gap-1.5 flex-wrap">
      <span className="text-abyss-600 w-6">T{turn.turn}</span>
      <span style={{ color: actorColor }}>{turn.actorName}</span>
      <span className="text-abyss-600">&rarr;</span>
      <span className="text-abyss-300">{turn.targetName}</span>
      {!isHeal && turn.damage > 0 && (
        <span className={turn.crit ? "text-yellow-400 font-bold" : "text-abyss-400"}>
          {turn.damage} dmg
        </span>
      )}
      {turn.dodge && <span className="text-abyss-500">miss</span>}
      {badge && (
        <span
          className="text-[7px] px-1 py-0.5 rounded font-bold uppercase"
          style={{ color: badgeColor, backgroundColor: `${badgeColor}15` }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function LootRollDisplay({ drop }: { drop: DroppedLoot }) {
  const item = getGearById(drop.itemId);
  if (!item) return null;
  const rarity = RARITY_CONFIG[item.rarity];
  const winner = drop.rolls.find(r => r.won);

  return (
    <div
      className="rounded-lg border p-3"
      style={{
        borderColor: `${rarity.color}33`,
        backgroundColor: `${rarity.color}08`,
      }}
    >
      {/* Item header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{item.icon}</span>
        <span className="text-[11px] font-semibold" style={{ color: rarity.color }}>
          {item.name}
        </span>
        <span className="text-[8px] uppercase tracking-wider" style={{ color: rarity.color }}>
          {rarity.label}
        </span>
      </div>

      {/* Rolls */}
      <div className="space-y-1">
        {drop.rolls
          .filter(r => r.rollType !== "pass")
          .sort((a, b) => {
            // Need before Greed, then by value desc
            if (a.rollType !== b.rollType) return a.rollType === "need" ? -1 : 1;
            return b.rollValue - a.rollValue;
          })
          .map((roll, i) => {
            const rollColor =
              roll.rollType === "need" ? "#ff4466" : "#ffcc00";
            return (
              <div key={i} className="flex items-center gap-2 text-[9px] font-mono">
                <span
                  className="w-12 text-center text-[7px] px-1 py-0.5 rounded uppercase font-bold"
                  style={{ color: rollColor, backgroundColor: `${rollColor}15` }}
                >
                  {roll.rollType}
                </span>
                <span className={`flex-1 ${roll.won ? "text-white font-semibold" : "text-abyss-400"}`}>
                  {roll.creatureName}
                </span>
                <span className="text-abyss-300 font-semibold">{roll.rollValue}</span>
                <span className="text-[7px] text-abyss-600">
                  (d{roll.rawRoll}
                  {roll.luckBonus > 0 && <span className="text-yellow-500"> +{roll.luckBonus}lck</span>}
                  {roll.familyBonus > 0 && <span className="text-green-400"> +{roll.familyBonus}fam</span>})
                </span>
                {roll.won && (
                  <span className="text-[8px] text-green-400 font-bold">WIN</span>
                )}
              </div>
            );
          })}
        {/* Show pass count */}
        {(() => {
          const passCount = drop.rolls.filter(r => r.rollType === "pass").length;
          return passCount > 0 ? (
            <div className="text-[8px] text-abyss-600 font-mono mt-0.5">
              {passCount} passed
            </div>
          ) : null;
        })()}
      </div>

      {/* Winner announcement */}
      {winner && (
        <div className="mt-2 pt-2 border-t border-abyss-700/15 text-[10px]">
          <span className="text-abyss-400">
            <span className="text-white font-semibold">{winner.creatureName}</span> wins{" "}
            <span style={{ color: rarity.color }}>{item.name}</span>
          </span>
        </div>
      )}
    </div>
  );
}
