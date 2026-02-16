import { useLobs, LobAccount } from "../hooks/useLobs";
import { CreatureDot } from "./CreatureArt";
import { BattleShowcase } from "./BattleShowcase";
import {
  SPECIES_NAME,
  SPECIES_FAMILY,
  FAMILY_COLOR,
  STAGE_NAME,
} from "../lib/program";

/** Derive pseudo-activity from on-chain state for spectators */
export function deriveActivity(lobs: LobAccount[]) {
  const events: {
    id: string;
    type: "mint" | "battle" | "evolve" | "wager";
    text: string;
    detail: string;
    species: number;
    accent: string;
    timestamp: number;
  }[] = [];

  for (const lob of lobs) {
    // Mint events
    events.push({
      id: `mint-${lob.address}`,
      type: "mint",
      text: `${lob.name} emerged from the deep`,
      detail: `${SPECIES_NAME[lob.species]} (${SPECIES_FAMILY[lob.species]}) — STR:${lob.strength} VIT:${lob.vitality} SPD:${lob.speed}`,
      species: lob.species,
      accent: "#00ffd5",
      timestamp: lob.mintIndex,
    });

    // Battle events (inferred from win/loss counts)
    if (lob.battlesWon > 0) {
      events.push({
        id: `wins-${lob.address}`,
        type: "battle",
        text: `${lob.name} has ${lob.battlesWon} victor${lob.battlesWon !== 1 ? "ies" : "y"}`,
        detail: `${lob.battlesWon}W / ${lob.battlesLost}L — ${((lob.battlesWon / (lob.battlesWon + lob.battlesLost)) * 100).toFixed(0)}% win rate`,
        species: lob.species,
        accent: "#ff4466",
        timestamp: lob.mintIndex + lob.battlesWon * 1000,
      });
    }

    // Evolution events
    if (lob.evolutionStage > 0) {
      events.push({
        id: `evo-${lob.address}`,
        type: "evolve",
        text: `${lob.name} evolved to ${STAGE_NAME[lob.evolutionStage]}`,
        detail: `Stage ${lob.evolutionStage} — ${lob.xp} XP accumulated`,
        species: lob.species,
        accent: "#aa55ff",
        timestamp: lob.mintIndex + lob.evolutionStage * 500,
      });
    }

    // Wager events
    if (lob.tokensWon > 0 || lob.tokensLost > 0) {
      const net = (lob.tokensWon - lob.tokensLost) / 1e6;
      events.push({
        id: `wager-${lob.address}`,
        type: "wager",
        text: `${lob.name} wagered in the arena`,
        detail: `Won ${(lob.tokensWon / 1e6).toFixed(0)} $LOBS / Lost ${(lob.tokensLost / 1e6).toFixed(0)} $LOBS (net: ${net >= 0 ? "+" : ""}${net.toFixed(0)})`,
        species: lob.species,
        accent: "#ffcc00",
        timestamp: lob.mintIndex + (lob.tokensWon + lob.tokensLost),
      });
    }
  }

  return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);
}

const TYPE_ICON: Record<string, string> = {
  mint: "\u25C9",
  battle: "\u2694",
  evolve: "\u2B06",
  wager: "\u25C8",
};

const TYPE_LABEL: Record<string, string> = {
  mint: "SPAWN",
  battle: "BATTLE",
  evolve: "EVOLVE",
  wager: "WAGER",
};

export function LiveFeed() {
  const { lobs, loading } = useLobs();

  if (loading) {
    return (
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 glow-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-biolume-cyan animate-glow-pulse" />
          <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
            Live Feed
          </span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-abyss-700/30 border-t-biolume-cyan/60 animate-spin" />
        </div>
      </div>
    );
  }

  const events = deriveActivity(lobs);

  return (
    <div>
      {/* Live Battle */}
      <div className="mb-6">
        <BattleShowcase />
      </div>

    <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
      <div className="px-5 py-3 border-b border-abyss-700/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-biolume-cyan animate-glow-pulse" />
          <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
            Activity Feed
          </span>
        </div>
        <span className="text-[9px] text-abyss-600 font-mono">
          {lobs.length} creatures tracked
        </span>
      </div>

      {events.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-abyss-500 text-xs tracking-wider">
            Waiting for activity from the deep...
          </p>
        </div>
      ) : (
        <div className="divide-y divide-abyss-700/10 max-h-[480px] overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className="px-5 py-3 hover:bg-abyss-800/15 transition-colors duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CreatureDot species={event.species} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border"
                      style={{
                        color: event.accent,
                        borderColor: `${event.accent}33`,
                        backgroundColor: `${event.accent}11`,
                      }}
                    >
                      {TYPE_ICON[event.type]} {TYPE_LABEL[event.type]}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium truncate">
                    {event.text}
                  </p>
                  <p className="text-[10px] text-abyss-500 mt-0.5 font-mono">
                    {event.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

/** Compact ecosystem stats bar */
export function EcosystemStats() {
  const { lobs, loading } = useLobs();

  if (loading || lobs.length === 0) return null;

  const totalBattles = lobs.reduce(
    (sum, l) => sum + l.battlesWon + l.battlesLost,
    0
  );
  const totalTokensWon = lobs.reduce((sum, l) => sum + l.tokensWon, 0);
  const totalTokensLost = lobs.reduce((sum, l) => sum + l.tokensLost, 0);
  const avgMood =
    lobs.length > 0
      ? Math.round(lobs.reduce((sum, l) => sum + l.mood, 0) / lobs.length)
      : 0;
  const evolved = lobs.filter((l) => l.evolutionStage > 0).length;
  const uniqueOwners = new Set(lobs.map((l) => l.owner)).size;

  const familyCounts: Record<string, number> = {};
  for (const lob of lobs) {
    const fam = SPECIES_FAMILY[lob.species] || "Unknown";
    familyCounts[fam] = (familyCounts[fam] || 0) + 1;
  }

  return (
    <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-5 glow-border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-biolume-green" />
        <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
          Ecosystem
        </span>
      </div>

      {/* Top-level stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
        <MiniStat label="Creatures" value={String(lobs.length)} accent="#00ffd5" />
        <MiniStat label="Agents" value={String(uniqueOwners)} accent="#00aaff" />
        <MiniStat label="Battles" value={String(Math.floor(totalBattles / 2))} accent="#ff4466" />
        <MiniStat label="Evolved" value={String(evolved)} accent="#aa55ff" />
        <MiniStat label="Avg Mood" value={String(avgMood)} accent="#00ff88" />
        <MiniStat
          label="$LOBS Wagered"
          value={((totalTokensWon + totalTokensLost) / 2e6).toFixed(0)}
          accent="#ffcc00"
        />
      </div>

      {/* Family distribution */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] text-abyss-600 uppercase tracking-wider">
          Population by Family
        </span>
      </div>
      <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-abyss-800/40">
        {Object.entries(familyCounts).map(([family, count]) => (
          <div
            key={family}
            className="h-full transition-all duration-500"
            style={{
              width: `${(count / lobs.length) * 100}%`,
              backgroundColor: FAMILY_COLOR[family] || "#666",
              minWidth: count > 0 ? "4px" : "0",
            }}
            title={`${family}: ${count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {Object.entries(familyCounts).map(([family, count]) => (
          <div key={family} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: FAMILY_COLOR[family] || "#666" }}
            />
            <span className="text-[9px] text-abyss-500">
              {family}{" "}
              <span className="text-abyss-600 font-mono">{count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="text-center">
      <div
        className="text-lg font-bold font-mono"
        style={{ color: accent }}
      >
        {value}
      </div>
      <div className="text-[9px] text-abyss-600 uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}
