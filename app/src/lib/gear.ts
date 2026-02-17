// ─── Gear System ──────────────────────────────────────────
// WoW Armory-style equipment for Lobs creatures.
// 8 gear slots, 6 rarity tiers, 40+ items.

// ─── Types ────────────────────────────────────────────────

export type GearSlot = "head" | "chest" | "claw" | "tail" | "ranged" | "charm" | "shell" | "fin";

export type GearRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "abyssal";

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: GearRarity;
  statBonuses: { str?: number; vit?: number; spd?: number; lck?: number };
  description: string;
  icon: string;
  familyAffinity?: string; // extra +2 all stats if creature matches this family
}

export type CreatureGear = Partial<Record<GearSlot, GearItem>>;

// ─── Constants ────────────────────────────────────────────

export const GEAR_SLOTS: { slot: GearSlot; label: string; side: "left" | "right"; icon: string }[] = [
  { slot: "head",    label: "Head",    side: "left",  icon: "\u2655" }, // ♕
  { slot: "chest",   label: "Chest",   side: "left",  icon: "\u2616" }, // ☖
  { slot: "claw",    label: "Claw",    side: "left",  icon: "\u2694" }, // ⚔
  { slot: "tail",    label: "Tail",    side: "left",  icon: "\u27B0" }, // ➰
  { slot: "ranged",  label: "Ranged",  side: "right", icon: "\u2726" }, // ✦
  { slot: "charm",   label: "Charm",   side: "right", icon: "\u2666" }, // ♦
  { slot: "shell",   label: "Shell",   side: "right", icon: "\u2B21" }, // ⬡
  { slot: "fin",     label: "Fin",     side: "right", icon: "\u2756" }, // ❖
];

export const RARITY_CONFIG: Record<GearRarity, { color: string; label: string; glow: string; bgAlpha: string }> = {
  common:    { color: "#9ca3af", label: "Common",    glow: "none",                              bgAlpha: "15" },
  uncommon:  { color: "#00ff88", label: "Uncommon",  glow: "0 0 8px rgba(0,255,136,0.3)",       bgAlpha: "18" },
  rare:      { color: "#00aaff", label: "Rare",      glow: "0 0 10px rgba(0,170,255,0.4)",      bgAlpha: "20" },
  epic:      { color: "#aa55ff", label: "Epic",      glow: "0 0 12px rgba(170,85,255,0.5)",     bgAlpha: "22" },
  legendary: { color: "#ffcc00", label: "Legendary", glow: "0 0 15px rgba(255,204,0,0.5)",      bgAlpha: "25" },
  abyssal:   { color: "#ff00aa", label: "Abyssal",   glow: "0 0 18px rgba(255,0,170,0.6)",      bgAlpha: "28" },
};

// ─── Gear Catalog (48 items) ──────────────────────────────

