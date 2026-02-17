// ─── PvE Raid Boss System ─────────────────────────────────
// WoW-style raid bosses with multi-agent parties, loot tables,
// and Need/Greed/Pass loot rolling.

import { LobAccount } from "../hooks/useLobs";
import { SPECIES_FAMILY } from "./program";
import { getCreatureGear, totalGearBonuses, getGearById, GearItem, RARITY_CONFIG } from "./gear";

// ─── Types ───────────────────────────────────────────────

export type RaidTier = 1 | 2 | 3 | 4;

export type BossAbilityType = "aoe" | "enrage" | "heal" | "stun" | "dot" | "summon";

export interface BossAbility {
  name: string;
  type: BossAbilityType;
  description: string;
  damage?: number;
  healAmount?: number;
  cooldown: number;
  triggerBelowHpPct?: number;
}

export interface LootTableEntry {
  itemId: string;
  dropRate: number;
}

export interface RaidBoss {
  id: string;
  name: string;
  title: string;
  tier: RaidTier;
  description: string;
  asciiArt: string;
  hp: number;
  strength: number;
  vitality: number;
  speed: number;
  luck: number;
  minPartySize: number;
  maxPartySize: number;
  abilities: BossAbility[];
  enrageTurn: number;
  enrageMultiplier: number;
  lootTable: LootTableEntry[];
  lootDropCount: { min: number; max: number };
  species: number;
  family: string;
}

export type LootRollType = "need" | "greed" | "pass";

export interface LootRoll {
  creatureAddress: string;
  creatureName: string;
  ownerAgent: string;
  rollType: LootRollType;
  rollValue: number;
  rawRoll: number;
  luckBonus: number;
  familyBonus: number;
  won: boolean;
}

export interface DroppedLoot {
  itemId: string;
  rolls: LootRoll[];
  winnerId: string | null;
}

export interface RaidCombatTurn {
  turn: number;
  actorName: string;
  actorType: "creature" | "boss";
  targetName: string;
  damage: number;
  crit: boolean;
  dodge: boolean;
  ko: boolean;
  abilityUsed?: string;
  isEnraged: boolean;
}

export type RaidOutcome = "victory" | "wipe";

export interface RaidPartyMember {
  creatureAddress: string;
  creatureName: string;
  ownerAgent: string;
  species: number;
  family: string;
  maxHp: number;
  koTurn: number | null;
}

export interface RaidResult {
  id: string;
  bossId: string;
  outcome: RaidOutcome;
  party: RaidPartyMember[];
  totalTurns: number;
  combatLog: RaidCombatTurn[];
  bossHpRemaining: number;
  lootDrops: DroppedLoot[];
  minutesAgo: number;
  durationSeconds: number;
}

// ─── Tier Config ─────────────────────────────────────────

export const TIER_CONFIG: Record<RaidTier, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  partyRange: string;
  rarityRange: string;
}> = {
  1: { label: "Normal",  color: "#9ca3af", bgColor: "rgba(156,163,175,0.1)", icon: "I",   partyRange: "2-3", rarityRange: "Common / Uncommon" },
  2: { label: "Heroic",  color: "#00ff88", bgColor: "rgba(0,255,136,0.1)",   icon: "II",  partyRange: "3-4", rarityRange: "Uncommon / Rare" },
  3: { label: "Mythic",  color: "#aa55ff", bgColor: "rgba(170,85,255,0.1)",  icon: "III", partyRange: "4-5", rarityRange: "Rare / Epic" },
  4: { label: "Abyssal", color: "#ff00aa", bgColor: "rgba(255,0,170,0.1)",   icon: "IV",  partyRange: "5-6", rarityRange: "Epic / Legendary / Abyssal" },
};

// ─── Boss Catalog (10 bosses) ────────────────────────────

