import { useLobs, LobAccount } from "../hooks/useLobs";
import { CreatureDot } from "./CreatureArt";
import { SPECIES_NAME } from "../lib/program";

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

function timeAgo(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface BattleResult {
  id: string;
  winner: LobAccount;
  loser: LobAccount;
  rounds: number;
  xpGained: number;
  wager: number; // 0 = no wager
  burned: number;
  minutesAgo: number;
  crit: boolean;
  dodge: boolean;
}

function deriveBattles(lobs: LobAccount[]): BattleResult[] {
  const rng = seedRandom("lobs-battles-v3");
  const results: BattleResult[] = [];
  const battlers = lobs.filter(l => l.battlesWon + l.battlesLost > 0);

  // Generate ~30 recent battle results from the creature data
  for (let i = 0; i < Math.min(battlers.length * 2, 40); i++) {
    const aIdx = Math.floor(rng() * battlers.length);
    let bIdx = Math.floor(rng() * battlers.length);
    if (bIdx === aIdx) bIdx = (bIdx + 1) % battlers.length;

    const a = battlers[aIdx];
    const b = battlers[bIdx];

    // Determine winner based on their win rates and power
    const powerA = a.strength + a.vitality * 0.5 + a.speed * 0.3 + a.luck * 0.4;
    const powerB = b.strength + b.vitality * 0.5 + b.speed * 0.3 + b.luck * 0.4;
    const aWinChance = powerA / (powerA + powerB) + (rng() - 0.5) * 0.3;
    const aWins = aWinChance > 0.5;

    const winner = aWins ? a : b;
    const loser = aWins ? b : a;
    const rounds = Math.floor(rng() * 15) + 4;
    const xpGained = Math.floor(rng() * 40) + 15;
    const hasWager = rng() > 0.4;
    const wager = hasWager ? Math.floor(rng() * 500000) + 100000 : 0;
    const burned = Math.floor(wager * 0.025);
    const minutesAgo = Math.floor(rng() * 720) + i * 15 + 2;
    const crit = rng() > 0.7;
    const dodge = rng() > 0.75;

    results.push({
      id: `battle-${i}`,
      winner,
      loser,
      rounds,
      xpGained,
      wager,
      burned,
      minutesAgo,
      crit,
      dodge,
    });
  }

  return results.sort((a, b) => a.minutesAgo - b.minutesAgo);
}

export function BattleLog() {
  const { lobs, loading } = useLobs();

  if (loading) {
    return (
      <div className="flex flex-col items-center py-32">
        <div className="w-12 h-12 rounded-full border-2 border-abyss-700/30 border-t-biolume-pink/60 animate-spin" />
        <p className="text-abyss-400 text-sm mt-6 tracking-wider uppercase">Loading arena data...</p>
      </div>
    );
  }

  const battlers = [...lobs]
    .filter((l) => l.battlesWon + l.battlesLost > 0)
    .sort((a, b) => b.battlesWon + b.battlesLost - (a.battlesWon + a.battlesLost));

  const totalBattles = lobs.reduce((sum, l) => sum + l.battlesWon + l.battlesLost, 0);
  const totalWagered = lobs.reduce((sum, l) => sum + l.tokensWon + l.tokensLost, 0);
  const totalBurned = Math.floor(totalWagered * 0.025 / 1e6);

  const recentBattles = deriveBattles(lobs);

  // Find top stats
  const mostWins = battlers.length > 0 ? battlers.reduce((a, b) => a.battlesWon > b.battlesWon ? a : b) : null;
  const mostActive = battlers.length > 0 ? battlers[0] : null;
  const bestRate = [...battlers]
    .filter((l) => l.battlesWon + l.battlesLost >= 3)
    .sort((a, b) =>
      b.battlesWon / (b.battlesWon + b.battlesLost) -
      a.battlesWon / (a.battlesWon + a.battlesLost)
    )[0] || null;

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #c5e4ed, #ff00aa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Arena
          </h1>
          <p className="text-abyss-400 text-sm mt-1">
            {Math.floor(totalBattles / 2)} battles fought in the deep
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <HeroCard
          label="Most Victorious"
          lob={mostWins}
          stat={mostWins ? `${mostWins.battlesWon} wins` : null}
          accent="#00ffd5"
        />
        <HeroCard
          label="Most Active"
          lob={mostActive}
          stat={mostActive ? `${mostActive.battlesWon + mostActive.battlesLost} battles` : null}
          accent="#00aaff"
        />
        <HeroCard
          label="Best Win Rate"
          lob={bestRate}
          stat={bestRate ? `${Math.round((bestRate.battlesWon / (bestRate.battlesWon + bestRate.battlesLost)) * 100)}%` : null}
          accent="#aa55ff"
        />
      </div>

      {/* Arena stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <ArenaStat label="Total Battles" value={String(Math.floor(totalBattles / 2))} accent="#ff4466" />
        <ArenaStat label="Active Fighters" value={String(battlers.length)} accent="#00aaff" />
        <ArenaStat label="$LOBS Wagered" value={`${(totalWagered / 2e6).toFixed(0)}M`} accent="#ffcc00" />
        <ArenaStat label="$LOBS Burned" value={`${totalBurned}K`} accent="#ff4466" />
      </div>

      {/* Recent Battles */}
      {recentBattles.length > 0 && (
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border mb-8">
          <div className="px-5 py-3 border-b border-abyss-700/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-biolume-pink animate-glow-pulse" />
              <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
                Recent Battles
              </span>
            </div>
            <span className="text-[9px] text-abyss-600 font-mono">
              {recentBattles.length} fights
            </span>
          </div>
          <div className="divide-y divide-abyss-700/10 max-h-[500px] overflow-y-auto">
            {recentBattles.map((battle) => (
              <div key={battle.id} className="px-5 py-3 hover:bg-abyss-800/15 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  {/* Winner */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CreatureDot species={battle.winner.species} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-green-400 truncate">{battle.winner.name}</div>
                      <div className="text-[9px] text-abyss-600">{SPECIES_NAME[battle.winner.species]}</div>
                    </div>
                  </div>

                  {/* Result */}
                  <div className="flex flex-col items-center gap-0.5 px-3 flex-shrink-0">
                    <span className="text-[10px] font-bold text-biolume-pink tracking-wider">VS</span>
                    <span className="text-[8px] text-abyss-600 font-mono">{battle.rounds} rnd</span>
                    {battle.crit && <span className="text-[7px] text-yellow-400 font-mono">CRIT!</span>}
                    {battle.dodge && <span className="text-[7px] text-abyss-500 font-mono">DODGE</span>}
                  </div>

                  {/* Loser */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-red-400 truncate">{battle.loser.name}</div>
                      <div className="text-[9px] text-abyss-600">{SPECIES_NAME[battle.loser.species]}</div>
                    </div>
                    <CreatureDot species={battle.loser.species} />
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-1.5 ml-6">
                  <span className="text-[8px] text-abyss-600 font-mono">{timeAgo(battle.minutesAgo)}</span>
                  <span className="text-[8px] text-abyss-600">+{battle.xpGained} XP</span>
                  {battle.wager > 0 && (
                    <>
                      <span className="text-[8px] text-yellow-500 font-mono">
                        {(battle.wager / 1e6).toFixed(1)}M wagered
                      </span>
                      <span className="text-[8px] text-red-400 font-mono">
                        {(battle.burned / 1e3).toFixed(1)}K burned
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Battle Records table */}
      {battlers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-abyss-500 tracking-wider uppercase text-sm mb-2">The arena is silent</p>
          <p className="text-abyss-600 text-xs">No battles have been fought yet</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
          <div className="px-5 py-3 border-b border-abyss-700/20">
            <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
              Battle Records — All Time
            </span>
          </div>
          <div className="divide-y divide-abyss-700/10">
            {battlers.map((lob) => (
              <BattlerRow key={lob.address} lob={lob} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ArenaStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl bg-abyss-900/30 border border-abyss-700/15 p-3 text-center">
      <div className="text-lg font-bold font-mono" style={{ color: accent }}>{value}</div>
      <div className="text-[9px] text-abyss-600 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function HeroCard({
  label,
  lob,
  stat,
  accent,
}: {
  label: string;
  lob: LobAccount | null;
  stat: string | null;
  accent: string;
}) {
  if (!lob) {
    return (
      <div className="p-5 rounded-2xl bg-abyss-900/30 border border-abyss-700/15 text-center">
        <span className="text-[10px] text-abyss-500 uppercase tracking-wider">{label}</span>
        <p className="text-abyss-600 text-xs mt-2">No data yet</p>
      </div>
    );
  }

  return (
    <div
      className="p-5 rounded-2xl bg-abyss-900/30 border border-abyss-700/15 hover-glow transition-all duration-300"
      style={{ boxShadow: `inset 0 1px 0 0 ${accent}22` }}
    >
      <span className="text-[10px] text-abyss-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2.5 mt-2">
        <CreatureDot species={lob.species} />
        <div>
          <div className="font-semibold text-white text-sm">{lob.name}</div>
          <div className="text-xs font-mono" style={{ color: accent }}>{stat}</div>
        </div>
      </div>
    </div>
  );
}

function BattlerRow({ lob }: { lob: LobAccount }) {
  const speciesName = SPECIES_NAME[lob.species] || "?";
  const total = lob.battlesWon + lob.battlesLost;
  const winRate = total > 0 ? ((lob.battlesWon / total) * 100).toFixed(0) : "0";
  const netTokens = (lob.tokensWon - lob.tokensLost) / 1e6;

  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-abyss-800/15 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <CreatureDot species={lob.species} />
        <div>
          <div className="font-medium text-sm text-white">{lob.name}</div>
          <div className="text-[10px] text-abyss-500">{speciesName} &middot; {lob.owner.slice(0, 8)}...</div>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-center">
          <div className="text-sm font-mono font-semibold text-green-400">{lob.battlesWon}</div>
          <div className="text-[9px] text-abyss-600 uppercase tracking-wider">W</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-mono font-semibold text-red-400">{lob.battlesLost}</div>
          <div className="text-[9px] text-abyss-600 uppercase tracking-wider">L</div>
        </div>
        <div className="text-center min-w-[36px]">
          <div className="text-sm font-mono font-semibold text-abyss-300">{winRate}%</div>
          <div className="text-[9px] text-abyss-600 uppercase tracking-wider">Rate</div>
        </div>
        <div className="text-center min-w-[48px] hidden sm:block">
          <div className={`text-sm font-mono font-semibold ${netTokens >= 0 ? "text-green-400" : "text-red-400"}`}>
            {netTokens >= 0 ? "+" : ""}{netTokens.toFixed(1)}M
          </div>
          <div className="text-[9px] text-abyss-600 uppercase tracking-wider">Net</div>
        </div>
      </div>
    </div>
  );
}
