import { useLobs, LobAccount } from "../hooks/useLobs";
import { CreatureDot } from "./CreatureArt";
import { SPECIES_NAME } from "../lib/program";

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

      {battlers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-abyss-500 tracking-wider uppercase text-sm mb-2">The arena is silent</p>
          <p className="text-abyss-600 text-xs">No battles have been fought yet</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
          <div className="px-5 py-3 border-b border-abyss-700/20">
            <span className="text-[10px] text-abyss-500 uppercase tracking-wider font-medium">
              Battle Records
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

  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-abyss-800/15 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <CreatureDot species={lob.species} />
        <div>
          <div className="font-medium text-sm text-white">{lob.name}</div>
          <div className="text-[10px] text-abyss-500">{speciesName} &middot; {lob.owner.slice(0, 8)}...</div>
        </div>
      </div>
      <div className="flex items-center gap-6">
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
      </div>
    </div>
  );
}
