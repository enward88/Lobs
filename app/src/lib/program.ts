import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";

// Program ID — update after deployment
export const PROGRAM_ID = new PublicKey(
  "LoBS1111111111111111111111111111111111111111"
);

// Solana mainnet RPC
export const RPC_URL = "https://api.mainnet-beta.solana.com";

// PDA seeds
export const CONFIG_SEED = Buffer.from("config");
export const TREASURY_SEED = Buffer.from("treasury");
export const LOB_SEED = Buffer.from("lob");

export function getConnection(): Connection {
  return new Connection(RPC_URL, "confirmed");
}

/** Species emoji map */
export const SPECIES_EMOJI: Record<number, string> = {
  0: "🦞", // Snapclaw
  1: "🐢", // Shellback
  2: "🪸", // Reefling
  3: "🦀", // Tidecrawler
  4: "🐡", // Deepmaw
  5: "🪼", // Driftbloom
};

/** Species name map */
export const SPECIES_NAME: Record<number, string> = {
  0: "Snapclaw",
  1: "Shellback",
  2: "Reefling",
  3: "Tidecrawler",
  4: "Deepmaw",
  5: "Driftbloom",
};

/** Stage name map */
export const STAGE_NAME: Record<number, string> = {
  0: "Larva",
  1: "Juvenile",
  2: "Adult",
  3: "Elder",
};

/** Evolution XP thresholds */
export const EVOLUTION_THRESHOLDS = [100, 500, 2000];

/** Evolution multipliers (basis points) */
export const EVOLUTION_MULTIPLIERS = [10000, 12000, 15000, 20000];
