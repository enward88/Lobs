import { useLobs, LobAccount } from "../hooks/useLobs";
import { SPECIES_EMOJI } from "../lib/program";

export function BattleLog() {
  const { lobs, loading, error } = useLobs();

  if (loading) {
    return (
      <div className="text-center py-20 text-abyss-400 animate-pulse">
        Loading battle data...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-400">{error}</div>;
  }

  // Show lobs that have battle history, sorted by total battles
  const battlers = lobs
    .filter((l) => l.battlesWon + l.battlesLost > 0)
    .sort((a, b) => b.battlesWon + b.battlesLost - (a.battlesWon + a.battlesLost));

  const totalBattles = lobs.reduce(
    (sum, l) => sum + l.battlesWon + l.battlesLost,
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Battle History</h1>
        <span className="text-abyss-400 text-sm">
          {Math.floor(totalBattles / 2)} total battles
        </span>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Most Victorious"
          lob={battlers[0]}
          stat={battlers[0]?.battlesWon ?? 0}
          unit="wins"
        />
        <StatCard
          label="Most Active"
          lob={
            battlers.sort(
              (a, b) =>
                b.battlesWon + b.battlesLost - (a.battlesWon + a.battlesLost)
            )[0]
          }
          stat={
            battlers[0]
              ? battlers[0].battlesWon + battlers[0].battlesLost
              : 0
          }
          unit="battles"
        />
        <StatCard
          label="Highest Win Rate"
          lob={
            [...battlers]
              .filter((l) => l.battlesWon + l.battlesLost >= 3)
              .sort(
                (a, b) =>
                  b.battlesWon / (b.battlesWon + b.battlesLost) -
                  a.battlesWon / (a.battlesWon + a.battlesLost)
              )[0]
          }
          stat={
            (() => {
              const top = [...battlers]
                .filter((l) => l.battlesWon + l.battlesLost >= 3)
                .sort(
                  (a, b) =>
                    b.battlesWon / (b.battlesWon + b.battlesLost) -
                    a.battlesWon / (a.battlesWon + a.battlesLost)
                )[0];
              return top
                ? Math.round(
                    (top.battlesWon / (top.battlesWon + top.battlesLost)) * 100
                  )
                : 0;
            })()
          }
          unit="%"
        />
      </div>

      {battlers.length === 0 ? (
        <div className="text-center py-20 text-abyss-400">
          <div className="text-4xl mb-4">⚔️</div>
          <p>No battles yet. The arena awaits...</p>
        </div>
      ) : (
        <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-abyss-800">
            <h2 className="text-sm font-medium text-abyss-300">
              Battle Records
            </h2>
          </div>
          <div className="divide-y divide-abyss-800/50">
            {battlers.map((lob) => (
              <BattlerRow key={lob.address.toString()} lob={lob} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  lob,
  stat,
  unit,
}: {
  label: string;
  lob?: LobAccount;
  stat: number;
  unit: string;
}) {
  if (!lob) {
    return (
      <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl p-4 text-center text-abyss-500">
        No data yet
      </div>
    );
  }

  const emoji = SPECIES_EMOJI[lob.species] || "❓";

  return (
    <div className="bg-abyss-900/60 border border-abyss-800 rounded-xl p-4">
      <div className="text-xs text-abyss-500 uppercase mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <div className="font-semibold">{lob.name}</div>
          <div className="text-sm text-abyss-400">
            {stat} {unit}
          </div>
        </div>
      </div>
    </div>
  );
}

function BattlerRow({ lob }: { lob: LobAccount }) {
  const emoji = SPECIES_EMOJI[lob.species] || "❓";
  const total = lob.battlesWon + lob.battlesLost;
  const winRate = total > 0 ? ((lob.battlesWon / total) * 100).toFixed(0) : "0";

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <div className="font-medium text-sm">{lob.name}</div>
          <div className="text-xs text-abyss-500">
            {lob.owner.toString().slice(0, 8)}...
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="text-green-400 font-medium">{lob.battlesWon}</div>
          <div className="text-[10px] text-abyss-500">WINS</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-medium">{lob.battlesLost}</div>
          <div className="text-[10px] text-abyss-500">LOSSES</div>
        </div>
        <div className="text-center min-w-[40px]">
          <div className="text-abyss-300 font-medium">{winRate}%</div>
          <div className="text-[10px] text-abyss-500">RATE</div>
        </div>
      </div>
    </div>
  );
}