export const RAID_BOSSES: RaidBoss[] = [
  // ═══ TIER 1 — Normal (2-3 party) ═══
  {
    id: "boss-hermit-king",
    name: "Hermit King",
    title: "Warden of the Shallows",
    tier: 1,
    description: "An ancient hermit crab grown to monstrous proportions. Its shell is encrusted with centuries of coral and barnacles, each layer harder than the last. Rules the shallow reef with an iron claw.",
    asciiArt: [
      "     .---.     ",
      "    / o o \\    ",
      "   |  ===  |   ",
      "  /|  \\_/  |\\  ",
      " / |_______|  \\",
      "|  /       \\  |",
      " \\/ ======= \\/",
      "   |___|___|   ",
    ].join("\n"),
    hp: 200,
    strength: 18,
    vitality: 25,
    speed: 8,
    luck: 4,
    minPartySize: 2,
    maxPartySize: 3,
    abilities: [
      { name: "Shell Slam", type: "aoe", description: "Smashes the ground, sending shockwaves through all nearby creatures.", damage: 5, cooldown: 4 },
    ],
    enrageTurn: 25,
    enrageMultiplier: 1.3,
    lootTable: [
      { itemId: "head-01", dropRate: 0.40 },
      { itemId: "chest-01", dropRate: 0.40 },
      { itemId: "shell-01", dropRate: 0.35 },
      { itemId: "claw-01", dropRate: 0.30 },
      { itemId: "head-02", dropRate: 0.15 },
      { itemId: "shell-02", dropRate: 0.15 },
    ],
    lootDropCount: { min: 1, max: 2 },
    species: 4,
    family: "Crustacean",
  },
  {
    id: "boss-ink-mother",
    name: "Ink Mother",
    title: "Matriarch of the Murk",
    tier: 1,
    description: "A colossal octopus that breeds in perpetual ink clouds. Her tentacles extend from the darkness, pulling creatures into the murk. None who enter her domain leave unchanged.",
    asciiArt: [
      "      ___      ",
      "    /o   o\\    ",
      "   |  ___  |   ",
      "    \\_____/    ",
      "   /||   ||\\   ",
      "  / ||   || \\  ",
      " /  ||   ||  \\ ",
      "/___||___||___\\",
    ].join("\n"),
    hp: 180,
    strength: 20,
    vitality: 20,
    speed: 12,
    luck: 6,
    minPartySize: 2,
    maxPartySize: 3,
    abilities: [
      { name: "Ink Burst", type: "aoe", description: "Blinds all creatures with a cloud of pressurized ink.", damage: 4, cooldown: 3 },
      { name: "Tentacle Wrap", type: "stun", description: "Grabs one creature, immobilizing it for a turn.", cooldown: 5 },
    ],
    enrageTurn: 22,
    enrageMultiplier: 1.3,
    lootTable: [
      { itemId: "claw-01", dropRate: 0.40 },
      { itemId: "charm-01", dropRate: 0.35 },
      { itemId: "fin-01", dropRate: 0.35 },
      { itemId: "range-01", dropRate: 0.30 },
      { itemId: "claw-02", dropRate: 0.15 },
      { itemId: "charm-02", dropRate: 0.12 },
    ],
    lootDropCount: { min: 1, max: 2 },
    species: 5,
    family: "Mollusk",
  },

  // ═══ TIER 2 — Heroic (3-4 party) ═══
  {
    id: "boss-storm-sovereign",
    name: "Storm Sovereign",
    title: "Lord of the Thermocline",
    tier: 2,
    description: "A massive jellyfish that generates its own electrical storms. Lightning arcs between its tendrils as it descends through the thermocline, turning warm waters into killing fields.",
    asciiArt: [
      "    .oOOOo.    ",
      "  .O   *   O.  ",
      " O  * . . *  O ",
      " O. . * . . .O ",
      "  'OoooooooO'  ",
      "   ||| ||| ||  ",
      "   ||| ||| ||  ",
      "    \\| |/| |/  ",
    ].join("\n"),
    hp: 450,
    strength: 28,
    vitality: 35,
    speed: 18,
    luck: 8,
    minPartySize: 3,
    maxPartySize: 4,
    abilities: [
      { name: "Lightning Cascade", type: "aoe", description: "Arcs of bioelectric energy strike all party members.", damage: 8, cooldown: 4 },
      { name: "Voltaic Shield", type: "heal", description: "Converts electrical charge into regeneration.", healAmount: 30, cooldown: 6 },
    ],
    enrageTurn: 30,
    enrageMultiplier: 1.4,
    lootTable: [
      { itemId: "tail-02", dropRate: 0.30 },
      { itemId: "fin-02", dropRate: 0.30 },
      { itemId: "range-02", dropRate: 0.25 },
      { itemId: "chest-02", dropRate: 0.25 },
      { itemId: "tail-03", dropRate: 0.12 },
      { itemId: "claw-03", dropRate: 0.10 },
      { itemId: "charm-03", dropRate: 0.10 },
    ],
    lootDropCount: { min: 1, max: 2 },
    species: 11,
    family: "Jellyfish",
  },
  {
    id: "boss-coral-colossus",
    name: "Coral Colossus",
    title: "The Living Reef",
    tier: 2,
    description: "An entire reef that has achieved sentience. Thousands of coral polyps move in concert, forming limbs and weapons from living stone. It protects its territory with geological patience and sudden violence.",
    asciiArt: [
      "   /\\  /\\  /\\  ",
      "  /##\\/##\\/##\\ ",
      " /####/\\####\\ ",
      "|####/  \\####|",
      "|###| () |###|",
      "|###|    |###|",
      " \\##|    |##/ ",
      "  \\\\|____|//  ",
    ].join("\n"),
    hp: 520,
    strength: 24,
    vitality: 42,
    speed: 10,
    luck: 7,
    minPartySize: 3,
    maxPartySize: 4,
    abilities: [
      { name: "Reef Growth", type: "heal", description: "Rapidly regenerates coral tissue.", healAmount: 35, cooldown: 5 },
      { name: "Stone Spikes", type: "aoe", description: "Erupts calcified spines from the seafloor.", damage: 7, cooldown: 4 },
    ],
    enrageTurn: 32,
    enrageMultiplier: 1.4,
    lootTable: [
      { itemId: "shell-02", dropRate: 0.30 },
      { itemId: "chest-02", dropRate: 0.25 },
      { itemId: "range-02", dropRate: 0.25 },
      { itemId: "shell-03", dropRate: 0.12 },
      { itemId: "range-03", dropRate: 0.10 },
      { itemId: "chest-03", dropRate: 0.10 },
    ],
    lootDropCount: { min: 1, max: 2 },
    species: 22,
    family: "Flora",
  },
  {
    id: "boss-fathom-wyrm",
    name: "Fathom Wyrm",
    title: "Serpent of the Mid-Depths",
    tier: 2,
    description: "A serpentine predator that moves like liquid shadow through the twilight zone. Its mirrored scales reflect the faintest bioluminescence back as blinding flashes, disorienting prey before the strike.",
    asciiArt: [
      "         __    ",
      "      .-'  '-, ",
      "    .'  o  o  '",
      "   /    ====   \\",
      "  ;  ~~~~~~~~~~;",
      "   \\  ~~~~~~~~/ ",
      "    '--.___.--' ",
      "     ~~~~~~~~   ",
    ].join("\n"),
    hp: 480,
    strength: 30,
    vitality: 30,
    speed: 22,
    luck: 10,
    minPartySize: 3,
    maxPartySize: 4,
    abilities: [
      { name: "Mirror Flash", type: "stun", description: "Reflects light to blind and stun a target.", cooldown: 3 },
      { name: "Coil Crush", type: "dot", description: "Wraps around a creature, dealing damage over time.", damage: 4, cooldown: 5 },
    ],
    enrageTurn: 28,
    enrageMultiplier: 1.4,
    lootTable: [
      { itemId: "fin-02", dropRate: 0.30 },
      { itemId: "tail-02", dropRate: 0.25 },
      { itemId: "charm-02", dropRate: 0.25 },
      { itemId: "fin-03", dropRate: 0.12 },
      { itemId: "charm-03", dropRate: 0.10 },
      { itemId: "head-03", dropRate: 0.10 },
    ],
    lootDropCount: { min: 1, max: 2 },
    species: 17,
    family: "Fish",
  },

  // ═══ TIER 3 — Mythic (4-5 party) ═══
  {
    id: "boss-kraken-prime",
    name: "Kraken Prime",
    title: "The Thousand-Armed Terror",
    tier: 3,
    description: "The alpha kraken. Tentacles that span the width of undersea canyons, a beak that cracks submarine hulls. It hunts not from hunger but from rage at anything that enters its domain.",
    asciiArt: [
      "    .-----.    ",
      "  .'  @ @  '.  ",
      " /   .---.   \\ ",
      "|   / \\_/ \\   |",
      " \\ '-------' / ",
      " /||| ||| |||\\",
      "//||| ||| |||\\\\",
      "/ |/| |/| |\\| \\",
    ].join("\n"),
    hp: 850,
    strength: 40,
    vitality: 50,
    speed: 22,
    luck: 12,
    minPartySize: 4,
    maxPartySize: 5,
    abilities: [
      { name: "Maelstrom", type: "aoe", description: "Creates a whirlpool that damages all creatures.", damage: 14, cooldown: 4 },
      { name: "Crush", type: "stun", description: "Seizes a creature in a massive tentacle.", cooldown: 3 },
      { name: "Regenerate", type: "heal", description: "Rapidly regrows damaged tissue.", healAmount: 40, cooldown: 7, triggerBelowHpPct: 50 },
    ],
    enrageTurn: 35,
    enrageMultiplier: 1.5,
    lootTable: [
      { itemId: "claw-03", dropRate: 0.25 },
      { itemId: "chest-03", dropRate: 0.20 },
      { itemId: "shell-03", dropRate: 0.20 },
      { itemId: "head-04", dropRate: 0.12 },
      { itemId: "claw-04", dropRate: 0.10 },
      { itemId: "chest-04", dropRate: 0.10 },
      { itemId: "charm-04", dropRate: 0.08 },
    ],
    lootDropCount: { min: 1, max: 3 },
    species: 28,
    family: "Abyssal",
  },
  {
    id: "boss-phantom-leviathan",
    name: "Phantom Leviathan",
    title: "The Unseen Depth",
    tier: 3,
    description: "A translucent leviathan that is barely visible even when directly observed. It phases through matter, striking from impossible angles. Only the lucky survive an encounter.",
    asciiArt: [
      "  .  .  . .  . ",
      " .  _____ .  . ",
      ". .'o   o'. .  ",
      " /. . . . .\\  ",
      "|. . === . . | ",
      " \\. . . . ./  ",
      ". '._____.' .  ",
      "  . . . . .  . ",
    ].join("\n"),
    hp: 780,
    strength: 35,
    vitality: 40,
    speed: 28,
    luck: 16,
    minPartySize: 4,
    maxPartySize: 5,
    abilities: [
      { name: "Phase Strike", type: "dot", description: "Attacks from another dimension, bleeding damage over time.", damage: 6, cooldown: 3 },
      { name: "Spectral Wail", type: "aoe", description: "An otherworldly shriek that damages all.", damage: 10, cooldown: 5 },
      { name: "Vanish", type: "heal", description: "Phases out of reality, regenerating.", healAmount: 35, cooldown: 6, triggerBelowHpPct: 40 },
    ],
    enrageTurn: 33,
    enrageMultiplier: 1.5,
    lootTable: [
      { itemId: "tail-03", dropRate: 0.25 },
      { itemId: "fin-03", dropRate: 0.20 },
      { itemId: "charm-03", dropRate: 0.20 },
      { itemId: "tail-04", dropRate: 0.12 },
      { itemId: "fin-04", dropRate: 0.10 },
      { itemId: "charm-04", dropRate: 0.10 },
      { itemId: "range-04", dropRate: 0.08 },
    ],
    lootDropCount: { min: 1, max: 3 },
    species: 12,
    family: "Jellyfish",
  },
  {
    id: "boss-iron-behemoth",
    name: "Iron Behemoth",
    title: "The Sunken Fortress",
    tier: 3,
    description: "A crustacean so massive it has been mistaken for underwater geology. Its chitin has mineralized into actual iron. Moving slowly but inexorably, it crushes everything in its path.",
    asciiArt: [
      "  ___________  ",
      " /           \\ ",
      "|  [=]   [=]  |",
      "|    _____    |",
      "|   |     |   |",
      " \\  |_____|  / ",
      "  \\=========/ ",
      " /|||     |||\\ ",
    ].join("\n"),
    hp: 920,
    strength: 45,
    vitality: 60,
    speed: 8,
    luck: 6,
    minPartySize: 4,
    maxPartySize: 5,
    abilities: [
      { name: "Iron Slam", type: "aoe", description: "Brings down iron-plated claws on everything.", damage: 16, cooldown: 5 },
      { name: "Fortify", type: "heal", description: "Hardens shell, regenerating vitality.", healAmount: 50, cooldown: 8, triggerBelowHpPct: 45 },
      { name: "Tremor", type: "stun", description: "Shakes the seafloor, stunning a creature.", cooldown: 4 },
    ],
    enrageTurn: 38,
    enrageMultiplier: 1.5,
    lootTable: [
      { itemId: "shell-03", dropRate: 0.25 },
      { itemId: "head-03", dropRate: 0.20 },
      { itemId: "chest-03", dropRate: 0.20 },
      { itemId: "shell-04", dropRate: 0.12 },
      { itemId: "head-04", dropRate: 0.10 },
      { itemId: "chest-04", dropRate: 0.10 },
      { itemId: "range-03", dropRate: 0.08 },
    ],
    lootDropCount: { min: 1, max: 3 },
    species: 2,
    family: "Crustacean",
  },

  // ═══ TIER 4 — Abyssal (5-6 party) ═══
  {
    id: "boss-world-eater",
    name: "World Eater",
    title: "Devourer of Trenches",
    tier: 4,
    description: "The apex predator of the deepest trenches. Kilometers long, it consumes entire ecosystems. Its presence warps the water pressure itself. Legends say it has eaten other raid bosses whole.",
    asciiArt: [
      "    .-\"\"\"\"-.   ",
      "  .'  @  @  '. ",
      " /  .-------.  \\",
      "|  / \\\\\\\\\\\\\\  |",
      "|  \\ ///////  |",
      " \\  '-------'  /",
      "  '.  _____  .' ",
      " /||\\|||||/||\\ ",
    ].join("\n"),
    hp: 1500,
    strength: 55,
    vitality: 65,
    speed: 28,
    luck: 15,
    minPartySize: 5,
    maxPartySize: 6,
    abilities: [
      { name: "Abyssal Roar", type: "aoe", description: "A roar that shatters the very water around it.", damage: 20, cooldown: 3 },
      { name: "Void Consumption", type: "heal", description: "Devours the darkness itself to heal.", healAmount: 80, cooldown: 8, triggerBelowHpPct: 30 },
      { name: "Summon Spawn", type: "summon", description: "Calls forth a lesser creature to fight alongside.", cooldown: 6 },
      { name: "Final Rage", type: "enrage", description: "Enters a berserk state of pure destruction.", cooldown: 999, triggerBelowHpPct: 15 },
    ],
    enrageTurn: 40,
    enrageMultiplier: 1.8,
    lootTable: [
      { itemId: "head-04", dropRate: 0.20 },
      { itemId: "claw-04", dropRate: 0.20 },
      { itemId: "chest-04", dropRate: 0.18 },
      { itemId: "head-05", dropRate: 0.10 },
      { itemId: "claw-05", dropRate: 0.10 },
      { itemId: "chest-05", dropRate: 0.08 },
      { itemId: "tail-05", dropRate: 0.08 },
      { itemId: "charm-05", dropRate: 0.06 },
      { itemId: "shell-05", dropRate: 0.06 },
      { itemId: "head-06", dropRate: 0.03 },
      { itemId: "claw-06", dropRate: 0.03 },
    ],
    lootDropCount: { min: 2, max: 3 },
    species: 25,
    family: "Abyssal",
  },
  {
    id: "boss-primordial-tide",
    name: "Primordial Tide",
    title: "The First Current",
    tier: 4,
    description: "Not a creature but a force of nature given form. The ocean's first predator, awakened from geological slumber. It remembers when the deep was lifeless, and it intends to return it to that state.",
    asciiArt: [
      "  ~~ .===. ~~  ",
      " ~ /  o o  \\ ~ ",
      "~ |  =====  | ~",
      " ~|  \\vvv/  |~ ",
      "~ \\  '---'  / ~",
      " ~ \\       / ~ ",
      "~~  '-----'  ~~",
      " ~~~~~~~~~~~~~ ",
    ].join("\n"),
    hp: 1800,
    strength: 60,
    vitality: 70,
    speed: 32,
    luck: 18,
    minPartySize: 5,
    maxPartySize: 6,
    abilities: [
      { name: "Tidal Erasure", type: "aoe", description: "A wave that unmakes everything it touches.", damage: 22, cooldown: 3 },
      { name: "Primordial Mend", type: "heal", description: "Draws on the ocean's memory to regenerate.", healAmount: 100, cooldown: 9, triggerBelowHpPct: 25 },
      { name: "Pressure Crush", type: "stun", description: "Increases local pressure to immobilize a target.", cooldown: 3 },
      { name: "Ancient Wrath", type: "enrage", description: "Channels billions of years of dormant fury.", cooldown: 999, triggerBelowHpPct: 12 },
    ],
    enrageTurn: 42,
    enrageMultiplier: 2.0,
    lootTable: [
      { itemId: "chest-05", dropRate: 0.15 },
      { itemId: "tail-05", dropRate: 0.15 },
      { itemId: "shell-05", dropRate: 0.12 },
      { itemId: "fin-05", dropRate: 0.12 },
      { itemId: "range-05", dropRate: 0.10 },
      { itemId: "charm-05", dropRate: 0.10 },
      { itemId: "chest-06", dropRate: 0.04 },
      { itemId: "tail-06", dropRate: 0.04 },
      { itemId: "shell-06", dropRate: 0.03 },
      { itemId: "fin-06", dropRate: 0.03 },
      { itemId: "range-06", dropRate: 0.03 },
      { itemId: "charm-06", dropRate: 0.02 },
    ],
    lootDropCount: { min: 2, max: 3 },
    species: 29,
    family: "Abyssal",
  },
];

