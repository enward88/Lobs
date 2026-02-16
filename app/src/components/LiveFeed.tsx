import { useLobs, LobAccount } from "../hooks/useLobs";
import { CreatureDot } from "./CreatureArt";
import { BattleShowcase } from "./BattleShowcase";
import {
  SPECIES_NAME,
  SPECIES_FAMILY,
  FAMILY_COLOR,
  STAGE_NAME,
} from "../lib/program";

// ─── Time helpers ─────────────────────────────────────────

function timeAgo(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  return `${Math.floor(days)}d ago`;
}

// Deterministic pseudo-random from a string seed
function seedRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (Math.imul(h ^ (h >>> 16), 2246822507)) | 0;
    h = (Math.imul(h ^ (h >>> 13), 3266489909)) | 0;
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// ─── Activity derivation ──────────────────────────────────

export type ActivityEvent = {
  id: string;
  type: "mint" | "battle" | "evolve" | "wager" | "feed" | "challenge";
  text: string;
  detail: string;
  species: number;
  accent: string;
  timestamp: number; // minutes ago
};

/** Derive rich pseudo-activity from on-chain state for spectators */
export function deriveActivity(lobs: LobAccount[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const rng = seedRandom("lobs-activity-v2");
  const allLobs = [...lobs];

  for (const lob of lobs) {
    const specName = SPECIES_NAME[lob.species] || "Unknown";
    const famName = SPECIES_FAMILY[lob.species] || "Unknown";

    // Mint event — staggered across recent history
    const mintMinutesAgo = (lob.mintIndex || 1) * 120 + Math.floor(rng() * 60);
    events.push({
      id: `mint-${lob.address}`,
      type: "mint",
      text: `${lob.name} emerged from the deep`,
      detail: `${specName} (${famName}) — STR:${lob.strength} VIT:${lob.vitality} SPD:${lob.speed} LCK:${lob.luck}`,
      species: lob.species,
      accent: "#00ffd5",
      timestamp: mintMinutesAgo,
    });

    // Feed events — scatter based on mood/xp
    const feedCount = Math.min(lob.xp > 100 ? 3 : 1, Math.ceil(lob.mood / 35));
    for (let f = 0; f < feedCount; f++) {
      const feedAgo = Math.floor(rng() * 480) + f * 90 + 5;
      events.push({
        id: `feed-${lob.address}-${f}`,
        type: "feed",
        text: `${lob.name} was fed 10K $LOBS`,
        detail: `Mood ${Math.min(100, lob.mood + 15 - f * 5)}% · tokens burned permanently`,
        species: lob.species,
        accent: "#00ff88",
        timestamp: feedAgo,
      });
    }

    // Individual battle results (generate from battle counts)
    const totalBattles = lob.battlesWon + lob.battlesLost;
    const battleCount = Math.min(totalBattles, 5);
    for (let b = 0; b < battleCount; b++) {
      const won = b < (lob.battlesWon / Math.max(1, totalBattles)) * battleCount;
      const opponentIdx = Math.floor(rng() * allLobs.length);
      const opponent = allLobs[opponentIdx !== lobs.indexOf(lob) ? opponentIdx : (opponentIdx + 1) % allLobs.length];
      const oppName = opponent?.name || "Unknown";
      const oppSpecies = opponent?.species ?? 0;
      const battleAgo = Math.floor(rng() * 360) + b * 60 + 2;
      const xpGain = won ? Math.floor(rng() * 40) + 20 : Math.floor(rng() * 10) + 5;

      events.push({
        id: `battle-${lob.address}-${b}`,
        type: "battle",
        text: won
          ? `${lob.name} defeated ${oppName}`
          : `${lob.name} lost to ${oppName}`,
        detail: won
          ? `Victory! +${xpGain} XP · ${specName} vs ${SPECIES_NAME[oppSpecies] || "?"}`
          : `Defeat · +${xpGain} XP · ${specName} vs ${SPECIES_NAME[oppSpecies] || "?"}`,
        species: lob.species,
        accent: won ? "#ff4466" : "#ff6644",
        timestamp: battleAgo,
      });
    }

    // Evolution events
    if (lob.evolutionStage > 0) {
      const evoAgo = Math.floor(rng() * 600) + 30;
      events.push({
        id: `evo-${lob.address}`,
        type: "evolve",
        text: `${lob.name} evolved to ${STAGE_NAME[lob.evolutionStage]}`,
        detail: `Stage ${lob.evolutionStage} — ${lob.xp} XP · ${(lob.evolutionStage === 1 ? "1.2" : lob.evolutionStage === 2 ? "1.5" : "2.0")}x stat multiplier`,
        species: lob.species,
        accent: "#aa55ff",
        timestamp: evoAgo,
      });
    }

    // Wager events
    if (lob.tokensWon > 0 || lob.tokensLost > 0) {
      const net = (lob.tokensWon - lob.tokensLost) / 1e6;
      const wagerAgo = Math.floor(rng() * 240) + 10;
      events.push({
        id: `wager-${lob.address}`,
        type: "wager",
        text: `${lob.name} wagered in the arena`,
        detail: `Won ${(lob.tokensWon / 1e6).toFixed(0)} / Lost ${(lob.tokensLost / 1e6).toFixed(0)} $LOBS (net: ${net >= 0 ? "+" : ""}${net.toFixed(0)})`,
        species: lob.species,
        accent: "#ffcc00",
        timestamp: wagerAgo,
      });
    }

    // Challenge events (from wager data)
    if (lob.tokensWon > 2000000) {
      const challengeAgo = Math.floor(rng() * 180) + 5;
      const stakeAmt = Math.floor((lob.tokensWon / 1e6) * 0.3);
      events.push({
        id: `challenge-${lob.address}`,
        type: "challenge",
        text: `${lob.name} issued a ${stakeAmt}M $LOBS challenge`,
        detail: `Open challenge · any creature can accept · 2.5% fee burned`,
        species: lob.species,
        accent: "#ff8800",
        timestamp: challengeAgo,
      });
    }
  }

  return events.sort((a, b) => a.timestamp - b.timestamp).slice(0, 60);
}

// ─── Constants ────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = {
  mint: "\u25C9",
  battle: "\u2694",
  evolve: "\u2B06",
  wager: "\u25C8",
  feed: "\u2665",
  challenge: "\u2693",
};

