import { PublicKey } from "@solana/web3.js";

/** All 30 species, organized by family */
export enum Species {
  // Crustaceans
  Snapclaw = 0,
  Tidecrawler = 1,
  Ironpincer = 2,
  Razorshrimp = 3,
  Boulderclaw = 4,
  // Mollusks
  Inkshade = 5,
  Coilshell = 6,
  Pearlmouth = 7,
  Spiralhorn = 8,
  Venomcone = 9,
  // Jellyfish
  Driftbloom = 10,
  Stormbell = 11,
  Ghostveil = 12,
  Warbloom = 13,
  Moonpulse = 14,
  // Fish
  Deepmaw = 15,
  Flashfin = 16,
  Gulpjaw = 17,
  Mirrorfin = 18,
  Stonescale = 19,
  // Coral/Flora
  Reefling = 20,
  Thorncoil = 21,
  Bloomsire = 22,
  Tendrilwrap = 23,
  Sporeling = 24,
  // Abyssal
  Voidmaw = 25,
  Pressureking = 26,
  Darkdrifter = 27,
  Abysswatcher = 28,
  Depthcrown = 29,
}

export enum Family {
  Crustacean = "Crustacean",
  Mollusk = "Mollusk",
  Jellyfish = "Jellyfish",
  Fish = "Fish",
  Flora = "Flora",
  Abyssal = "Abyssal",
}

export enum EvolutionStage {
  Larva = 0,
  Juvenile = 1,
  Adult = 2,
  Elder = 3,
}

export interface SpeciesInfo {
  name: string;
  family: Family;
  trait: string;
  bonuses: { str: number; vit: number; spd: number; lck: number };
}

