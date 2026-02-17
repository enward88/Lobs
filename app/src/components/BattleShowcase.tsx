import { useState, useEffect, useRef } from "react";
import { CreatureModel3D } from "./CreatureModel3D";
import { SPECIES_NAME, SPECIES_FAMILY, FAMILY_COLOR } from "../lib/program";

interface BattleState {
  phase: "intro" | "fighting" | "winner";
  speciesA: number;
  speciesB: number;
  hpA: number;
  hpB: number;
  maxHpA: number;
  maxHpB: number;
  strA: number;
  strB: number;
  spdA: number;
  spdB: number;
  lckA: number;
  lckB: number;
  turn: "a" | "b";
  hits: { id: number; side: "a" | "b"; damage: number; crit: boolean; dodge: boolean; time: number }[];
  winner: "a" | "b" | null;
  round: number;
}

function randomSpecies(): number {
  return Math.floor(Math.random() * 30);
}

function randomStat(base: number, variance: number): number {
  return base + Math.floor(Math.random() * variance);
}

function initBattle(): BattleState {
  const speciesA = randomSpecies();
  let speciesB = randomSpecies();
  while (speciesB === speciesA) speciesB = randomSpecies();

  const maxHpA = randomStat(40, 30);
  const maxHpB = randomStat(40, 30);

  return {
    phase: "intro",
    speciesA,
    speciesB,
    hpA: maxHpA,
    hpB: maxHpB,
    maxHpA,
    maxHpB,
    strA: randomStat(5, 10),
    strB: randomStat(5, 10),
    spdA: randomStat(5, 10),
    spdB: randomStat(5, 10),
    lckA: randomStat(3, 12),
    lckB: randomStat(3, 12),
    turn: "a",
    hits: [],
    winner: null,
    round: 0,
  };
}

