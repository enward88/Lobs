import { useState, useEffect } from "react";
import { PROGRAM_ID, rpcCall, base58Encode } from "../lib/program";
import { MOCK_BOTS } from "../data/mockBots";

export interface LobAccount {
  address: string;
  owner: string;
  name: string;
  species: number;
  xp: number;
  strength: number;
  vitality: number;
  speed: number;
  luck: number;
  mood: number;
  lastFed: number;
  battlesWon: number;
  battlesLost: number;
  evolutionStage: number;
  isAlive: boolean;
  mintIndex: number;
  tokensWon: number;
  tokensLost: number;
}

/** Read a little-endian u32 from a byte array */
function readU32LE(data: Uint8Array, offset: number): number {
  return (
    (data[offset] |
      (data[offset + 1] << 8) |
      (data[offset + 2] << 16) |
      (data[offset + 3] << 24)) >>> 0
  );
}

/** Read a little-endian i64/u64 as a JS number (safe for timestamps & small values) */
function readU64LE(data: Uint8Array, offset: number): number {
  const lo = readU32LE(data, offset);
  const hi = readU32LE(data, offset + 4);
  return hi * 0x100000000 + lo;
}

/** Extract a 32-byte pubkey as base58 string */
function readPubkey(data: Uint8Array, offset: number): string {
  return base58Encode(data.slice(offset, offset + 32));
}

/** Parse a Lob account from raw base64 data */
function parseLob(pubkey: string, base64Data: string): LobAccount | null {
  try {
    const binary = atob(base64Data);
    const data = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      data[i] = binary.charCodeAt(i);
    }

    // Must be large enough for a Lob account
    if (data.length < 80) return null;

    // Skip 8-byte Anchor discriminator
    let offset = 8;

    // owner: Pubkey (32 bytes)
    const owner = readPubkey(data, offset);
    offset += 32;

    // name: String (4 byte length prefix + bytes)
    const nameLen = readU32LE(data, offset);
    offset += 4;
    if (nameLen > 32 || offset + nameLen > data.length) return null;
    const name = new TextDecoder().decode(data.slice(offset, offset + nameLen));
    offset += nameLen;

    // species: u8
    const species = data[offset];
    offset += 1;
    if (species > 29) return null;

    // xp: u32
    const xp = readU32LE(data, offset);
    offset += 4;

    // strength: u8
    const strength = data[offset];
    offset += 1;

    // vitality: u8
    const vitality = data[offset];
    offset += 1;

    // speed: u8
    const speed = data[offset];
    offset += 1;

    // luck: u8
    const luck = data[offset];
    offset += 1;

    // mood: u8
    const mood = data[offset];
    offset += 1;

    // last_fed: i64
    const lastFed = readU64LE(data, offset);
    offset += 8;

    // battles_won: u32
    const battlesWon = readU32LE(data, offset);
    offset += 4;

    // battles_lost: u32
    const battlesLost = readU32LE(data, offset);
    offset += 4;

    // evolution_stage: u8
    const evolutionStage = data[offset];
    offset += 1;

    // is_alive: bool
    const isAlive = data[offset] === 1;
    offset += 1;

    // mint_index: u64
    const mintIndex = readU64LE(data, offset);
    offset += 8;

    // sol_won: u64
    const tokensWon = readU64LE(data, offset);
    offset += 8;

    // sol_lost: u64
    const tokensLost = readU64LE(data, offset);

    return {
      address: pubkey,
      owner,
      name,
      species,
      xp,
      strength,
      vitality,
      speed,
      luck,
      mood,
      lastFed,
      battlesWon,
      battlesLost,
      evolutionStage,
      isAlive,
      mintIndex,
      tokensWon,
      tokensLost,
    };
  } catch {
    return null;
  }
}

export function useLobs() {
  const [lobs, setLobs] = useState<LobAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLobs() {
      try {
        const result = await rpcCall("getProgramAccounts", [
          PROGRAM_ID,
          { encoding: "base64", commitment: "confirmed" },
        ]);

        if (cancelled) return;

        const parsed: LobAccount[] = [];
        if (Array.isArray(result)) {
          for (const item of result) {
            const lob = parseLob(item.pubkey, item.account.data[0]);
            if (lob) parsed.push(lob);
          }
        }

        // Merge mock bots with real on-chain data
        const realAddresses = new Set(parsed.map((l) => l.address));
        const merged = [
          ...parsed,
          ...MOCK_BOTS.filter((b) => !realAddresses.has(b.address)),
        ];
        merged.sort((a, b) => a.mintIndex - b.mintIndex);

        if (!cancelled) {
          setLobs(merged);
          setLoading(false);
          setError(null);
        }
      } catch {
        // Program not deployed yet or RPC unavailable — show bots
        if (!cancelled) {
          setLobs([...MOCK_BOTS].sort((a, b) => a.mintIndex - b.mintIndex));
          setLoading(false);
        }
      }
    }

    fetchLobs();
    const interval = setInterval(fetchLobs, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { lobs, loading, error };
}