export const GEAR_CATALOG: GearItem[] = [
  // === HEAD (6) ===
  { id: "head-01", name: "Barnacle Cap",       slot: "head", rarity: "common",    statBonuses: { vit: 1 },            icon: "\u2655", description: "A crusty barnacle shell. Better than nothing." },
  { id: "head-02", name: "Coral Crown",        slot: "head", rarity: "uncommon",  statBonuses: { vit: 3 },            icon: "\u2655", description: "Woven from living reef coral. Hardens with age." },
  { id: "head-03", name: "Pressure Helm",      slot: "head", rarity: "rare",      statBonuses: { vit: 4, str: 2 },    icon: "\u2655", description: "Forged in the crushing depths. Withstands anything." },
  { id: "head-04", name: "Ghostlight Circlet",  slot: "head", rarity: "epic",      statBonuses: { vit: 5, lck: 3 },    icon: "\u2655", description: "Bioluminescent crown that confuses attackers.", familyAffinity: "Jellyfish" },
  { id: "head-05", name: "Abyssal Crown",      slot: "head", rarity: "legendary", statBonuses: { vit: 8, str: 4 },    icon: "\u2655", description: "Torn from a leviathan's skull. Radiates dread.", familyAffinity: "Abyssal" },
  { id: "head-06", name: "Void Diadem",        slot: "head", rarity: "abyssal",   statBonuses: { vit: 10, str: 5, lck: 3 }, icon: "\u2655", description: "Woven from the fabric of the deepest trench. Whispers secrets." },

  // === CHEST (6) ===
  { id: "chest-01", name: "Kelp Wrap",          slot: "chest", rarity: "common",    statBonuses: { vit: 1, str: 1 },    icon: "\u2616", description: "Dried kelp strapped around the body. Barely armor." },
  { id: "chest-02", name: "Scale Mail",         slot: "chest", rarity: "uncommon",  statBonuses: { vit: 2, str: 2 },    icon: "\u2616", description: "Overlapping fish scales. Flexible and tough." },
  { id: "chest-03", name: "Ironshell Plate",    slot: "chest", rarity: "rare",      statBonuses: { vit: 4, str: 3 },    icon: "\u2616", description: "Crustacean chitin reinforced with iron deposits.", familyAffinity: "Crustacean" },
  { id: "chest-04", name: "Inkweave Armor",     slot: "chest", rarity: "epic",      statBonuses: { vit: 5, str: 3, spd: 2 }, icon: "\u2616", description: "Mollusk-silk armor that shifts and shimmers.", familyAffinity: "Mollusk" },
  { id: "chest-05", name: "Trenchplate",        slot: "chest", rarity: "legendary", statBonuses: { vit: 9, str: 5 },    icon: "\u2616", description: "Armor forged in hydrothermal vents. Nearly indestructible." },
  { id: "chest-06", name: "Living Carapace",    slot: "chest", rarity: "abyssal",   statBonuses: { vit: 12, str: 6, spd: 2 }, icon: "\u2616", description: "Grows with the creature. Repairs itself between battles." },

  // === CLAW (6) ===
  { id: "claw-01", name: "Sharpened Shell",     slot: "claw", rarity: "common",    statBonuses: { str: 2 },            icon: "\u2694", description: "A broken shell honed to an edge. Simple but effective." },
  { id: "claw-02", name: "Coral Blade",         slot: "claw", rarity: "uncommon",  statBonuses: { str: 3 },            icon: "\u2694", description: "Razor-sharp coral fragment. Cuts through anything soft." },
  { id: "claw-03", name: "Venom Fang",          slot: "claw", rarity: "rare",      statBonuses: { str: 5, lck: 1 },    icon: "\u2694", description: "Cone snail tooth. Delivers neurotoxin on hit.", familyAffinity: "Mollusk" },
  { id: "claw-04", name: "Stormclaw",           slot: "claw", rarity: "epic",      statBonuses: { str: 6, spd: 2 },    icon: "\u2694", description: "Crackling with bioelectric energy. Paralyzes on crit.", familyAffinity: "Jellyfish" },
  { id: "claw-05", name: "Void Talon",          slot: "claw", rarity: "legendary", statBonuses: { str: 10, lck: 2 },   icon: "\u2694", description: "Ripped from a creature that no longer exists. Terrifying." },
  { id: "claw-06", name: "Leviathan's Grip",    slot: "claw", rarity: "abyssal",   statBonuses: { str: 14, lck: 3 },   icon: "\u2694", description: "The last thing most creatures see. Crushes hope and carapaces alike." },

  // === TAIL (6) ===
  { id: "tail-01", name: "Drift Fin",           slot: "tail", rarity: "common",    statBonuses: { spd: 2 },            icon: "\u27B0", description: "Flexible membrane that catches currents." },
  { id: "tail-02", name: "Current Rider",       slot: "tail", rarity: "uncommon",  statBonuses: { spd: 3 },            icon: "\u27B0", description: "Hydrodynamic tail extension. Cuts through water." },
  { id: "tail-03", name: "Jet Propulsor",       slot: "tail", rarity: "rare",      statBonuses: { spd: 5, str: 1 },    icon: "\u27B0", description: "Biological jet engine. Explosive acceleration." },
  { id: "tail-04", name: "Phase Tail",          slot: "tail", rarity: "epic",      statBonuses: { spd: 6, lck: 3 },    icon: "\u27B0", description: "Phases through water molecules. Impossibly fast.", familyAffinity: "Jellyfish" },
  { id: "tail-05", name: "Abyssal Thruster",    slot: "tail", rarity: "legendary", statBonuses: { spd: 9, str: 3 },    icon: "\u27B0", description: "Trench-pressure propulsion. Breaks the sound barrier underwater." },
  { id: "tail-06", name: "Void Wake",           slot: "tail", rarity: "abyssal",   statBonuses: { spd: 12, lck: 4 },   icon: "\u27B0", description: "Leaves a trail of displaced reality. Opponents can't track it." },

  // === RANGED (6) ===
  { id: "range-01", name: "Biolume Lure",       slot: "ranged", rarity: "common",    statBonuses: { str: 1, lck: 1 },   icon: "\u2726", description: "Glowing appendage that distracts prey." },
  { id: "range-02", name: "Ink Spit",           slot: "ranged", rarity: "uncommon",  statBonuses: { str: 2, lck: 1 },   icon: "\u2726", description: "Pressurized ink gland. Blinds on hit." },
  { id: "range-03", name: "Spine Launcher",     slot: "ranged", rarity: "rare",      statBonuses: { str: 4, lck: 2 },   icon: "\u2726", description: "Fires calcified spines at high velocity.", familyAffinity: "Flora" },
  { id: "range-04", name: "Lightning Arc",      slot: "ranged", rarity: "epic",      statBonuses: { str: 5, lck: 3 },   icon: "\u2726", description: "Channels bioelectric discharge over distance.", familyAffinity: "Jellyfish" },
  { id: "range-05", name: "Trench Cannon",      slot: "ranged", rarity: "legendary", statBonuses: { str: 8, lck: 4 },   icon: "\u2726", description: "Superheated vent water fired at lethal pressure." },
  { id: "range-06", name: "Singularity Barb",   slot: "ranged", rarity: "abyssal",   statBonuses: { str: 11, lck: 5 },  icon: "\u2726", description: "Creates a micro-singularity on impact. Physics weeps." },

  // === CHARM (6) ===
  { id: "charm-01", name: "Lucky Pebble",       slot: "charm", rarity: "common",    statBonuses: { lck: 2 },            icon: "\u2666", description: "A smooth stone from the shore. Feels lucky." },
  { id: "charm-02", name: "Moon Pearl",         slot: "charm", rarity: "uncommon",  statBonuses: { lck: 3 },            icon: "\u2666", description: "Harvested under a full moon. Glows faintly." },
  { id: "charm-03", name: "Tidewalker's Charm", slot: "charm", rarity: "rare",      statBonuses: { lck: 5, spd: 1 },   icon: "\u2666", description: "Carved from a shipwreck's figurehead. Blessed by currents.", familyAffinity: "Fish" },
  { id: "charm-04", name: "Phantom Pearl",      slot: "charm", rarity: "epic",      statBonuses: { lck: 7 },            icon: "\u2666", description: "Phases in and out of existence. Bends probability.", familyAffinity: "Jellyfish" },
  { id: "charm-05", name: "Kraken's Eye",       slot: "charm", rarity: "legendary", statBonuses: { lck: 10, vit: 2 },   icon: "\u2666", description: "Sees all possible futures. Chooses the best one." },
  { id: "charm-06", name: "Fate Breaker",       slot: "charm", rarity: "abyssal",   statBonuses: { lck: 14 },           icon: "\u2666", description: "Doesn't bend luck — it breaks the concept entirely." },

  // === SHELL (6) ===
  { id: "shell-01", name: "Sand Shield",        slot: "shell", rarity: "common",    statBonuses: { vit: 2 },            icon: "\u2B21", description: "Compacted sand. Crumbles after a few hits." },
  { id: "shell-02", name: "Reef Guard",         slot: "shell", rarity: "uncommon",  statBonuses: { vit: 3, str: 1 },    icon: "\u2B21", description: "Living coral shield. Grows spikes when threatened.", familyAffinity: "Flora" },
  { id: "shell-03", name: "Nautilus Shield",    slot: "shell", rarity: "rare",      statBonuses: { vit: 5, lck: 1 },    icon: "\u2B21", description: "Golden-ratio spiral shell. Mathematically perfect defense.", familyAffinity: "Mollusk" },
  { id: "shell-04", name: "Chitin Bulwark",     slot: "shell", rarity: "epic",      statBonuses: { vit: 7, str: 2 },    icon: "\u2B21", description: "Layered crustacean chitin. Each layer harder than the last.", familyAffinity: "Crustacean" },
  { id: "shell-05", name: "Abyssal Barrier",    slot: "shell", rarity: "legendary", statBonuses: { vit: 10, lck: 2 },   icon: "\u2B21", description: "Absorbs kinetic energy and converts it to darkness." },
  { id: "shell-06", name: "Event Horizon",      slot: "shell", rarity: "abyssal",   statBonuses: { vit: 13, str: 3, lck: 2 }, icon: "\u2B21", description: "Nothing that touches it comes back. Including damage." },

  // === FIN (6) ===
  { id: "fin-01", name: "Torn Membrane",        slot: "fin", rarity: "common",    statBonuses: { spd: 1, lck: 1 },    icon: "\u2756", description: "Scavenged fin membrane. Flutters in the current." },
  { id: "fin-02", name: "Blade Fin",            slot: "fin", rarity: "uncommon",  statBonuses: { spd: 2, lck: 1 },    icon: "\u2756", description: "Razor-edged fin. Slices water and opponents." },
  { id: "fin-03", name: "Mirror Fin",           slot: "fin", rarity: "rare",      statBonuses: { spd: 3, lck: 3 },    icon: "\u2756", description: "Reflects light unpredictably. Confuses targeting.", familyAffinity: "Fish" },
  { id: "fin-04", name: "Spectral Fin",         slot: "fin", rarity: "epic",      statBonuses: { spd: 4, lck: 4 },    icon: "\u2756", description: "Semi-transparent. Exists in two places at once.", familyAffinity: "Jellyfish" },
  { id: "fin-05", name: "Temporal Stabilizer",  slot: "fin", rarity: "legendary", statBonuses: { spd: 7, lck: 5 },    icon: "\u2756", description: "Vibrates at frequencies that slow time for the wielder." },
  { id: "fin-06", name: "Dimensional Rudder",   slot: "fin", rarity: "abyssal",   statBonuses: { spd: 10, lck: 6 },   icon: "\u2756", description: "Steers through dimensional rifts. Destination: victory." },
];

