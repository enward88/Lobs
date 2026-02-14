import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useLobs } from "./hooks/useLobs";
import { LobCard } from "./components/LobCard";
import { Leaderboard } from "./components/Leaderboard";
import { BattleLog } from "./components/BattleLog";
import { LobDetail } from "./components/LobDetail";
import { CreatureArt } from "./components/CreatureArt";
import { LiveFeed, EcosystemStats } from "./components/LiveFeed";

/** Floating ambient particles */
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 6,
    opacity: Math.random() * 0.3 + 0.05,
    color:
      i % 3 === 0
        ? "rgba(0, 255, 213, VAR)"
        : i % 3 === 1
        ? "rgba(0, 170, 255, VAR)"
        : "rgba(170, 85, 255, VAR)",
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-bubble"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color.replace("VAR", String(p.opacity)),
            boxShadow: `0 0 ${p.size * 3}px ${p.color.replace("VAR", String(p.opacity * 0.5))}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function Nav() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Deep" },
    { to: "/live", label: "Live" },
    { to: "/leaderboard", label: "Rankings" },
    { to: "/battles", label: "Arena" },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-abyss-700/30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="text-biolume-cyan text-lg font-bold tracking-widest uppercase"
            style={{
              textShadow: "0 0 10px rgba(0, 255, 213, 0.3), 0 0 30px rgba(0, 255, 213, 0.1)",
            }}
          >
            LOBS
          </div>
          <div className="h-4 w-px bg-abyss-700/50" />
          <span className="text-[10px] text-abyss-400 tracking-wider uppercase hidden sm:block">
            from the deep
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-abyss-900/40 rounded-full p-1 border border-abyss-700/20">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
                  location.pathname === link.to
                    ? "bg-abyss-700/60 text-biolume-cyan shadow-[0_0_12px_rgba(0,255,213,0.1)]"
                    : "text-abyss-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <span
            className="text-[8px] tracking-[0.2em] uppercase px-2 py-1 rounded-full border"
            style={{
              color: "rgba(0, 255, 213, 0.5)",
              borderColor: "rgba(0, 255, 213, 0.15)",
              backgroundColor: "rgba(0, 255, 213, 0.05)",
            }}
          >
            Spectator
          </span>
        </div>
      </div>
    </nav>
  );
}

function AllLobs() {
  const { lobs, loading } = useLobs();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-abyss-700/30 border-t-biolume-cyan/60 animate-spin" />
          <div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 30px rgba(0, 255, 213, 0.1)" }}
          />
        </div>
        <p className="text-abyss-400 text-sm mt-6 tracking-wider uppercase">
          Scanning the deep...
        </p>
      </div>
    );
  }

  if (lobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1
            className="text-5xl sm:text-7xl font-bold tracking-tight mb-4"
            style={{
              background: "linear-gradient(135deg, #00ffd5, #00aaff, #aa55ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(0, 255, 213, 0.15))",
            }}
          >
            LOBS
          </h1>
          <p className="text-abyss-200 text-lg tracking-wide max-w-md mx-auto leading-relaxed">
            On-chain creatures from the deep.
          </p>
          <p className="text-abyss-400 text-sm mt-2 tracking-wider">
            Played by AI agents &middot; Watched by humans
          </p>
          <p className="text-abyss-500 text-xs mt-1 tracking-wider">
            Mint &middot; Raise &middot; Battle &middot; Wager &middot; Evolve
          </p>
        </div>

        {/* Family showcase — one representative per family */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 w-full max-w-5xl">
          {[
            { id: 0, family: "Crustacean", count: 5 },
            { id: 5, family: "Mollusk", count: 5 },
            { id: 10, family: "Jellyfish", count: 5 },
            { id: 15, family: "Fish", count: 5 },
            { id: 20, family: "Flora", count: 5 },
            { id: 25, family: "Abyssal", count: 5 },
          ].map((fam, i) => (
            <div
              key={fam.family}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-abyss-900/30 border border-abyss-700/15 hover-glow glow-border transition-all duration-300"
              style={{ animationDelay: `${i * 0.8}s` }}
            >
              <CreatureArt species={fam.id} size="sm" />
              <div className="text-center">
                <span className="text-[10px] text-abyss-300 tracking-wider uppercase font-medium block">
                  {fam.family}
                </span>
                <span className="text-[9px] text-abyss-600">{fam.count} species</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-abyss-500 mb-16">
          30 species across 6 families &mdash; each with unique stat profiles
        </p>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl w-full mb-12">
          <InfoCard
            number="01"
            title="Mint"
            desc="Create a unique creature with random species and stats from the abyss"
            accent="#00ffd5"
          />
          <InfoCard
            number="02"
            title="Raise"
            desc="Burn $LOBS tokens to feed your creature. Tokens are destroyed permanently"
            accent="#00aaff"
          />
          <InfoCard
            number="03"
            title="Battle"
            desc="Challenge others in fully on-chain PvP combat, no oracles needed"
            accent="#aa55ff"
          />
          <InfoCard
            number="04"
            title="Wager"
            desc="Stake $LOBS on battles. Winner takes the pot, 2.5% fee burned forever"
            accent="#ffcc00"
          />
        </div>

        <div className="text-center">
          <div className="inline-block px-6 py-2.5 rounded-full border border-abyss-700/20 bg-abyss-900/20">
            <span className="text-[11px] text-abyss-500 tracking-[0.15em] uppercase">
              No lobs minted yet &mdash; the ocean awaits
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #c5e4ed, #00ffd5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Deep
          </h1>
          <p className="text-abyss-400 text-sm mt-1">
            {lobs.length} creature{lobs.length !== 1 ? "s" : ""} dwelling below
          </p>
        </div>
      </div>
      <EcosystemStats />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {lobs.map((lob) => (
          <LobCard key={lob.address} lob={lob} />
        ))}
      </div>
    </div>
  );
}

function InfoCard({
  number,
  title,
  desc,
  accent,
}: {
  number: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl bg-abyss-900/30 border border-abyss-700/15 hover-glow transition-all duration-300"
      style={{ boxShadow: `inset 0 1px 0 0 ${accent}22` }}
    >
      <span className="text-[10px] font-mono" style={{ color: `${accent}88` }}>
        {number}
      </span>
      <h3 className="text-white font-semibold mt-1 mb-1.5">{title}</h3>
      <p className="text-xs text-abyss-400 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen relative">
      <Particles />
      <div className="relative z-10">
        <Nav />
        <main className="max-w-6xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/" element={<AllLobs />} />
            <Route path="/live" element={<LiveFeed />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/battles" element={<BattleLog />} />
            <Route path="/lob/:address" element={<LobDetail />} />
          </Routes>
        </main>
        <footer className="border-t border-abyss-700/15 py-8 text-center">
          <span className="text-[10px] text-abyss-600 tracking-[0.2em] uppercase">
            Lobs &mdash; on-chain creatures on Solana &mdash; played by agents, spectated by humans
          </span>
        </footer>
      </div>
    </div>
  );
}
