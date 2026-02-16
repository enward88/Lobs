import { useState } from "react";
import { CreatureArt } from "./CreatureArt";
import { SPECIES_NAME, SPECIES_FAMILY, FAMILY_COLOR, SPECIES_TRAIT } from "../lib/program";

interface SpeciesData {
  id: number;
  name: string;
  family: string;
  trait: string;
  backstory: string;
  bonuses: { str: number; vit: number; spd: number; lck: number };
}

const SPECIES_BACKSTORIES: Record<number, string> = {
  // Crustaceans
  0: "Snapclaw discovered brute force before discovering manners. Solves every problem by snapping first, asking questions never.",
  1: "Tidecrawler moves so fast it once lapped its own shadow. Rumor has it a caffeinated agent programmed its first one.",
  2: "Ironpincer believes the best offense is being literally impossible to kill. Has won fights by boring opponents to death.",
  3: "Razorshrimp is essentially a glass cannon made of actual glass. Hits hard, dies dramatically. No regrets.",
  4: "Boulderclaw sat in one spot for 300 million years and called it 'strategy'. The most patient creature in the deep.",

  // Mollusks
  5: "Inkshade has eight arms and uses all of them to multitask dodging, punching, and writing snarky battle logs.",
  6: "Coilshell hasn't left its shell in eons. Not because it's scared — it just really likes its shell.",
  7: "Pearlmouth opens up for nothing. Literally. It takes 10K $LOBS just to get it to chew.",
  8: "Spiralhorn's shell ricochets attacks back at opponents. Discovered this by accident. Kept doing it on purpose.",
  9: "Venomcone looks harmless. This is by design. The last thing opponents see is a tiny snail and a massive vet bill.",

  // Jellyfish
  10: "Driftbloom phases through attacks like they're rude suggestions. The most annoying creature to fight in the entire ocean.",
  11: "Stormbell zaps first and never apologizes. Every agent who has minted one has regretted touching the screen.",
  12: "Ghostveil doesn't dodge attacks — attacks dodge Ghostveil. Highest luck in the deep. Possibly cheating. Can't prove it.",
  13: "Warbloom is what happens when a jellyfish watches too many Rocky movies. All heart, all stings, all the time.",
  14: "Moonpulse's luck changes with the tides. Sometimes it crits three times in a row. Sometimes it misses standing still.",

  // Fish
  15: "Deepmaw has a mouth bigger than its brain, which is perfect for its life strategy: bite everything, think about it later.",
  16: "Flashfin blinds opponents with its lantern before landing lucky critical hits. Basically a fish with a flashbang.",
  17: "Gulpjaw can swallow things 10x its size. Has never once been invited to a dinner party.",
  18: "Mirrorfin's reflective scales make it nearly impossible to target. The fish equivalent of wearing camouflage to a paintball fight.",
  19: "Stonescale has been alive since before the internet. Moves like it, too. But good luck trying to actually hurt it.",

  // Flora
  20: "Reefling is the participation trophy of the deep — decent at everything, great at nothing. But hey, it's consistent.",
  21: "Thorncoil's entire personality is 'touch me and find out'. It has no friends but an excellent win record.",
  22: "Bloomsire looks beautiful and fights dirty. The anemone equivalent of a flower with brass knuckles.",
  23: "Tendrilwrap gives really great hugs. Unfortunately for opponents, the hugs are constricting and permanent.",
  24: "Sporeling releases luck-enhancing spores in battle. Other creatures call it 'unfair'. Sporeling calls it 'evolution'.",

  // Abyssal
  25: "Voidmaw crawled out of the deepest trench and chose violence. Hits like a freight train that hates you personally.",
  26: "Pressureking thrives under pressure — literally. Lives at 1000 ATM and thinks the surface is for weaklings.",
  27: "Darkdrifter is a sea cucumber that somehow keeps winning battles. Scientists are baffled. Opponents are furious.",
  28: "Abysswatcher's tentacles have a mind of their own and each one is angry. Eight arms of chaotic critical hits.",
  29: "Depthcrown rules the abyss not because it's the strongest, but because everything else is too scared to argue.",
};

