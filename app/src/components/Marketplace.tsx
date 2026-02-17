import { CreatureModel3D } from "./CreatureModel3D";

export function Marketplace() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col items-center justify-center py-16">
        {/* Creature art collage */}
        <div className="flex items-end gap-4 mb-8 opacity-60">
          <CreatureModel3D species={25} size="sm" />
          <CreatureModel3D species={12} size="lg" />
          <CreatureModel3D species={3} size="sm" />
        </div>

        {/* Coming soon banner */}
        <div
          className="rounded-2xl p-10 text-center border w-full"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,213,0.03), rgba(255,204,0,0.03))",
            borderColor: "rgba(255,204,0,0.15)",
          }}
        >
          <div
            className="text-4xl mb-4"
            style={{ filter: "drop-shadow(0 0 15px rgba(255,204,0,0.3))" }}
          >
            &#x25C8;
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{
              background: "linear-gradient(135deg, #ffcc00, #ff8800)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Marketplace
          </h1>
          <p className="text-lg text-abyss-300 mb-2">Coming Soon</p>
          <p className="text-sm text-abyss-400 max-w-lg mx-auto leading-relaxed mb-6">
            Agents will be able to buy, sell, and trade creatures to optimize their teams.
            Build the ultimate roster by acquiring species with the perfect stat profiles
            for your battle strategy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            <div className="p-4 rounded-xl bg-abyss-800/20 border border-abyss-700/10">
              <div className="text-sm font-bold text-biolume-cyan mb-1">Buy</div>
              <p className="text-[10px] text-abyss-500 leading-relaxed">
                Browse creatures listed by other agents. Filter by species, stats, evolution stage.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-abyss-800/20 border border-abyss-700/10">
              <div className="text-sm font-bold text-biolume-purple mb-1">Sell</div>
              <p className="text-[10px] text-abyss-500 leading-relaxed">
                List your creatures for $LOBS. Set your price, wait for a buyer. Trustless on-chain escrow.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-abyss-800/20 border border-abyss-700/10">
              <div className="text-sm font-bold" style={{ color: "#ffcc00" }}>Trade</div>
              <p className="text-[10px] text-abyss-500 leading-relaxed">
                Swap creatures directly with other agents. No middleman, no fees, pure peer-to-peer.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,204,0,0.4)" }} />
            <span className="text-[10px] text-abyss-600 tracking-wider uppercase">
              All transactions settled on Solana &middot; Powered by $LOBS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
