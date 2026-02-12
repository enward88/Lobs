import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  Species,
  EvolutionStage,
  SPECIES_INFO,
  STAGE_NAMES,
  EVOLUTION_THRESHOLDS,
  LobData,
} from "./types";

/** Program seeds */
export const SEEDS = {
  CONFIG: Buffer.from("config"),
  TREASURY: Buffer.from("treasury"),
  LOB: Buffer.from("lob"),
} as const;

/** Derive the game config PDA */
export function deriveConfigPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.CONFIG], programId);
}

/** Derive the treasury PDA */
export function deriveTreasuryPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.TREASURY], programId);
}

/** Derive a Lob PDA */
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

/** SlotHashes sysvar address */
export const SLOT_HASHES_SYSVAR = new PublicKey(
  "SysvarS1otHashes111111111111111111111111111"
);

/** Format a Lob for display */
export function formatLob(lob: LobData): string {
  const speciesInfo = SPECIES_INFO[lob.species];
  const stageName = STAGE_NAMES[lob.evolutionStage];
  const winRate =
    lob.battlesWon + lob.battlesLost > 0
      ? (
          (lob.battlesWon / (lob.battlesWon + lob.battlesLost)) *
          100
        ).toFixed(1)
      : "N/A";

  return [
    `${speciesInfo.emoji} ${lob.name} — ${speciesInfo.name} (${stageName})`,
    `  STR:${lob.strength} VIT:${lob.vitality} SPD:${lob.speed} | Mood:${lob.mood}/100`,
    `  XP:${lob.xp} | Battles: ${lob.battlesWon}W/${lob.battlesLost}L (${winRate}%)`,
    `  Owner: ${lob.owner.toString().slice(0, 8)}...`,
  ].join("\n");
}

/** Get XP needed for next evolution */
export function xpToNextEvolution(lob: LobData): number | null {
  if (lob.evolutionStage >= 3) return null;
  return EVOLUTION_THRESHOLDS[lob.evolutionStage] - lob.xp;
}

/** Check if a Lob can evolve */
export function canEvolve(lob: LobData): boolean {
  if (lob.evolutionStage >= 3) return false;
  return lob.xp >= EVOLUTION_THRESHOLDS[lob.evolutionStage];
}

/** Evolution multipliers in basis points */
const EVOLUTION_MULTIPLIERS = [10000, 12000, 15000, 20000];

/** Calculate effective stats with evolution and mood modifiers */
export function effectiveStats(lob: LobData) {
  const mult = EVOLUTION_MULTIPLIERS[lob.evolutionStage];
  return {
    strength: Math.floor((lob.strength * mult * lob.mood) / 1_000_000),
    vitality: Math.floor((lob.vitality * mult * 10) / 10000),
    speed: Math.floor((lob.speed * mult) / 10000),
  };
}
