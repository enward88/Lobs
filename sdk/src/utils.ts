import { PublicKey } from "@solana/web3.js";
import {
  Species,
  EvolutionStage,
  SPECIES_INFO,
  STAGE_NAMES,
  EVOLUTION_THRESHOLDS,
  LobData,
} from "./types";

export const SEEDS = {
  CONFIG: Buffer.from("config"),
  TREASURY: Buffer.from("treasury"),
  LOB: Buffer.from("lob"),
  CHALLENGE: Buffer.from("challenge"),
} as const;

export function deriveConfigPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.CONFIG], programId);
}

export function deriveTreasuryPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.TREASURY], programId);
}

export function deriveLobPda(
  programId: PublicKey,
  owner: PublicKey,
  mintIndex: number
): [PublicKey, number] {
  const indexBuffer = Buffer.alloc(8);
  indexBuffer.writeBigUInt64LE(BigInt(mintIndex));
  return PublicKey.findProgramAddressSync(
    [SEEDS.LOB, owner.toBuffer(), indexBuffer],
    programId
  );
}

export function deriveChallengePda(
  programId: PublicKey,
  challengerLob: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.CHALLENGE, challengerLob.toBuffer()],
    programId
  );
}

export const SLOT_HASHES_SYSVAR = new PublicKey(
  "SysvarS1otHashes111111111111111111111111111"
);

/** Pretty-print a Lob */
export function formatLob(lob: LobData): string {
  const info = SPECIES_INFO[lob.species];
  const stage = STAGE_NAMES[lob.evolutionStage];
  const total = lob.battlesWon + lob.battlesLost;
  const winRate = total > 0 ? ((lob.battlesWon / total) * 100).toFixed(1) : "N/A";

  return [
    `${lob.name} — ${info.name} [${info.family}] (${stage})`,
    `  STR:${lob.strength} VIT:${lob.vitality} SPD:${lob.speed} | Mood:${lob.mood}/100`,
    `  XP:${lob.xp} | ${lob.battlesWon}W/${lob.battlesLost}L (${winRate}%)`,
    `  SOL won: ${(lob.solWon / 1e9).toFixed(4)} | SOL lost: ${(lob.solLost / 1e9).toFixed(4)}`,
    `  Owner: ${lob.owner.toString().slice(0, 8)}...`,
  ].join("\n");
}

export function xpToNextEvolution(lob: LobData): number | null {
  if (lob.evolutionStage >= 3) return null;
  return EVOLUTION_THRESHOLDS[lob.evolutionStage] - lob.xp;
}

export function canEvolve(lob: LobData): boolean {
  if (lob.evolutionStage >= 3) return false;
  return lob.xp >= EVOLUTION_THRESHOLDS[lob.evolutionStage];
}

const EVOLUTION_MULTIPLIERS = [10000, 12000, 15000, 20000];

export function effectiveStats(lob: LobData) {
  const mult = EVOLUTION_MULTIPLIERS[lob.evolutionStage];
  return {
    strength: Math.floor((lob.strength * mult * lob.mood) / 1_000_000),
    vitality: Math.floor((lob.vitality * mult * 10) / 10000),
    speed: Math.floor((lob.speed * mult) / 10000),
  };
}