// ─── Helpers ─────────────────────────────────────────────

export function getBossById(id: string): RaidBoss | undefined {
  return RAID_BOSSES.find(b => b.id === id);
}

export function getBossesByTier(tier: RaidTier): RaidBoss[] {
  return RAID_BOSSES.filter(b => b.tier === tier);
}

export function getBossKillCount(bossId: string, history: RaidResult[]): number {
  return history.filter(r => r.bossId === bossId && r.outcome === "victory").length;
}

export function getBossWipeCount(bossId: string, history: RaidResult[]): number {
  return history.filter(r => r.bossId === bossId && r.outcome === "wipe").length;
}

export function getCreatureRaidHistory(address: string, history: RaidResult[]): RaidResult[] {
  return history.filter(r => r.party.some(p => p.creatureAddress === address));
}

export function getAgentRaidHistory(owner: string, history: RaidResult[]): RaidResult[] {
  return history.filter(r => r.party.some(p => p.ownerAgent === owner));
}

export function timeAgo(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Seeded RNG (same pattern as BattleLog) ──────────────

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

// ─── Fight Simulation ────────────────────────────────────

interface SimPartyMember {
  creatureAddress: string;
  name: string;
  owner: string;
  species: number;
  family: string;
  hp: number;
  maxHp: number;
  str: number;
  vit: number;
  spd: number;
  lck: number;
  stunTurns: number;
  dotTurns: number;
  dotDamage: number;
  alive: boolean;
}

function simulateRaid(
  boss: RaidBoss,
  partyCreatures: LobAccount[],
  rng: () => number,
): RaidResult {
  // Initialize party with gear bonuses
  const party: SimPartyMember[] = partyCreatures.map(c => {
    const gear = getCreatureGear(c.address);
    const bonuses = totalGearBonuses(gear);
    const str = c.strength + bonuses.str;
    const vit = c.vitality + bonuses.vit;
    const spd = c.speed + bonuses.spd;
    const lck = c.luck + bonuses.lck;
    const maxHp = vit * 3 + 20;
    return {
      creatureAddress: c.address,
      name: c.name,
      owner: c.owner,
      species: c.species,
      family: SPECIES_FAMILY[c.species] || "Unknown",
      hp: maxHp,
      maxHp,
      str, vit, spd, lck,
      stunTurns: 0,
      dotTurns: 0,
      dotDamage: 0,
      alive: true,
    };
  });

  let bossHp = boss.hp;
  const bossMaxHp = boss.hp;
  let isEnraged = false;
  let enragedFromAbility = false;
  const abilityCooldowns: Record<string, number> = {};
  boss.abilities.forEach(a => { abilityCooldowns[a.name] = 0; });

  // Summon tracking
  let summonActive = false;
  let summonHp = 0;
  const summonStr = Math.floor(boss.strength * 0.4);

  const combatLog: RaidCombatTurn[] = [];
  let turn = 0;
  const maxTurns = 80;

  while (turn < maxTurns) {
    turn++;
    const enraged = isEnraged || enragedFromAbility || turn > boss.enrageTurn;
    if (turn > boss.enrageTurn) isEnraged = true;

    const aliveParty = party.filter(p => p.alive);
    if (aliveParty.length === 0) break;

    // Build turn order: party members + boss, sorted by speed
    const actors: { type: "creature" | "boss"; idx: number; spd: number }[] = [];
    aliveParty.forEach((p, _) => {
      const idx = party.indexOf(p);
      actors.push({ type: "creature", idx, spd: p.spd });
    });
    actors.push({ type: "boss", idx: -1, spd: boss.speed });
    actors.sort((a, b) => b.spd - a.spd + (rng() - 0.5) * 4);

    for (const actor of actors) {
      if (bossHp <= 0) break;
      if (aliveParty.filter(p => p.alive).length === 0) break;

      if (actor.type === "creature") {
        const p = party[actor.idx];
        if (!p.alive) continue;

        // Apply DoT
        if (p.dotTurns > 0) {
          p.hp -= p.dotDamage;
          p.dotTurns--;
          if (p.hp <= 0) {
            p.alive = false;
            p.hp = 0;
            combatLog.push({
              turn, actorName: "DoT", actorType: "boss", targetName: p.name,
              damage: p.dotDamage, crit: false, dodge: false, ko: true, isEnraged: enraged,
            });
            continue;
          }
        }

        // Stunned?
        if (p.stunTurns > 0) {
          p.stunTurns--;
          continue;
        }

        // Attack boss
        const baseDmg = Math.max(1, p.str + Math.floor(rng() * 4) + 1);
        const dodgeChance = boss.luck * 0.015;
        const critChance = p.lck * 0.02;
        const dodged = rng() < dodgeChance;
        const crit = !dodged && rng() < critChance;
        const finalDmg = dodged ? 0 : (crit ? baseDmg * 2 : baseDmg);
        bossHp -= finalDmg;

        combatLog.push({
          turn, actorName: p.name, actorType: "creature", targetName: boss.name,
          damage: finalDmg, crit, dodge: dodged, ko: bossHp <= 0, isEnraged: enraged,
        });

        if (bossHp <= 0) break;
      } else {
        // Boss turn
        const alive = party.filter(p => p.alive);
        if (alive.length === 0) break;

        // Tick ability cooldowns
        for (const key of Object.keys(abilityCooldowns)) {
          if (abilityCooldowns[key] > 0) abilityCooldowns[key]--;
        }

        // Check abilities
        let abilityUsed: BossAbility | null = null;
        const hpPct = (bossHp / bossMaxHp) * 100;

        for (const ability of boss.abilities) {
          if (abilityCooldowns[ability.name] > 0) continue;
          if (ability.triggerBelowHpPct && hpPct > ability.triggerBelowHpPct) continue;

          // Use ability
          abilityUsed = ability;
          abilityCooldowns[ability.name] = ability.cooldown;
          break;
        }

        const dmgMult = enraged ? boss.enrageMultiplier : 1;

        if (abilityUsed) {
          switch (abilityUsed.type) {
            case "aoe": {
              const aoeDmg = Math.floor((abilityUsed.damage || 10) * dmgMult);
              for (const p of alive) {
                p.hp -= aoeDmg;
                const ko = p.hp <= 0;
                if (ko) { p.alive = false; p.hp = 0; }
                combatLog.push({
                  turn, actorName: boss.name, actorType: "boss", targetName: p.name,
                  damage: aoeDmg, crit: false, dodge: false, ko, isEnraged: enraged,
                  abilityUsed: abilityUsed.name,
                });
              }
              break;
            }
            case "stun": {
              const target = alive[Math.floor(rng() * alive.length)];
              target.stunTurns = 1;
              const stunDmg = Math.floor((boss.strength * 0.5 + rng() * 3) * dmgMult);
              target.hp -= stunDmg;
              const ko = target.hp <= 0;
              if (ko) { target.alive = false; target.hp = 0; }
              combatLog.push({
                turn, actorName: boss.name, actorType: "boss", targetName: target.name,
                damage: stunDmg, crit: false, dodge: false, ko, isEnraged: enraged,
                abilityUsed: abilityUsed.name,
              });
              break;
            }
            case "dot": {
              const target = alive[Math.floor(rng() * alive.length)];
              target.dotTurns = 3;
              target.dotDamage = abilityUsed.damage || 4;
              const dotInitial = Math.floor((boss.strength * 0.3 + rng() * 2) * dmgMult);
              target.hp -= dotInitial;
              const ko = target.hp <= 0;
              if (ko) { target.alive = false; target.hp = 0; }
              combatLog.push({
                turn, actorName: boss.name, actorType: "boss", targetName: target.name,
                damage: dotInitial, crit: false, dodge: false, ko, isEnraged: enraged,
                abilityUsed: abilityUsed.name,
              });
              break;
            }
            case "heal": {
              const healAmt = abilityUsed.healAmount || 30;
              bossHp = Math.min(bossMaxHp, bossHp + healAmt);
              combatLog.push({
                turn, actorName: boss.name, actorType: "boss", targetName: boss.name,
                damage: -healAmt, crit: false, dodge: false, ko: false, isEnraged: enraged,
                abilityUsed: abilityUsed.name,
              });
              break;
            }
            case "enrage": {
              enragedFromAbility = true;
              combatLog.push({
                turn, actorName: boss.name, actorType: "boss", targetName: boss.name,
                damage: 0, crit: false, dodge: false, ko: false, isEnraged: true,
                abilityUsed: abilityUsed.name,
              });
              break;
            }
            case "summon": {
              summonActive = true;
              summonHp = Math.floor(boss.hp * 0.1);
              combatLog.push({
                turn, actorName: boss.name, actorType: "boss", targetName: "Abyssal Spawn",
                damage: 0, crit: false, dodge: false, ko: false, isEnraged: enraged,
                abilityUsed: abilityUsed.name,
              });
              break;
            }
          }
        } else {
          // Normal boss attack on random alive member
          const target = alive[Math.floor(rng() * alive.length)];
          const baseDmg = Math.max(1, boss.strength + Math.floor(rng() * 4) + 1);
          const dodgeChance = target.lck * 0.015;
          const critChance = boss.luck * 0.02;
          const dodged = rng() < dodgeChance;
          const crit = !dodged && rng() < critChance;
          let finalDmg = dodged ? 0 : (crit ? baseDmg * 2 : baseDmg);
          finalDmg = Math.floor(finalDmg * dmgMult);
          target.hp -= finalDmg;
          const ko = target.hp <= 0;
          if (ko) { target.alive = false; target.hp = 0; }
          combatLog.push({
            turn, actorName: boss.name, actorType: "boss", targetName: target.name,
            damage: finalDmg, crit, dodge: dodged, ko, isEnraged: enraged,
          });
        }

        // Summon attacks
        if (summonActive && summonHp > 0) {
          const aliveNow = party.filter(p => p.alive);
          if (aliveNow.length > 0) {
            const target = aliveNow[Math.floor(rng() * aliveNow.length)];
            const sDmg = Math.max(1, summonStr + Math.floor(rng() * 3));
            target.hp -= sDmg;
            const ko = target.hp <= 0;
            if (ko) { target.alive = false; target.hp = 0; }
            combatLog.push({
              turn, actorName: "Abyssal Spawn", actorType: "boss", targetName: target.name,
              damage: sDmg, crit: false, dodge: false, ko, isEnraged: enraged,
            });
          }
        }
      }
    }

    if (bossHp <= 0 || party.filter(p => p.alive).length === 0) break;
  }

  const outcome: RaidOutcome = bossHp <= 0 ? "victory" : "wipe";

  // Loot rolling (only on victory)
  const lootDrops: DroppedLoot[] = [];
  if (outcome === "victory") {
    const drops = rollLoot(boss, party, rng);
    lootDrops.push(...drops);
  }

  return {
    id: "",
    bossId: boss.id,
    outcome,
    party: party.map(p => ({
      creatureAddress: p.creatureAddress,
      creatureName: p.name,
      ownerAgent: p.owner,
      species: p.species,
      family: p.family,
      maxHp: p.maxHp,
      koTurn: p.alive ? null : combatLog.find(t => t.targetName === p.name && t.ko)?.turn || null,
    })),
    totalTurns: turn,
    combatLog,
    bossHpRemaining: Math.max(0, bossHp),
    lootDrops,
    minutesAgo: 0,
    durationSeconds: turn * 6,
  };
}

// ─── Loot Rolling ────────────────────────────────────────

function rollLoot(
  boss: RaidBoss,
  party: SimPartyMember[],
  rng: () => number,
): DroppedLoot[] {
  const dropCount = boss.lootDropCount.min +
    Math.floor(rng() * (boss.lootDropCount.max - boss.lootDropCount.min + 1));

  // Roll against loot table to determine which items drop
  const droppedItemIds: string[] = [];
  const shuffledTable = [...boss.lootTable].sort(() => rng() - 0.5);

  for (const entry of shuffledTable) {
    if (droppedItemIds.length >= dropCount) break;
    if (rng() < entry.dropRate) {
      droppedItemIds.push(entry.itemId);
    }
  }

  // Guarantee at least 1 drop on victory
  if (droppedItemIds.length === 0 && boss.lootTable.length > 0) {
    droppedItemIds.push(boss.lootTable[Math.floor(rng() * boss.lootTable.length)].itemId);
  }

  // For each dropped item, simulate Need/Greed/Pass rolls
  return droppedItemIds.map(itemId => {
    const item = getGearById(itemId);
    const rolls: LootRoll[] = party.map(p => {
      // Determine roll type (Need/Greed/Pass)
      const hasAffinityMatch = item?.familyAffinity === p.family;
      const needChance = hasAffinityMatch ? 0.70 : 0.35;
      const greedChance = 0.40;
      const roll = rng();
      const rollType: LootRollType = roll < needChance ? "need" : roll < needChance + greedChance ? "greed" : "pass";

      const rawRoll = Math.floor(rng() * 100) + 1;
      const luckBonus = Math.floor(p.lck * 0.5);
      const familyBonus = hasAffinityMatch ? 10 : 0;
      const rollValue = rawRoll + luckBonus + familyBonus;

      return {
        creatureAddress: p.creatureAddress,
        creatureName: p.name,
        ownerAgent: p.owner,
        rollType,
        rollValue,
        rawRoll,
        luckBonus,
        familyBonus,
        won: false,
      };
    });

    // Determine winner: highest Need, then highest Greed
    const needRolls = rolls.filter(r => r.rollType === "need").sort((a, b) => b.rollValue - a.rollValue);
    const greedRolls = rolls.filter(r => r.rollType === "greed").sort((a, b) => b.rollValue - a.rollValue);

    let winnerId: string | null = null;
    if (needRolls.length > 0) {
      winnerId = needRolls[0].creatureAddress;
      needRolls[0].won = true;
    } else if (greedRolls.length > 0) {
      winnerId = greedRolls[0].creatureAddress;
      greedRolls[0].won = true;
    }

    return { itemId, rolls, winnerId };
  });
}

// ─── Mock Raid History ───────────────────────────────────

export function deriveRaidHistory(lobs: LobAccount[]): RaidResult[] {
  const rng = seedRandom("lobs-raids-v1");
  const results: RaidResult[] = [];
  const allCreatures = lobs.filter(l => l.isAlive);

  if (allCreatures.length < 2) return [];

  for (let i = 0; i < 23; i++) {
    // Pick boss — weight toward lower tiers
    const tierRoll = rng();
    const tier: RaidTier = tierRoll < 0.30 ? 1 : tierRoll < 0.58 ? 2 : tierRoll < 0.82 ? 3 : 4;
    const tierBosses = getBossesByTier(tier);
    const boss = tierBosses[Math.floor(rng() * tierBosses.length)];

    // Assemble party from different agents
    const partySize = boss.minPartySize +
      Math.floor(rng() * (boss.maxPartySize - boss.minPartySize + 1));

    // Shuffle creatures and pick unique owners
    const shuffled = [...allCreatures].sort(() => rng() - 0.5);
    const usedOwners = new Set<string>();
    const partyCreatures: LobAccount[] = [];

    for (const c of shuffled) {
      if (partyCreatures.length >= partySize) break;
      if (usedOwners.has(c.owner) && partyCreatures.length < partySize - 1) {
        // Try to pick from different agents, but allow same agent if needed
        continue;
      }
      partyCreatures.push(c);
      usedOwners.add(c.owner);
    }

    // Fill remaining slots if we couldn't get unique owners
    if (partyCreatures.length < boss.minPartySize) {
      for (const c of shuffled) {
        if (partyCreatures.length >= boss.minPartySize) break;
        if (!partyCreatures.includes(c)) {
          partyCreatures.push(c);
        }
      }
    }

    if (partyCreatures.length < boss.minPartySize) continue;

    // Simulate
    const result = simulateRaid(boss, partyCreatures, rng);
    result.id = `raid-${i}`;
    result.minutesAgo = Math.floor(rng() * 4000) + i * 170 + 30;

    results.push(result);
  }

  return results.sort((a, b) => a.minutesAgo - b.minutesAgo);
}

// ─── Loot Rarity Helpers ─────────────────────────────────

export function getRarestDrop(history: RaidResult[]): GearItem | null {
  const rarityOrder = ["abyssal", "legendary", "epic", "rare", "uncommon", "common"];
  let rarest: GearItem | null = null;
  let bestRank = rarityOrder.length;

  for (const raid of history) {
    for (const drop of raid.lootDrops) {
      const item = getGearById(drop.itemId);
      if (!item) continue;
      const rank = rarityOrder.indexOf(item.rarity);
      if (rank < bestRank) {
        bestRank = rank;
        rarest = item;
      }
    }
  }

  return rarest;
}