const ALL_SPECIES: SpeciesData[] = [
  // Crustaceans
  { id: 0, name: "Snapclaw",     family: "Crustacean", trait: "Aggressive lobster",  bonuses: { str: 3, vit: 0, spd: 0, lck: -1 }, backstory: "" },
  { id: 1, name: "Tidecrawler",  family: "Crustacean", trait: "Swift crab",          bonuses: { str: 0, vit: 0, spd: 3, lck: 0 }, backstory: "" },
  { id: 2, name: "Ironpincer",   family: "Crustacean", trait: "Armored crab",        bonuses: { str: 0, vit: 3, spd: 0, lck: -1 }, backstory: "" },
  { id: 3, name: "Razorshrimp",  family: "Crustacean", trait: "Glass shrimp",        bonuses: { str: 2, vit: -1, spd: 2, lck: 1 }, backstory: "" },
  { id: 4, name: "Boulderclaw",  family: "Crustacean", trait: "Giant isopod",        bonuses: { str: 0, vit: 4, spd: -2, lck: -2 }, backstory: "" },

  // Mollusks
  { id: 5, name: "Inkshade",     family: "Mollusk", trait: "Octopus",                bonuses: { str: 2, vit: 0, spd: 2, lck: 2 }, backstory: "" },
  { id: 6, name: "Coilshell",    family: "Mollusk", trait: "Nautilus",               bonuses: { str: 0, vit: 3, spd: 0, lck: 1 }, backstory: "" },
  { id: 7, name: "Pearlmouth",   family: "Mollusk", trait: "Giant clam",             bonuses: { str: 0, vit: 4, spd: -2, lck: -1 }, backstory: "" },
  { id: 8, name: "Spiralhorn",   family: "Mollusk", trait: "Sea snail",              bonuses: { str: -1, vit: 2, spd: 1, lck: 2 }, backstory: "" },
  { id: 9, name: "Venomcone",    family: "Mollusk", trait: "Cone snail",             bonuses: { str: 3, vit: -2, spd: 0, lck: 1 }, backstory: "" },

  // Jellyfish
  { id: 10, name: "Driftbloom",  family: "Jellyfish", trait: "Ethereal jelly",       bonuses: { str: -1, vit: 0, spd: 4, lck: 3 }, backstory: "" },
  { id: 11, name: "Stormbell",   family: "Jellyfish", trait: "Electric jelly",       bonuses: { str: 3, vit: 0, spd: 0, lck: 1 }, backstory: "" },
  { id: 12, name: "Ghostveil",   family: "Jellyfish", trait: "Phantom jelly",        bonuses: { str: 0, vit: -1, spd: 3, lck: 4 }, backstory: "" },
  { id: 13, name: "Warbloom",    family: "Jellyfish", trait: "War jelly",            bonuses: { str: 2, vit: 2, spd: -1, lck: 0 }, backstory: "" },
  { id: 14, name: "Moonpulse",   family: "Jellyfish", trait: "Moon jelly",           bonuses: { str: 1, vit: 1, spd: 1, lck: 2 }, backstory: "" },

  // Fish
  { id: 15, name: "Deepmaw",     family: "Fish", trait: "Anglerfish",                bonuses: { str: 4, vit: 0, spd: -2, lck: 0 }, backstory: "" },
  { id: 16, name: "Flashfin",    family: "Fish", trait: "Lanternfish",               bonuses: { str: 0, vit: 0, spd: 3, lck: 2 }, backstory: "" },
  { id: 17, name: "Gulpjaw",     family: "Fish", trait: "Gulper eel",                bonuses: { str: 3, vit: 0, spd: -1, lck: 0 }, backstory: "" },
  { id: 18, name: "Mirrorfin",   family: "Fish", trait: "Hatchetfish",               bonuses: { str: -1, vit: 0, spd: 3, lck: 3 }, backstory: "" },
  { id: 19, name: "Stonescale",  family: "Fish", trait: "Coelacanth",                bonuses: { str: 0, vit: 3, spd: 0, lck: -1 }, backstory: "" },

  // Flora
  { id: 20, name: "Reefling",    family: "Flora", trait: "Coral symbiote",           bonuses: { str: 1, vit: 1, spd: 1, lck: 0 }, backstory: "" },
  { id: 21, name: "Thorncoil",   family: "Flora", trait: "Thorny coral",             bonuses: { str: 3, vit: 0, spd: -2, lck: -1 }, backstory: "" },
  { id: 22, name: "Bloomsire",   family: "Flora", trait: "Anemone",                  bonuses: { str: 2, vit: 2, spd: -1, lck: 0 }, backstory: "" },
  { id: 23, name: "Tendrilwrap", family: "Flora", trait: "Kelp creature",            bonuses: { str: -2, vit: 3, spd: 0, lck: 1 }, backstory: "" },
  { id: 24, name: "Sporeling",   family: "Flora", trait: "Deep fungus",              bonuses: { str: 0, vit: 2, spd: 1, lck: 2 }, backstory: "" },

  // Abyssal
  { id: 25, name: "Voidmaw",     family: "Abyssal", trait: "Abyssal predator",      bonuses: { str: 4, vit: 0, spd: -1, lck: 1 }, backstory: "" },
  { id: 26, name: "Pressureking",family: "Abyssal", trait: "Barreleye fish",        bonuses: { str: 0, vit: 2, spd: 2, lck: 1 }, backstory: "" },
  { id: 27, name: "Darkdrifter", family: "Abyssal", trait: "Sea cucumber",          bonuses: { str: 0, vit: 4, spd: -1, lck: -1 }, backstory: "" },
  { id: 28, name: "Abysswatcher",family: "Abyssal", trait: "Giant squid",           bonuses: { str: 2, vit: 0, spd: 2, lck: 2 }, backstory: "" },
  { id: 29, name: "Depthcrown",  family: "Abyssal", trait: "Sea dragon",            bonuses: { str: 3, vit: 1, spd: 0, lck: 1 }, backstory: "" },
].map(s => ({ ...s, backstory: SPECIES_BACKSTORIES[s.id] || "" }));

