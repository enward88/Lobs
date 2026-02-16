import { Keypair } from "@solana/web3.js";

const STORAGE_PREFIX = "lobs-agent-";

/** Generate a fresh burner keypair */
export function generateBurnerKeypair(): Keypair {
  return Keypair.generate();
}

/** Encrypt and store a keypair in localStorage, keyed by the user's wallet pubkey */
export async function encryptAndStore(
  keypair: Keypair,
  walletPubkey: string,
  encryptionKey: Uint8Array
): Promise<void> {
  const aesKey = await deriveAesKey(encryptionKey, walletPubkey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    aesKey,
    keypair.secretKey as any
  );
  const stored = {
    iv: uint8ToBase64(iv),
    data: uint8ToBase64(new Uint8Array(encrypted)),
    pubkey: keypair.publicKey.toBase58(),
  };
  localStorage.setItem(STORAGE_PREFIX + walletPubkey, JSON.stringify(stored));
}

/** Load and decrypt a keypair from localStorage */
export async function loadAndDecrypt(
  walletPubkey: string,
  encryptionKey: Uint8Array
): Promise<Keypair | null> {
  const raw = localStorage.getItem(STORAGE_PREFIX + walletPubkey);
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw);
    const aesKey = await deriveAesKey(encryptionKey, walletPubkey);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToUint8(stored.iv) as any },
      aesKey,
      base64ToUint8(stored.data) as any
    );
    return Keypair.fromSecretKey(new Uint8Array(decrypted));
  } catch {
    return null;
  }
}

/** Check if a burner exists for this wallet */
export function hasBurner(walletPubkey: string): boolean {
  return localStorage.getItem(STORAGE_PREFIX + walletPubkey) !== null;
}

/** Get the stored burner pubkey without decrypting */
export function getBurnerPubkey(walletPubkey: string): string | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + walletPubkey);
  if (!raw) return null;
  try {
    return JSON.parse(raw).pubkey;
  } catch {
    return null;
  }
}

/** Delete a burner keypair */
export function deleteBurner(walletPubkey: string): void {
  localStorage.removeItem(STORAGE_PREFIX + walletPubkey);
}

/** Derive strategy config storage key */
export function loadAgentConfig(walletPubkey: string): AgentStoredConfig | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + walletPubkey + "-config");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAgentConfig(walletPubkey: string, config: AgentStoredConfig): void {
  localStorage.setItem(STORAGE_PREFIX + walletPubkey + "-config", JSON.stringify(config));
}

export interface AgentStoredConfig {
  creatureName: string;
  aggression: "conservative" | "balanced" | "aggressive";
  maxWagerTokens: number;
}

// ─── Helpers ──────────────────────────────────────────

async function deriveAesKey(encryptionKey: Uint8Array, salt: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encryptionKey as any,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToUint8(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
