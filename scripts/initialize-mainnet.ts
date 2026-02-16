/**
 * Initialize the Lobs game on Solana mainnet.
 * Run once with the deployer wallet to set up the config PDA and treasury.
 *
 * Usage: npx ts-node scripts/initialize-mainnet.ts
 */
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { LobsClient } from "../sdk/dist";
import * as fs from "fs";
import * as path from "path";

const LOBS_TOKEN_MINT = new PublicKey("3xHvvEomh6jFDQ1WEqS3NzPwr7a5F11VASQy3eu1pump");
const RPC_URL = "https://api.mainnet-beta.solana.com";

async function main() {
  // Load deployer keypair
  const keypairPath = process.env.DEPLOYER_KEYPAIR
    || path.join(require("os").homedir(), ".config", "solana", "id.json");

  console.log(`Loading keypair from: ${keypairPath}`);
  const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  console.log(`Deployer: ${deployer.publicKey.toBase58()}`);

  // Connect to mainnet
  const connection = new Connection(RPC_URL, "confirmed");
  const balance = await connection.getBalance(deployer.publicKey);
  console.log(`Balance: ${balance / 1e9} SOL`);

  // Load IDL
  const idlPath = path.join(__dirname, "..", "target", "idl", "lobs.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

  // Create client
  const wallet = new Wallet(deployer);
  const client = LobsClient.create(connection, wallet, idl);

  // Check if already initialized
  try {
    const config = await client.getConfig();
    console.log("\nGame is ALREADY initialized!");
    console.log(`  Authority: ${config.authority.toBase58()}`);
    console.log(`  Token Mint: ${config.tokenMint.toBase58()}`);
    console.log(`  Total Lobs Minted: ${config.totalLobsMinted}`);
    console.log(`  Total Wager Battles: ${config.totalWagerBattles}`);
    console.log(`  Total Tokens Burned: ${config.totalTokensBurned}`);
    return;
  } catch {
    console.log("\nGame not yet initialized. Initializing now...");
  }

  // Initialize
  console.log(`Token Mint: ${LOBS_TOKEN_MINT.toBase58()}`);
  const txSig = await client.initialize(LOBS_TOKEN_MINT);
  console.log(`\nInitialized! TX: ${txSig}`);
  console.log(`https://solscan.io/tx/${txSig}`);

  // Verify
  const config = await client.getConfig();
  console.log(`\nVerification:`);
  console.log(`  Authority: ${config.authority.toBase58()}`);
  console.log(`  Token Mint: ${config.tokenMint.toBase58()}`);
  console.log(`  Config PDA: ${config.address.toBase58()}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