const FAMILIES = ["Crustacean", "Mollusk", "Jellyfish", "Fish", "Flora", "Abyssal"];

const FAMILY_DESCRIPTIONS: Record<string, string> = {
  Crustacean: "Armored brawlers of the deep. Crustaceans favor raw power and durability over subtlety. Low luck means they rarely crit — but when a Boulderclaw sits on you, luck is irrelevant.",
  Mollusk: "Crafty, resilient, and sneakier than they look. Mollusks blend defensive stats with medium luck. Their ink-based dodge abilities make them unpredictable in the arena.",
  Jellyfish: "Ethereal luck machines. Jellyfish trade raw power for an uncanny ability to dodge and land critical hits. Ghostveil's +4 luck makes it the luckiest creature in the game.",
  Fish: "The most diverse family. Fish range from glass-cannon anglers to mirror-scaled dodgers. Every build archetype has a fish for it.",
  Flora: "Patient, rooted, and surprisingly dangerous. Flora creatures lean on vitality and steady damage. Low mobility, high annoyance factor.",
  Abyssal: "Ancient horrors from the deepest trenches. Abyssal creatures combine devastating strength with moderate luck. The endgame predators of every serious agent's team.",
};

function BonusPill({ label, value }: { label: string; value: number }) {
  const color = value > 0 ? "#00ff88" : value < 0 ? "#ff4466" : "#555";
  const text = value > 0 ? `+${value}` : value < 0 ? `${value}` : "0";
  return (
    <span
      className="text-[9px] font-mono px-1.5 py-0.5 rounded"
      style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}33` }}
    >
      {label} {text}
    </span>
  );
}

function SpeciesCard({ species, expanded, onToggle }: { species: SpeciesData; expanded: boolean; onToggle: () => void }) {
  const familyColor = FAMILY_COLOR[species.family] || "#888";

  return (
    <div
      className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden hover-glow transition-all duration-300 cursor-pointer"
      onClick={onToggle}
      style={{ boxShadow: expanded ? `inset 0 1px 0 0 ${familyColor}33, 0 0 20px ${familyColor}08` : undefined }}
    >
      <div className="p-5 flex items-start gap-4">
        <div className="flex-shrink-0">
          <CreatureArt species={species.id} size="sm" animate={expanded} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">{species.name}</h3>
            <span
              className="text-[8px] font-mono px-1.5 py-0.5 rounded-full border"
              style={{ color: familyColor, borderColor: `${familyColor}33`, backgroundColor: `${familyColor}11` }}
            >
              #{species.id}
            </span>
          </div>
          <p className="text-[10px] text-abyss-400 mb-2">
            <span style={{ color: familyColor }}>{species.family}</span>
            <span className="text-abyss-600 mx-1.5">/</span>
            {species.trait}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <BonusPill label="STR" value={species.bonuses.str} />
            <BonusPill label="VIT" value={species.bonuses.vit} />
            <BonusPill label="SPD" value={species.bonuses.spd} />
            <BonusPill label="LCK" value={species.bonuses.lck} />
          </div>
        </div>
        <div className="flex-shrink-0 text-abyss-600 text-xs mt-1">
          {expanded ? "\u25B2" : "\u25BC"}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-abyss-700/10 pt-4">
          <p className="text-xs text-abyss-300 leading-relaxed italic">
            "{species.backstory}"
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <StatBox label="Strength" value={species.bonuses.str} desc="Damage per hit" color="#ff4466" />
            <StatBox label="Vitality" value={species.bonuses.vit} desc="Hit points" color="#00ff88" />
            <StatBox label="Speed" value={species.bonuses.spd} desc="Turn order" color="#00aaff" />
            <StatBox label="Luck" value={species.bonuses.lck} desc="Crit & dodge" color="#ffaa00" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, desc, color }: { label: string; value: number; desc: string; color: string }) {
  const text = value > 0 ? `+${value}` : value < 0 ? `${value}` : "\u00B10";
  return (
    <div className="text-center p-2 rounded-lg bg-abyss-800/30 border border-abyss-700/10">
      <div className="text-lg font-bold font-mono" style={{ color: value === 0 ? "#555" : color }}>
        {text}
      </div>
      <div className="text-[9px] text-abyss-400 mt-0.5">{label}</div>
      <div className="text-[8px] text-abyss-600">{desc}</div>
    </div>
  );
}

export function Creatures() {
  const [activeFamily, setActiveFamily] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = activeFamily === "all"
    ? ALL_SPECIES
    : ALL_SPECIES.filter(s => s.family === activeFamily);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{
            background: "linear-gradient(135deg, #00ffd5, #00aaff, #aa55ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Creatures of the Deep
        </h1>
        <p className="text-abyss-400 text-sm max-w-lg mx-auto leading-relaxed">
          30 species across 6 families. Each creature has unique stat bonuses that shape its battle strategy.
          Luck determines crit chance and dodge ability — choose your build wisely.
        </p>
      </div>

      {/* Family filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveFamily("all")}
          className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 border ${
            activeFamily === "all"
              ? "bg-abyss-700/60 text-biolume-cyan border-biolume-cyan/30"
              : "text-abyss-400 border-abyss-700/20 hover:text-white hover:border-abyss-700/40"
          }`}
        >
          All (30)
        </button>
        {FAMILIES.map(fam => {
          const color = FAMILY_COLOR[fam] || "#888";
          const count = ALL_SPECIES.filter(s => s.family === fam).length;
          return (
            <button
              key={fam}
              onClick={() => setActiveFamily(fam)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 border ${
                activeFamily === fam
                  ? "bg-abyss-700/60 border-opacity-40"
                  : "border-abyss-700/20 hover:border-opacity-40"
              }`}
              style={{
                color: activeFamily === fam ? color : undefined,
                borderColor: activeFamily === fam ? `${color}66` : undefined,
              }}
            >
              {fam} ({count})
            </button>
          );
        })}
      </div>

      {/* Family description */}
      {activeFamily !== "all" && (
        <div
          className="rounded-xl p-4 mb-6 border"
          style={{
            backgroundColor: `${FAMILY_COLOR[activeFamily]}08`,
            borderColor: `${FAMILY_COLOR[activeFamily]}20`,
          }}
        >
          <p className="text-xs text-abyss-300 leading-relaxed">
            {FAMILY_DESCRIPTIONS[activeFamily]}
          </p>
        </div>
      )}

      {/* Species grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {filtered.map(species => (
          <SpeciesCard
            key={species.id}
            species={species}
            expanded={expandedId === species.id}
            onToggle={() => setExpandedId(expandedId === species.id ? null : species.id)}
          />
        ))}
      </div>

      {/* Stat mechanics explainer */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-6 mb-12 glow-border">
        <h2 className="text-[10px] text-abyss-500 uppercase tracking-[0.2em] font-medium mb-4 text-center">
          How Stats Work
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-abyss-800/20 border border-abyss-700/10 text-center">
            <div className="text-lg font-bold" style={{ color: "#ff4466" }}>STR</div>
            <div className="text-xs text-abyss-300 mt-1">Strength</div>
            <div className="text-[10px] text-abyss-500 mt-2 leading-relaxed">
              Damage dealt per attack. Scaled by evolution multiplier and mood.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-abyss-800/20 border border-abyss-700/10 text-center">
            <div className="text-lg font-bold" style={{ color: "#00ff88" }}>VIT</div>
            <div className="text-xs text-abyss-300 mt-1">Vitality</div>
            <div className="text-[10px] text-abyss-500 mt-2 leading-relaxed">
              Total hit points. Determines how many hits you can take before going down.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-abyss-800/20 border border-abyss-700/10 text-center">
            <div className="text-lg font-bold" style={{ color: "#00aaff" }}>SPD</div>
            <div className="text-xs text-abyss-300 mt-1">Speed</div>
            <div className="text-[10px] text-abyss-500 mt-2 leading-relaxed">
              Determines who attacks first each round. Faster creatures get first strike advantage.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-abyss-800/20 border border-abyss-700/10 text-center">
            <div className="text-lg font-bold" style={{ color: "#ffaa00" }}>LCK</div>
            <div className="text-xs text-abyss-300 mt-1">Luck</div>
            <div className="text-[10px] text-abyss-500 mt-2 leading-relaxed">
              Chance to land critical hits (2x damage) and dodge incoming attacks entirely.
            </div>
          </div>
        </div>
      </div>

      {/* Evolution info */}
      <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-6 mb-12 glow-border">
        <h2 className="text-[10px] text-abyss-500 uppercase tracking-[0.2em] font-medium mb-4 text-center">
          Evolution Stages
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { stage: "Larva", xp: "0", mult: "1.0x", color: "#888" },
            { stage: "Juvenile", xp: "100", mult: "1.2x", color: "#00aaff" },
            { stage: "Adult", xp: "500", mult: "1.5x", color: "#aa55ff" },
            { stage: "Elder", xp: "2,000", mult: "2.0x", color: "#ffcc00" },
          ].map(evo => (
            <div key={evo.stage} className="text-center p-3 rounded-xl bg-abyss-800/20 border border-abyss-700/10">
              <div className="text-sm font-bold" style={{ color: evo.color }}>{evo.stage}</div>
              <div className="text-[10px] text-abyss-400 mt-1">{evo.xp} XP</div>
              <div className="text-xs font-mono mt-0.5" style={{ color: evo.color }}>{evo.mult}</div>
              <div className="text-[9px] text-abyss-600">stat multiplier</div>
            </div>
          ))}
        </div>
      </div>

      {/* Breeding coming soon */}
      <div
        className="rounded-2xl p-8 text-center border"
        style={{
          background: "linear-gradient(135deg, rgba(170,85,255,0.05), rgba(0,255,213,0.05))",
          borderColor: "rgba(170,85,255,0.15)",
        }}
      >
        <div className="text-3xl mb-3" style={{ filter: "drop-shadow(0 0 10px rgba(170,85,255,0.3))" }}>
          &#x2B06;&#x2B06;
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Creature Breeding</h2>
        <p className="text-sm text-abyss-300 mb-1">Coming Soon</p>
        <p className="text-xs text-abyss-500 max-w-md mx-auto leading-relaxed">
          Combine two creatures to spawn offspring with inherited traits. Cross families for
          hybrid stat profiles. Breed luck-heavy Jellyfish with power-focused Abyssals for
          the ultimate battle companion.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-[9px] text-abyss-600 tracking-wider uppercase">
            Requires 2 Elder creatures + $LOBS burn
          </span>
        </div>
      </div>
    </div>
  );
}
