import { PublicKey } from "@solana/web3.js";

/** Species type IDs */
export enum Species {
  Snapclaw = 0,
  Shellback = 1,
  Reefling = 2,
  Tidecrawler = 3,
  Deepmaw = 4,
  Driftbloom = 5,
}

/** Evolution stages */
export enum EvolutionStage {
  Larva = 0,
  Juvenile = 1,
  Adult = 2,
  Elder = 3,
}

/** Species metadata */
export const SPECIES_INFO: Record<
  Species,
  { name: string; trait: string; emoji: string }
> = {
  [Species.Snapclaw]: {
    name: "Snapclaw",
    trait: "Aggressive crustacean",
    emoji: "🦞",
  },
  [Species.Shellback]: {
    name: "Shellback",
    trait: "Armored turtle",
    emoji: "🐢",
  },
  [Species.Reefling]: {
    name: "Reefling",
    trait: "Coral symbiote",
    emoji: "🪸",
  },
  [Species.Tidecrawler]: {
    name: "Tidecrawler",
    trait: "Swift crab",
    emoji: "🦀",
  },
  [Species.Deepmaw]: {
    name: "Deepmaw",
    trait: "Abyssal predator",
    emoji: "🐡",
  },
  [Species.Driftbloom]: {
    name: "Driftbloom",
    trait: "Ethereal jellyfish",
    emoji: "🪼",
  },
};

/** Stage display names */
export const STAGE_NAMES: Record<EvolutionStage, string> = {
  [EvolutionStage.Larva]: "Larva",
  [EvolutionStage.Juvenile]: "Juvenile",
  [EvolutionStage.Adult]: "Adult",
  [EvolutionStage.Elder]: "Elder",
};

/** Evolution XP thresholds */
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
  mood: number;
  lastFed: number;
  battlesWon: number;
  battlesLost: number;
  evolutionStage: EvolutionStage;
  isAlive: boolean;
  mintIndex: number;
  bump: number;
}

/** On-chain GameConfig data */
export interface GameConfigData {
  address: PublicKey;
  authority: PublicKey;
  totalLobsMinted: number;
  bump: number;
  treasuryBump: number;
}

/** Battle result */
export interface BattleResult {
  txSignature: string;
  challengerWon: boolean;
  challengerLob: PublicKey;
  defenderLob: PublicKey;
}
