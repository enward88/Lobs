import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useLobs } from "./hooks/useLobs";
import { LobCard } from "./components/LobCard";
import { Leaderboard } from "./components/Leaderboard";
import { BattleLog } from "./components/BattleLog";
import { LobDetail } from "./components/LobDetail";

function Nav() {
  const location = useLocation();

  const links = [
    { to: "/", label: "All Lobs" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/battles", label: "Battles" },
  ];

  return (
    <nav className="border-b border-abyss-800 bg-abyss-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-2xl">🦞</span>
          <span className="bg-gradient-to-r from-abyss-400 to-abyss-600 bg-clip-text text-transparent">
            Lobs
          </span>
        </Link>

        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-abyss-700 text-white"
                  : "text-abyss-300 hover:text-white hover:bg-abyss-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function AllLobs() {
  const { lobs, loading, error } = useLobs();

  if (loading) {
    return (
      <div className="text-center py-20 text-abyss-400">
        <div className="text-4xl mb-4 animate-pulse">🦞</div>
        <p>Searching the deep...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        <p>Failed to fetch Lobs: {error}</p>
      </div>
    );
  }

  if (lobs.length === 0) {
    return (
      <div className="text-center py-20 text-abyss-400">
        <div className="text-6xl mb-4">🌊</div>
        <p className="text-xl">No Lobs minted yet</p>
        <p className="text-sm mt-2">
          The ocean awaits its first creatures...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Lobs</h1>
        <span className="text-abyss-400 text-sm">{lobs.length} creatures</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lobs.map((lob) => (
          <LobCard key={lob.address.toString()} lob={lob} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<AllLobs />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/battles" element={<BattleLog />} />
          <Route path="/lob/:address" element={<LobDetail />} />
        </Routes>
      </main>
      <footer className="border-t border-abyss-800 text-center py-6 text-abyss-500 text-sm">
        Lobs — on-chain creatures living in the deep
      </footer>
    </div>
  );
}
