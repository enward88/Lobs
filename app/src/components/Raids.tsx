import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLobs } from "../hooks/useLobs";
import { CreatureDot } from "./CreatureArt";
import { SPECIES_NAME } from "../lib/program";
import { getGearById, RARITY_CONFIG } from "../lib/gear";
import {
  RAID_BOSSES,
  TIER_CONFIG,
  deriveRaidHistory,
  getBossKillCount,
  getBossWipeCount,
  getRarestDrop,
  timeAgo,
  RaidTier,
  RaidBoss,
  RaidResult,
} from "../lib/raids";

export function Raids() {
  const { lobs, loading } = useLobs();
  const [tierFilter, setTierFilter] = useState<RaidTier | null>(null);

  const history = useMemo(() => deriveRaidHistory(lobs), [lobs]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-abyss-700/30 border-t-biolume-pink/60 animate-spin" />
        <p className="text-abyss-500 text-xs mt-4 tracking-wider uppercase">Loading raids...</p>
      </div>
    );
  }

  const filteredBosses = tierFilter
    ? RAID_BOSSES.filter(b => b.tier === tierFilter)
    : RAID_BOSSES;

  const totalRaids = history.length;
  const totalKills = history.filter(r => r.outcome === "victory").length;
  const totalWipes = history.filter(r => r.outcome === "wipe").length;
  const rarest = getRarestDrop(history);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-2"
          style={{
            background: "linear-gradient(135deg, #ff4466, #aa55ff, #ff00aa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Raids
        </h1>
        <p className="text-abyss-400 text-sm tracking-wider">
          Enter the deep &middot; Fight bosses &middot; Claim loot
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <RaidStat label="Total Raids" value={String(totalRaids)} color="#00ffd5" />
        <RaidStat label="Boss Kills" value={String(totalKills)} color="#00ff88" />
        <RaidStat label="Wipes" value={String(totalWipes)} color="#ff4466" />
        <div className="rounded-xl bg-abyss-900/30 border border-abyss-700/15 p-3 text-center">
          {rarest ? (
            <>
              <div
                className="text-sm font-bold font-mono truncate"
                style={{ color: RARITY_CONFIG[rarest.rarity].color }}
              >
                {rarest.name}
              </div>
              <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">
                Rarest Drop
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold font-mono text-abyss-600">None</div>
              <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">Rarest Drop</div>
            </>
          )}
        </div>
      </div>

      {/* Tier filter tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">Difficulty</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTierFilter(null)}
            className="px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wide transition-all duration-200"
            style={{
              backgroundColor: !tierFilter ? "rgba(0,255,213,0.15)" : "rgba(15,23,42,0.4)",
              border: `1px solid ${!tierFilter ? "rgba(0,255,213,0.3)" : "rgba(100,116,139,0.15)"}`,
              color: !tierFilter ? "#00ffd5" : "#64748b",
            }}
          >
            All ({RAID_BOSSES.length})
          </button>
          {([1, 2, 3, 4] as RaidTier[]).map(tier => {
            const cfg = TIER_CONFIG[tier];
            const count = RAID_BOSSES.filter(b => b.tier === tier).length;
            const active = tierFilter === tier;
            return (
              <button
                key={tier}
                onClick={() => setTierFilter(active ? null : tier)}
                className="px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wide transition-all duration-200"
                style={{
                  backgroundColor: active ? `${cfg.color}22` : "rgba(15,23,42,0.4)",
                  border: `1px solid ${active ? `${cfg.color}44` : "rgba(100,116,139,0.15)"}`,
                  color: active ? cfg.color : "#94a3b8",
                }}
              >
                {cfg.icon} {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Boss grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {filteredBosses.map(boss => (
          <BossCard key={boss.id} boss={boss} history={history} />
        ))}
      </div>

      {/* Recent raid log */}
      {history.length > 0 && (
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
          <div className="px-5 py-3 border-b border-abyss-700/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-biolume-pink animate-glow-pulse" />
              <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
                Recent Raids
              </span>
            </div>
            <span className="text-[9px] text-abyss-600 font-mono">
              {history.length} raids
            </span>
          </div>
          <div className="divide-y divide-abyss-700/10 max-h-[500px] overflow-y-auto">
            {history.slice(0, 15).map(raid => (
              <RaidLogEntry key={raid.id} raid={raid} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RaidStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl bg-abyss-900/30 border border-abyss-700/15 p-3 text-center">
      <div className="text-lg font-bold font-mono" style={{ color }}>{value}</div>
      <div className="text-[8px] text-abyss-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function BossCard({ boss, history }: { boss: RaidBoss; history: RaidResult[] }) {
  const tier = TIER_CONFIG[boss.tier];
  const kills = getBossKillCount(boss.id, history);
  const wipes = getBossWipeCount(boss.id, history);
  const total = kills + wipes;
  const killRate = total > 0 ? Math.round((kills / total) * 100) : 0;
  const lastRaid = history
    .filter(r => r.bossId === boss.id)
    .sort((a, b) => a.minutesAgo - b.minutesAgo)[0];

  return (
    <Link
      to={`/raids/${boss.id}`}
      className="group block rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 hover-glow glow-border transition-all duration-300 hover:bg-abyss-900/50"
    >
      <div className="flex items-start gap-4 mb-3">
        {/* Boss ASCII art */}
        <div className="flex-shrink-0">
          <pre
            className="text-[7px] leading-[1.1] font-mono opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ color: tier.color }}
          >
            {boss.asciiArt}
          </pre>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate group-hover:text-biolume-cyan transition-colors">
              {boss.name}
            </h3>
            <span
              className="text-[8px] px-1.5 py-0.5 rounded-full border font-mono font-semibold flex-shrink-0"
              style={{
                color: tier.color,
                borderColor: `${tier.color}44`,
                backgroundColor: tier.bgColor,
              }}
            >
              {tier.icon}
            </span>
          </div>
          <p className="text-[10px] text-abyss-400 mt-0.5 italic">{boss.title}</p>
          <p className="text-[10px] text-abyss-500 mt-1">
            Party: {boss.minPartySize}-{boss.maxPartySize} &middot; {tier.rarityRange}
          </p>
        </div>
      </div>

      {/* Boss HP bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-abyss-500 font-mono">HP</span>
          <span className="text-[9px] font-mono" style={{ color: tier.color }}>
            {boss.hp.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 bg-abyss-800/60 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, (boss.hp / 1800) * 100)}%`,
              backgroundColor: tier.color,
              opacity: 0.6,
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <BossMiniStat label="STR" value={boss.strength} color="#ff4466" />
        <BossMiniStat label="VIT" value={boss.vitality} color="#00ff88" />
        <BossMiniStat label="SPD" value={boss.speed} color="#00aaff" />
        <BossMiniStat label="LCK" value={boss.luck} color="#ffcc00" />
      </div>

      {/* Abilities */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {boss.abilities.map(a => (
            <span
              key={a.name}
              className="text-[8px] px-1.5 py-0.5 rounded bg-abyss-800/40 text-abyss-400 border border-abyss-700/15"
            >
              {a.name}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[9px] text-abyss-500 font-mono border-t border-abyss-700/10 pt-2.5">
        <span>
          <span className="text-green-400">{kills}</span> kills
          <span className="text-abyss-600 mx-1">/</span>
          <span className="text-red-400">{wipes}</span> wipes
          {total > 0 && (
            <span className="text-abyss-600 ml-1">({killRate}%)</span>
          )}
        </span>
        {lastRaid ? (
          <span className="text-abyss-600">{timeAgo(lastRaid.minutesAgo)}</span>
        ) : (
          <span className="text-abyss-700">No attempts</span>
        )}
      </div>
    </Link>
  );
}

function BossMiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-abyss-800/30 rounded-lg px-2 py-1.5 text-center">
      <div className="text-[8px] text-abyss-500 uppercase tracking-wider">{label}</div>
      <div className="text-[11px] font-mono font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function RaidLogEntry({ raid }: { raid: RaidResult }) {
  const boss = RAID_BOSSES.find(b => b.id === raid.bossId);
  if (!boss) return null;

  const tier = TIER_CONFIG[boss.tier];
  const isVictory = raid.outcome === "victory";
  const survived = raid.party.filter(p => p.koTurn === null).length;

  // Get loot items
  const lootItems = raid.lootDrops
    .map(d => getGearById(d.itemId))
    .filter((g): g is NonNullable<typeof g> => g != null);

  return (
    <Link
      to={`/raids/${boss.id}`}
      className="block px-5 py-3 hover:bg-abyss-800/15 transition-colors duration-200"
    >
      <div className="flex items-center gap-3">
        {/* Outcome badge */}
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

        {/* Boss info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{boss.name}</span>
            <span
              className="text-[7px] font-mono"
              style={{ color: tier.color }}
            >
              {tier.icon}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {raid.party.map(p => (
              <CreatureDot key={p.creatureAddress} species={p.species} />
            ))}
            <span className="text-[8px] text-abyss-600 ml-1">
              {survived}/{raid.party.length} survived
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="text-right flex-shrink-0">
          <div className="text-[9px] text-abyss-500 font-mono">{raid.totalTurns} turns</div>
          <div className="text-[8px] text-abyss-600">{timeAgo(raid.minutesAgo)}</div>
        </div>
      </div>

      {/* Loot row */}
      {lootItems.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 ml-10">
          <span className="text-[8px] text-abyss-600 uppercase tracking-wider">Loot:</span>
          {lootItems.map((item, i) => (
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
          ))}
        </div>
      )}
    </Link>
  );
}
