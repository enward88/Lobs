const PREFIXES = [
  "Abyss", "Deep", "Void", "Drift", "Storm",
  "Reef", "Dark", "Coral", "Tide", "Ink",
  "Brine", "Fathom", "Dusk", "Gloom", "Surge",
];

const SUFFIXES = [
  "fang", "claw", "maw", "fin", "bell",
  "shade", "crown", "pulse", "coil", "bloom",
  "spine", "horn", "eye", "drift", "lurk",
];

export function generateAgentName(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  const num = Math.floor(Math.random() * 99).toString().padStart(2, "0");
  return `${prefix}${suffix}-${num}`;
}