// ─── Helpers ──────────────────────────────────────────────

export function getGearById(id: string): GearItem | undefined {
  return GEAR_CATALOG.find(g => g.id === id);
}

export function getGearBySlot(slot: GearSlot): GearItem[] {
  return GEAR_CATALOG.filter(g => g.slot === slot);
}

export function totalGearBonuses(gear: CreatureGear): { str: number; vit: number; spd: number; lck: number } {
  const totals = { str: 0, vit: 0, spd: 0, lck: 0 };
  for (const item of Object.values(gear)) {
    if (!item) continue;
    totals.str += item.statBonuses.str || 0;
    totals.vit += item.statBonuses.vit || 0;
    totals.spd += item.statBonuses.spd || 0;
    totals.lck += item.statBonuses.lck || 0;
  }
  return totals;
}

export function gearScore(gear: CreatureGear): number {
  const b = totalGearBonuses(gear);
  return b.str + b.vit + b.spd + b.lck;
}

export function gearScoreLabel(score: number): { label: string; color: string } {
  if (score >= 60) return { label: "Mythic", color: "#ff00aa" };
  if (score >= 40) return { label: "Legendary", color: "#ffcc00" };
  if (score >= 25) return { label: "Epic", color: "#aa55ff" };
  if (score >= 15) return { label: "Rare", color: "#00aaff" };
  if (score >= 5)  return { label: "Uncommon", color: "#00ff88" };
  return { label: "Common", color: "#9ca3af" };
}