export function BattleShowcase() {
  const [battle, setBattle] = useState<BattleState>(initBattle);
  const frameRef = useRef(0);
  const lastTickRef = useRef(0);
  const hitIdRef = useRef(0);

  useEffect(() => {
    let raf: number;
    const INTRO_MS = 1500;
    const TICK_MS = 600;
    const WINNER_MS = 2500;
    let phaseStart = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);

      setBattle((prev) => {
        if (prev.phase === "intro") {
          if (now - phaseStart > INTRO_MS) {
            phaseStart = now;
            lastTickRef.current = now;
            return { ...prev, phase: "fighting" };
          }
          return prev;
        }

        if (prev.phase === "fighting") {
          if (now - lastTickRef.current < TICK_MS) return prev;
          lastTickRef.current = now;

          const next = { ...prev, hits: [...prev.hits] };

          // Determine attacker
          const attacker = next.turn;
          const attackerLck = attacker === "a" ? next.lckA : next.lckB;
          const defenderLck = attacker === "a" ? next.lckB : next.lckA;
          const baseDmg = attacker === "a"
            ? Math.max(1, next.strA + Math.floor(Math.random() * 4) - 1)
            : Math.max(1, next.strB + Math.floor(Math.random() * 4) - 1);

          // Dodge check: defender luck * 1.5% chance
          const dodgeRoll = Math.random() * 100;
          const dodged = dodgeRoll < defenderLck * 1.5;

          // Crit check: attacker luck * 2% chance
          const critRoll = Math.random() * 100;
          const critted = !dodged && critRoll < attackerLck * 2;

          const damage = dodged ? 0 : critted ? baseDmg * 2 : baseDmg;

          if (attacker === "a") {
            next.hpB = Math.max(0, next.hpB - damage);
            next.hits.push({
              id: ++hitIdRef.current,
              side: "b",
              damage,
              crit: critted,
              dodge: dodged,
              time: now,
            });
          } else {
            next.hpA = Math.max(0, next.hpA - damage);
            next.hits.push({
              id: ++hitIdRef.current,
              side: "a",
              damage,
              crit: critted,
              dodge: dodged,
              time: now,
            });
          }

          next.round++;

          // Check for winner
          if (next.hpA <= 0) {
            next.winner = "b";
            next.phase = "winner";
            phaseStart = now;
          } else if (next.hpB <= 0) {
            next.winner = "a";
            next.phase = "winner";
            phaseStart = now;
          }

          // Alternate turns based on speed
          if (next.spdA >= next.spdB) {
            next.turn = next.turn === "a" ? "b" : "a";
          } else {
            next.turn = next.turn === "b" ? "a" : "b";
          }

          // Clean old hits
          next.hits = next.hits.filter((h) => now - h.time < 1200);

          return next;
        }

        if (prev.phase === "winner") {
          if (now - phaseStart > WINNER_MS) {
            phaseStart = now;
            return initBattle();
          }
          return prev;
        }

        return prev;
      });
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const colorA = FAMILY_COLOR[SPECIES_FAMILY[battle.speciesA]] || "#ff4466";
  const colorB = FAMILY_COLOR[SPECIES_FAMILY[battle.speciesB]] || "#00aaff";
  const nameA = SPECIES_NAME[battle.speciesA] || "???";
  const nameB = SPECIES_NAME[battle.speciesB] || "???";

  const hpPctA = battle.maxHpA > 0 ? (battle.hpA / battle.maxHpA) * 100 : 0;
  const hpPctB = battle.maxHpB > 0 ? (battle.hpB / battle.maxHpB) * 100 : 0;

  const showFlash =
    battle.phase === "fighting" && battle.hits.length > 0 && performance.now() - battle.hits[battle.hits.length - 1].time < 150;

  return (
    <div className="relative rounded-2xl bg-abyss-900/40 border border-abyss-700/20 p-6 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${colorA}08 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 50%, ${colorB}08 0%, transparent 50%)`,
        }}
      />

      {/* Flash on hit */}
      {showFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: battle.turn === "a" ? colorA : colorB,
            opacity: 0.08,
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-biolume-cyan" style={{
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
        <span className="text-[10px] text-abyss-400 uppercase tracking-[0.2em] font-medium">
          Live Battle Simulation
        </span>
      </div>

      {/* Battle arena */}
      <div className="relative flex items-center justify-between gap-4">
        {/* Creature A */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div
            className="relative"
            style={{
              opacity: battle.hpA <= 0 ? 0.3 : 1,
              transform: battle.phase === "intro" ? "translateX(-20px)" : "translateX(0)",
              transition: "transform 0.3s, opacity 0.3s",
            }}
          >
            <CreatureModel3D species={battle.speciesA} size="lg" animate={false} />
            {/* Damage numbers floating on A */}
            {battle.hits
              .filter((h) => h.side === "a")
              .map((hit) => (
                <div
                  key={hit.id}
                  className="absolute left-1/2 font-mono font-bold text-lg pointer-events-none"
                  style={{
                    color: hit.dodge ? "#888" : hit.crit ? "#ffcc00" : colorB,
                    textShadow: `0 0 10px ${hit.dodge ? "#888" : hit.crit ? "#ffcc00" : colorB}`,
                    top: -10,
                    transform: "translateX(-50%)",
                    animation: "floatUp 1s ease-out forwards",
                  }}
                >
                  {hit.dodge ? "DODGE" : hit.crit ? `CRIT -${hit.damage}` : `-${hit.damage}`}
                </div>
              ))}
          </div>

          <div className="text-center">
            <div
              className="text-sm font-bold tracking-wide"
              style={{ color: colorA }}
            >
              {nameA}
            </div>
            <div className="text-[9px] text-abyss-500 tracking-wider">
              {SPECIES_FAMILY[battle.speciesA]}
            </div>
          </div>

          {/* HP Bar A */}
          <div className="w-full max-w-[140px]">
            <div className="flex justify-between text-[8px] text-abyss-500 font-mono mb-1">
              <span>HP</span>
              <span>{battle.hpA}/{battle.maxHpA}</span>
            </div>
            <div className="h-2 rounded-full bg-abyss-800/60 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${hpPctA}%`,
                  backgroundColor: hpPctA > 50 ? "#00ff88" : hpPctA > 25 ? "#ffcc00" : "#ff4466",
                  boxShadow: `0 0 8px ${hpPctA > 50 ? "#00ff88" : hpPctA > 25 ? "#ffcc00" : "#ff4466"}44`,
                  transition: "width 0.3s, background-color 0.3s",
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-abyss-600 font-mono mt-1">
              <span>STR {battle.strA}</span>
              <span>SPD {battle.spdA}</span>
              <span>LCK {battle.lckA}</span>
            </div>
          </div>
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center gap-2 px-4">
          {battle.phase === "winner" ? (
            <div
              className="text-2xl font-black tracking-wider"
              style={{
                color: battle.winner === "a" ? colorA : colorB,
                textShadow: `0 0 20px ${battle.winner === "a" ? colorA : colorB}88`,
              }}
            >
              KO!
            </div>
          ) : (
            <>
              <div
                className="text-3xl font-black text-abyss-600"
                style={{
                  textShadow: battle.phase === "fighting"
                    ? "0 0 15px rgba(255,68,102,0.3)"
                    : "none",
                }}
              >
                VS
              </div>
              {battle.phase === "fighting" && (
                <div className="text-[8px] text-abyss-600 font-mono tracking-wider">
                  RND {battle.round}
                </div>
              )}
            </>
          )}
        </div>

        {/* Creature B */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div
            className="relative"
            style={{
              opacity: battle.hpB <= 0 ? 0.3 : 1,
              transform: battle.phase === "intro" ? "translateX(20px)" : "translateX(0)",
              transition: "transform 0.3s, opacity 0.3s",
            }}
          >
            <CreatureModel3D species={battle.speciesB} size="lg" animate={false} />
            {battle.hits
              .filter((h) => h.side === "b")
              .map((hit) => (
                <div
                  key={hit.id}
                  className="absolute left-1/2 font-mono font-bold text-lg pointer-events-none"
                  style={{
                    color: hit.dodge ? "#888" : hit.crit ? "#ffcc00" : colorA,
                    textShadow: `0 0 10px ${hit.dodge ? "#888" : hit.crit ? "#ffcc00" : colorA}`,
                    top: -10,
                    transform: "translateX(-50%)",
                    animation: "floatUp 1s ease-out forwards",
                  }}
                >
                  {hit.dodge ? "DODGE" : hit.crit ? `CRIT -${hit.damage}` : `-${hit.damage}`}
                </div>
              ))}
          </div>

          <div className="text-center">
            <div
              className="text-sm font-bold tracking-wide"
              style={{ color: colorB }}
            >
              {nameB}
            </div>
            <div className="text-[9px] text-abyss-500 tracking-wider">
              {SPECIES_FAMILY[battle.speciesB]}
            </div>
          </div>

          {/* HP Bar B */}
          <div className="w-full max-w-[140px]">
            <div className="flex justify-between text-[8px] text-abyss-500 font-mono mb-1">
              <span>HP</span>
              <span>{battle.hpB}/{battle.maxHpB}</span>
            </div>
            <div className="h-2 rounded-full bg-abyss-800/60 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${hpPctB}%`,
                  backgroundColor: hpPctB > 50 ? "#00ff88" : hpPctB > 25 ? "#ffcc00" : "#ff4466",
                  boxShadow: `0 0 8px ${hpPctB > 50 ? "#00ff88" : hpPctB > 25 ? "#ffcc00" : "#ff4466"}44`,
                  transition: "width 0.3s, background-color 0.3s",
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-abyss-600 font-mono mt-1">
              <span>STR {battle.strB}</span>
              <span>SPD {battle.spdB}</span>
              <span>LCK {battle.lckB}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Winner banner */}
      {battle.phase === "winner" && (
        <div className="mt-4 text-center">
          <div
            className="text-lg font-bold tracking-wider"
            style={{
              color: battle.winner === "a" ? colorA : colorB,
              textShadow: `0 0 20px ${battle.winner === "a" ? colorA : colorB}66`,
            }}
          >
            {battle.winner === "a" ? nameA : nameB} wins!
          </div>
          <div className="text-[9px] text-abyss-500 mt-1">
            +50 XP &middot; +10 mood &middot; 2.5% of wager burned
          </div>
        </div>
      )}
    </div>
  );
}
