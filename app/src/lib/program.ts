// Solana JSON-RPC via plain fetch — zero Node.js dependencies

// Program ID — update after deployment
export const PROGRAM_ID = "GDjye2re8UKJFaDf6ez45vjSyqWvBLffeRNTfgi3fpfL";

// Solana mainnet RPC
export const RPC_URL = "https://api.mainnet-beta.solana.com";

/** 30 species organized by family */
export const SPECIES_NAME: Record<number, string> = {
  // Crustaceans
  0: "Snapclaw", 1: "Tidecrawler", 2: "Ironpincer", 3: "Razorshrimp", 4: "Boulderclaw",
  // Mollusks
  5: "Inkshade", 6: "Coilshell", 7: "Pearlmouth", 8: "Spiralhorn", 9: "Venomcone",
  // Jellyfish
  10: "Driftbloom", 11: "Stormbell", 12: "Ghostveil", 13: "Warbloom", 14: "Moonpulse",
  // Fish
  15: "Deepmaw", 16: "Flashfin", 17: "Gulpjaw", 18: "Mirrorfin", 19: "Stonescale",
  // Coral/Flora
  20: "Reefling", 21: "Thorncoil", 22: "Bloomsire", 23: "Tendrilwrap", 24: "Sporeling",
  // Abyssal
  25: "Voidmaw", 26: "Pressureking", 27: "Darkdrifter", 28: "Abysswatcher", 29: "Depthcrown",
};

export const SPECIES_FAMILY: Record<number, string> = {
  0: "Crustacean", 1: "Crustacean", 2: "Crustacean", 3: "Crustacean", 4: "Crustacean",
  5: "Mollusk", 6: "Mollusk", 7: "Mollusk", 8: "Mollusk", 9: "Mollusk",
  10: "Jellyfish", 11: "Jellyfish", 12: "Jellyfish", 13: "Jellyfish", 14: "Jellyfish",
  15: "Fish", 16: "Fish", 17: "Fish", 18: "Fish", 19: "Fish",
  20: "Flora", 21: "Flora", 22: "Flora", 23: "Flora", 24: "Flora",
  25: "Abyssal", 26: "Abyssal", 27: "Abyssal", 28: "Abyssal", 29: "Abyssal",
};

export const FAMILY_COLOR: Record<string, string> = {
  Crustacean: "#ff4466",
  Mollusk: "#aa55ff",
  Jellyfish: "#00ffd5",
  Fish: "#00aaff",
  Flora: "#00ff88",
  Abyssal: "#ff00aa",
};

export const SPECIES_TRAIT: Record<number, string> = {
  0: "Aggressive lobster", 1: "Swift crab", 2: "Armored crab", 3: "Glass shrimp", 4: "Giant isopod",
  5: "Octopus", 6: "Nautilus", 7: "Giant clam", 8: "Sea snail", 9: "Cone snail",
  10: "Ethereal jelly", 11: "Electric jelly", 12: "Phantom jelly", 13: "War jelly", 14: "Moon jelly",
  15: "Anglerfish", 16: "Lanternfish", 17: "Gulper eel", 18: "Hatchetfish", 19: "Coelacanth",
  20: "Coral symbiote", 21: "Thorny coral", 22: "Anemone", 23: "Kelp creature", 24: "Deep fungus",
  25: "Abyssal predator", 26: "Barreleye fish", 27: "Sea cucumber", 28: "Giant squid", 29: "Sea dragon",
};

/** Stage name map */
export const STAGE_NAME: Record<number, string> = {
  0: "Larva", 1: "Juvenile", 2: "Adult", 3: "Elder",
};

/** Evolution XP thresholds */
export const EVOLUTION_THRESHOLDS = [100, 500, 2000];

/** Evolution multipliers (basis points) */
export const EVOLUTION_MULTIPLIERS = [10000, 12000, 15000, 20000];

/** Call Solana JSON-RPC */
export async function rpcCall(method: string, params: unknown[]): Promise<any> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await response.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}

/** Base58 encode bytes */
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58Encode(bytes: Uint8Array): string {
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let str = "";
  for (const byte of bytes) {
    if (byte === 0) str += "1";
    else break;
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    str += BASE58_ALPHABET[digits[i]];
  }
  return str;
}