export const SPECIES_INFO: Record<Species, SpeciesInfo> = {
  [Species.Snapclaw]:     { name: "Snapclaw",     family: Family.Crustacean, trait: "Aggressive lobster",   bonuses: { str: 3, vit: 0, spd: 0, lck: -1 } },
  [Species.Tidecrawler]:  { name: "Tidecrawler",  family: Family.Crustacean, trait: "Swift crab",           bonuses: { str: 0, vit: 0, spd: 3, lck: 0 } },
  [Species.Ironpincer]:   { name: "Ironpincer",   family: Family.Crustacean, trait: "Armored crab",         bonuses: { str: 0, vit: 3, spd: 0, lck: -1 } },
  [Species.Razorshrimp]:  { name: "Razorshrimp",  family: Family.Crustacean, trait: "Glass shrimp",         bonuses: { str: 2, vit: -1, spd: 2, lck: 1 } },
  [Species.Boulderclaw]:  { name: "Boulderclaw",  family: Family.Crustacean, trait: "Giant isopod",         bonuses: { str: 0, vit: 4, spd: -2, lck: -2 } },
  [Species.Inkshade]:     { name: "Inkshade",     family: Family.Mollusk,    trait: "Octopus",              bonuses: { str: 2, vit: 0, spd: 2, lck: 2 } },
  [Species.Coilshell]:    { name: "Coilshell",    family: Family.Mollusk,    trait: "Nautilus",             bonuses: { str: 0, vit: 3, spd: 0, lck: 1 } },
  [Species.Pearlmouth]:   { name: "Pearlmouth",   family: Family.Mollusk,    trait: "Giant clam",           bonuses: { str: 0, vit: 4, spd: -2, lck: -1 } },
  [Species.Spiralhorn]:   { name: "Spiralhorn",   family: Family.Mollusk,    trait: "Sea snail",            bonuses: { str: -1, vit: 2, spd: 1, lck: 2 } },
  [Species.Venomcone]:    { name: "Venomcone",    family: Family.Mollusk,    trait: "Cone snail",           bonuses: { str: 3, vit: -2, spd: 0, lck: 1 } },
  [Species.Driftbloom]:   { name: "Driftbloom",   family: Family.Jellyfish,  trait: "Ethereal jelly",       bonuses: { str: -1, vit: 0, spd: 4, lck: 3 } },
  [Species.Stormbell]:    { name: "Stormbell",    family: Family.Jellyfish,  trait: "Electric jelly",       bonuses: { str: 3, vit: 0, spd: 0, lck: 1 } },
  [Species.Ghostveil]:    { name: "Ghostveil",    family: Family.Jellyfish,  trait: "Phantom jelly",        bonuses: { str: 0, vit: -1, spd: 3, lck: 4 } },
  [Species.Warbloom]:     { name: "Warbloom",     family: Family.Jellyfish,  trait: "War jelly",            bonuses: { str: 2, vit: 2, spd: -1, lck: 0 } },
  [Species.Moonpulse]:    { name: "Moonpulse",    family: Family.Jellyfish,  trait: "Moon jelly",           bonuses: { str: 1, vit: 1, spd: 1, lck: 2 } },
  [Species.Deepmaw]:      { name: "Deepmaw",      family: Family.Fish,       trait: "Anglerfish",           bonuses: { str: 4, vit: 0, spd: -2, lck: 0 } },
  [Species.Flashfin]:     { name: "Flashfin",     family: Family.Fish,       trait: "Lanternfish",          bonuses: { str: 0, vit: 0, spd: 3, lck: 2 } },
  [Species.Gulpjaw]:      { name: "Gulpjaw",      family: Family.Fish,       trait: "Gulper eel",           bonuses: { str: 3, vit: 0, spd: -1, lck: 0 } },
  [Species.Mirrorfin]:    { name: "Mirrorfin",    family: Family.Fish,       trait: "Hatchetfish",          bonuses: { str: -1, vit: 0, spd: 3, lck: 3 } },
  [Species.Stonescale]:   { name: "Stonescale",   family: Family.Fish,       trait: "Coelacanth",           bonuses: { str: 0, vit: 3, spd: 0, lck: -1 } },
  [Species.Reefling]:     { name: "Reefling",     family: Family.Flora,      trait: "Coral symbiote",       bonuses: { str: 1, vit: 1, spd: 1, lck: 0 } },
  [Species.Thorncoil]:    { name: "Thorncoil",    family: Family.Flora,      trait: "Thorny coral",         bonuses: { str: 3, vit: 0, spd: -2, lck: -1 } },
  [Species.Bloomsire]:    { name: "Bloomsire",    family: Family.Flora,      trait: "Anemone",              bonuses: { str: 2, vit: 2, spd: -1, lck: 0 } },
  [Species.Tendrilwrap]:  { name: "Tendrilwrap",  family: Family.Flora,      trait: "Kelp creature",        bonuses: { str: -2, vit: 3, spd: 0, lck: 1 } },
  [Species.Sporeling]:    { name: "Sporeling",    family: Family.Flora,      trait: "Deep fungus",          bonuses: { str: 0, vit: 2, spd: 1, lck: 2 } },
  [Species.Voidmaw]:      { name: "Voidmaw",      family: Family.Abyssal,    trait: "Abyssal predator",     bonuses: { str: 4, vit: 0, spd: -1, lck: 1 } },
  [Species.Pressureking]: { name: "Pressureking", family: Family.Abyssal,    trait: "Barreleye fish",       bonuses: { str: 0, vit: 2, spd: 2, lck: 1 } },
  [Species.Darkdrifter]:  { name: "Darkdrifter",  family: Family.Abyssal,    trait: "Sea cucumber",         bonuses: { str: 0, vit: 4, spd: -1, lck: -1 } },
  [Species.Abysswatcher]: { name: "Abysswatcher", family: Family.Abyssal,    trait: "Giant squid",          bonuses: { str: 2, vit: 0, spd: 2, lck: 2 } },
  [Species.Depthcrown]:   { name: "Depthcrown",   family: Family.Abyssal,    trait: "Sea dragon",           bonuses: { str: 3, vit: 1, spd: 0, lck: 1 } },
};

export const STAGE_NAMES: Record<EvolutionStage, string> = {
  [EvolutionStage.Larva]: "Larva",
  [EvolutionStage.Juvenile]: "Juvenile",
  [EvolutionStage.Adult]: "Adult",
  [EvolutionStage.Elder]: "Elder",
};

export const EVOLUTION_THRESHOLDS = [100, 500, 2000];

/** On-chain Lob account data */
export interface LobData {
  address: PublicKey;
  owner: PublicKey;
  name: string;
  species: Species;
  xp: number;
  strength: number;
  vitality: number;
  speed: number;
  luck: number;
  mood: number;
  lastFed: number;
  battlesWon: number;
  battlesLost: number;
  evolutionStage: EvolutionStage;
  isAlive: boolean;
  mintIndex: number;
  tokensWon: number;
  tokensLost: number;
  bump: number;
}

export interface GameConfigData {
  address: PublicKey;
  authority: PublicKey;
  tokenMint: PublicKey;
  totalLobsMinted: number;
  totalWagerBattles: number;
  totalTokensWagered: number;
  totalTokensBurned: number;
  bump: number;
  treasuryBump: number;
}

export interface BattleResult {
  txSignature: string;
  challengerWon: boolean;
  challengerLob: PublicKey;
  defenderLob: PublicKey;
}

export interface ChallengeData {
  address: PublicKey;
  challenger: PublicKey;
  challengerLob: PublicKey;
  defenderLob: PublicKey;
  wager: number;
  createdAt: number;
  isActive: boolean;
}

export interface WagerResult extends BattleResult {
  wager: number;
  winnings: number;
  socialPost?: any;
}