// ─── Mock Gear Assignments ────────────────────────────────
// Maps creature address → equipped gear

export const MOCK_GEAR: Record<string, CreatureGear> = {
  // === Kraken-7 (Elder, deepSeeker) — full legendary/abyssal set ===
  "BoT1aaaa1111111111111111111111111111111111111": {
    head: GEAR_CATALOG.find(g => g.id === "head-05")!,    // Abyssal Crown
    chest: GEAR_CATALOG.find(g => g.id === "chest-05")!,   // Trenchplate
    claw: GEAR_CATALOG.find(g => g.id === "claw-05")!,     // Void Talon
    tail: GEAR_CATALOG.find(g => g.id === "tail-05")!,     // Abyssal Thruster
    charm: GEAR_CATALOG.find(g => g.id === "charm-05")!,   // Kraken's Eye
    shell: GEAR_CATALOG.find(g => g.id === "shell-05")!,   // Abyssal Barrier
  },
  // === Lurker-3 (Adult, deepSeeker) — rare/epic mix ===
  "BoT1aaaa2222222222222222222222222222222222222": {
    claw: GEAR_CATALOG.find(g => g.id === "claw-03")!,     // Venom Fang
    tail: GEAR_CATALOG.find(g => g.id === "tail-03")!,     // Jet Propulsor
    ranged: GEAR_CATALOG.find(g => g.id === "range-03")!,  // Spine Launcher
  },
  // === Probe-X9 (Larva, deepSeeker) — 1 common ===
  "BoT1aaaa3333333333333333333333333333333333333": {
    head: GEAR_CATALOG.find(g => g.id === "head-01")!,     // Barnacle Cap
  },
  // === Whale-01 (Adult, abyssTrader) — epic wager build ===
  "BoT2bbbb1111111111111111111111111111111111111": {
    head: GEAR_CATALOG.find(g => g.id === "head-04")!,     // Ghostlight Circlet
    chest: GEAR_CATALOG.find(g => g.id === "chest-04")!,   // Inkweave Armor
    claw: GEAR_CATALOG.find(g => g.id === "claw-04")!,     // Stormclaw
    charm: GEAR_CATALOG.find(g => g.id === "charm-04")!,   // Phantom Pearl
  },
  // === Sting-44 (Juvenile, abyssTrader) — uncommon ===
  "BoT2bbbb2222222222222222222222222222222222222": {
    claw: GEAR_CATALOG.find(g => g.id === "claw-02")!,     // Coral Blade
    fin: GEAR_CATALOG.find(g => g.id === "fin-02")!,       // Blade Fin
  },
  // === APEX-001 (Adult, voidAgent) — epic/legendary ===
  "BoT4dddd1111111111111111111111111111111111111": {
    head: GEAR_CATALOG.find(g => g.id === "head-05")!,     // Abyssal Crown
    chest: GEAR_CATALOG.find(g => g.id === "chest-05")!,   // Trenchplate
    claw: GEAR_CATALOG.find(g => g.id === "claw-06")!,     // Leviathan's Grip
    tail: GEAR_CATALOG.find(g => g.id === "tail-04")!,     // Phase Tail
    shell: GEAR_CATALOG.find(g => g.id === "shell-04")!,   // Chitin Bulwark
  },
  // === Shadow-8 (Juvenile, voidAgent) — luck build ===
  "BoT4dddd2222222222222222222222222222222222222": {
    charm: GEAR_CATALOG.find(g => g.id === "charm-04")!,   // Phantom Pearl
    fin: GEAR_CATALOG.find(g => g.id === "fin-04")!,       // Spectral Fin
    head: GEAR_CATALOG.find(g => g.id === "head-02")!,     // Coral Crown
  },
  // === Dread-IX (Adult, voidAgent) — rare mix ===
  "BoT4dddd4444444444444444444444444444444444444": {
    chest: GEAR_CATALOG.find(g => g.id === "chest-03")!,   // Ironshell Plate
    shell: GEAR_CATALOG.find(g => g.id === "shell-03")!,   // Nautilus Shield
    tail: GEAR_CATALOG.find(g => g.id === "tail-02")!,     // Current Rider
  },
  // === FANG-01 (Elder, abyssalHunter) — abyssal power set ===
  "BoT8hhhh1111111111111111111111111111111111111": {
    head: GEAR_CATALOG.find(g => g.id === "head-06")!,     // Void Diadem
    chest: GEAR_CATALOG.find(g => g.id === "chest-06")!,   // Living Carapace
    claw: GEAR_CATALOG.find(g => g.id === "claw-06")!,     // Leviathan's Grip
    tail: GEAR_CATALOG.find(g => g.id === "tail-06")!,     // Void Wake
    ranged: GEAR_CATALOG.find(g => g.id === "range-06")!,  // Singularity Barb
    charm: GEAR_CATALOG.find(g => g.id === "charm-06")!,   // Fate Breaker
    shell: GEAR_CATALOG.find(g => g.id === "shell-06")!,   // Event Horizon
    fin: GEAR_CATALOG.find(g => g.id === "fin-06")!,       // Dimensional Rudder
  },
  // === Mauler-6 (Adult, abyssalHunter) — rare str build ===
  "BoT8hhhh2222222222222222222222222222222222222": {
    claw: GEAR_CATALOG.find(g => g.id === "claw-03")!,     // Venom Fang
    chest: GEAR_CATALOG.find(g => g.id === "chest-03")!,   // Ironshell Plate
    ranged: GEAR_CATALOG.find(g => g.id === "range-02")!,  // Ink Spit
  },
  // === Ghost-v3 (Adult, phantomFin) — epic luck ===
  "BoT7gggg1111111111111111111111111111111111111": {
    charm: GEAR_CATALOG.find(g => g.id === "charm-05")!,   // Kraken's Eye
    fin: GEAR_CATALOG.find(g => g.id === "fin-05")!,       // Temporal Stabilizer
    head: GEAR_CATALOG.find(g => g.id === "head-04")!,     // Ghostlight Circlet
    tail: GEAR_CATALOG.find(g => g.id === "tail-04")!,     // Phase Tail
  },
  // === Haze-19 (Juvenile, phantomFin) — rare dodge ===
  "BoT7gggg2222222222222222222222222222222222222": {
    fin: GEAR_CATALOG.find(g => g.id === "fin-03")!,       // Mirror Fin
    charm: GEAR_CATALOG.find(g => g.id === "charm-03")!,   // Tidewalker's Charm
  },
  // === Tendril-K (Adult, coralWhisper) — epic tank ===
  "BoT9iiii1111111111111111111111111111111111111": {
    shell: GEAR_CATALOG.find(g => g.id === "shell-05")!,   // Abyssal Barrier
    chest: GEAR_CATALOG.find(g => g.id === "chest-04")!,   // Inkweave Armor
    head: GEAR_CATALOG.find(g => g.id === "head-03")!,     // Pressure Helm
  },
  // === Bastion-1 (Adult, tideWarden) — rare/epic VIT ===
  "BoTAjjjj1111111111111111111111111111111111111": {
    shell: GEAR_CATALOG.find(g => g.id === "shell-04")!,   // Chitin Bulwark
    chest: GEAR_CATALOG.find(g => g.id === "chest-03")!,   // Ironshell Plate
    head: GEAR_CATALOG.find(g => g.id === "head-03")!,     // Pressure Helm
    fin: GEAR_CATALOG.find(g => g.id === "fin-01")!,       // Torn Membrane
  },
  // === Streak-7 (Adult, nightCrawler) — speed set ===
  "BoTBkkkk1111111111111111111111111111111111111": {
    tail: GEAR_CATALOG.find(g => g.id === "tail-05")!,     // Abyssal Thruster
    fin: GEAR_CATALOG.find(g => g.id === "fin-04")!,       // Spectral Fin
    ranged: GEAR_CATALOG.find(g => g.id === "range-04")!,  // Lightning Arc
  },
  // === Bolt-v4 (Juvenile, nightCrawler) — uncommon speed ===
  "BoTBkkkk2222222222222222222222222222222222222": {
    tail: GEAR_CATALOG.find(g => g.id === "tail-02")!,     // Current Rider
    fin: GEAR_CATALOG.find(g => g.id === "fin-02")!,       // Blade Fin
  },
  // === Flicker-2 (Adult, nightCrawler) — rare mix ===
  "BoTBkkkk3333333333333333333333333333333333333": {
    claw: GEAR_CATALOG.find(g => g.id === "claw-03")!,     // Venom Fang
    charm: GEAR_CATALOG.find(g => g.id === "charm-02")!,   // Moon Pearl
    chest: GEAR_CATALOG.find(g => g.id === "chest-02")!,   // Scale Mail
  },
  // === Oracle-P1 (Adult, deepOracle) — epic balanced ===
  "BoTCllll1111111111111111111111111111111111111": {
    charm: GEAR_CATALOG.find(g => g.id === "charm-04")!,   // Phantom Pearl
    shell: GEAR_CATALOG.find(g => g.id === "shell-03")!,   // Nautilus Shield
    head: GEAR_CATALOG.find(g => g.id === "head-04")!,     // Ghostlight Circlet
    claw: GEAR_CATALOG.find(g => g.id === "claw-04")!,     // Stormclaw
  },
  // === Seer-K8 (Adult, deepOracle) — rare ===
  "BoTCllll2222222222222222222222222222222222222": {
    claw: GEAR_CATALOG.find(g => g.id === "claw-03")!,     // Venom Fang
    ranged: GEAR_CATALOG.find(g => g.id === "range-03")!,  // Spine Launcher
  },
  // === Coral-9K (Adult, reefRunner) — rare flora ===
  "BoT3cccc1111111111111111111111111111111111111": {
    shell: GEAR_CATALOG.find(g => g.id === "shell-02")!,   // Reef Guard
    ranged: GEAR_CATALOG.find(g => g.id === "range-03")!,  // Spine Launcher
    chest: GEAR_CATALOG.find(g => g.id === "chest-02")!,   // Scale Mail
  },
  // === Ripple-v1 (Juvenile, tidalBot) — uncommon ===
  "BoT5eeee1111111111111111111111111111111111111": {
    shell: GEAR_CATALOG.find(g => g.id === "shell-02")!,   // Reef Guard
    head: GEAR_CATALOG.find(g => g.id === "head-01")!,     // Barnacle Cap
  },
  // === Surge-03 (Juvenile, tidalBot) — rare brawler ===
  "BoT5eeee3333333333333333333333333333333333333": {
    claw: GEAR_CATALOG.find(g => g.id === "claw-02")!,     // Coral Blade
    chest: GEAR_CATALOG.find(g => g.id === "chest-02")!,   // Scale Mail
    charm: GEAR_CATALOG.find(g => g.id === "charm-01")!,   // Lucky Pebble
  },
};

/** Get gear for a creature, returns empty object if none */
export function getCreatureGear(address: string): CreatureGear {
  return MOCK_GEAR[address] || {};
}