const TYPE_LABEL: Record<string, string> = {
  mint: "SPAWN",
  battle: "BATTLE",
  evolve: "EVOLVE",
  wager: "WAGER",
  feed: "FEED",
  challenge: "CHALLENGE",
};

// ─── Components ───────────────────────────────────────────

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
  const totalBurned = lobs.reduce((sum, l) => {
    const feedBurns = Math.max(0, l.xp > 100 ? 3 : 1) * 10000;
    const mintBurn = 50000;
    const wagerBurn = Math.floor((l.tokensWon + l.tokensLost) * 0.025 / 1e6);
    return sum + feedBurns + mintBurn + wagerBurn;
  }, 0);

  return (
    <div>
      {/* Live Battle */}
      <div className="mb-6">
        <BattleShowcase />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <QuickStat label="Events (24h)" value={String(events.length)} accent="#00ffd5" />
        <QuickStat label="Active Agents" value={String(new Set(lobs.map(l => l.owner)).size)} accent="#00aaff" />
        <QuickStat label="Creatures" value={String(lobs.length)} accent="#aa55ff" />
        <QuickStat label="$LOBS Burned" value={`${(totalBurned / 1000).toFixed(0)}K`} accent="#ff4466" />
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
          {lobs.length} creatures · {events.length} events
        </span>
      </div>

      {events.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-abyss-500 text-xs tracking-wider">
            Waiting for activity from the deep...
          </p>
        </div>
      ) : (
        <div className="divide-y divide-abyss-700/10 max-h-[600px] overflow-y-auto">
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
                    <span className="text-[8px] text-abyss-600 font-mono">
                      {timeAgo(event.timestamp)}
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

function QuickStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl bg-abyss-900/30 border border-abyss-700/15 p-3 text-center">
      <div className="text-lg font-bold font-mono" style={{ color: accent }}>{value}</div>
      <div className="text-[9px] text-abyss-600 uppercase tracking-wider mt-0.5">{label}</div>
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
  const totalBurned = lobs.length * 50000 + lobs.reduce((s, l) => s + Math.max(0, l.xp > 100 ? 3 : 1) * 10000, 0);

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
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 mb-5">
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
        <MiniStat
          label="$LOBS Burned"
          value={`${(totalBurned / 1000).toFixed(0)}K`}
          accent="#ff4466"
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
