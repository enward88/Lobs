import { createContext, useContext, useState, useRef, useCallback } from "react";
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AgentEngine, AgentConfig, AgentSnapshot, AgentStatus, LobState } from "../lib/agentEngine";
import {
  generateBurnerKeypair,
  encryptAndStore,
  loadAndDecrypt,
  hasBurner,
  getBurnerPubkey,
  saveAgentConfig,
  loadAgentConfig,
  AgentStoredConfig,
} from "../lib/agentKeypair";
import { RPC_ENDPOINT } from "../lib/wallet";

export interface AgentContextValue {
  // State
  snapshot: AgentSnapshot;
  burnerPubkey: string | null;
  myLobs: LobState[];
  lobsBalance: number;
  solBalance: number;
  isUnlocked: boolean;

  // Actions
  unlockOrCreateAgent: (walletPubkey: string, signMessage: (msg: Uint8Array) => Promise<Uint8Array>) => Promise<void>;
  fundAgent: (sendTransaction: (tx: any, connection: any) => Promise<string>, walletPubkey: PublicKey, lobsAmount: number, solAmount: number) => Promise<string>;
  startAgent: (config: AgentConfig) => void;
  pauseAgent: () => void;
  stopAgent: () => void;
  withdrawFunds: (userWallet: PublicKey) => Promise<string>;
  refreshBalances: () => Promise<void>;
  refreshLobs: () => Promise<void>;
}

const defaultSnapshot: AgentSnapshot = {
  status: "idle",
  myLobs: [],
  lobsBalance: 0,
  solBalance: 0,
  actionLog: [],
  totalBurned: 0,
  tickCount: 0,
  lastError: null,
};

// Simple hook-based approach (no context needed for single page)
export function useAgentState() {
  const [snapshot, setSnapshot] = useState<AgentSnapshot>(defaultSnapshot);
  const [burnerPubkey, setBurnerPubkey] = useState<string | null>(null);
  const [myLobs, setMyLobs] = useState<LobState[]>([]);
  const [lobsBalance, setLobsBalance] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const engineRef = useRef<AgentEngine | null>(null);
  const burnerRef = useRef<Keypair | null>(null);
  const connectionRef = useRef<Connection>(new Connection(RPC_ENDPOINT, "confirmed"));

  const handleUpdate = useCallback(() => {
    if (engineRef.current) {
      setSnapshot(engineRef.current.getSnapshot());
    }
  }, []);

  const unlockOrCreateAgent = useCallback(async (
    walletPubkey: string,
    signMessage: (msg: Uint8Array) => Promise<Uint8Array>
  ) => {
    // Derive encryption key from wallet signature
    const msg = new TextEncoder().encode("lobs.fun agent keypair unlock");
    const sig = await signMessage(msg);
    const encKey = sig.slice(0, 32);

    let keypair: Keypair | null = null;

    if (hasBurner(walletPubkey)) {
      keypair = await loadAndDecrypt(walletPubkey, encKey);
    }

    if (!keypair) {
      keypair = generateBurnerKeypair();
      await encryptAndStore(keypair, walletPubkey, encKey);
    }

    burnerRef.current = keypair;
    setBurnerPubkey(keypair.publicKey.toBase58());
    setIsUnlocked(true);

    // Load saved config
    const savedConfig = loadAgentConfig(walletPubkey);
    if (savedConfig) {
      // Config is available for the UI to read
    }
  }, []);

  const fundAgent = useCallback(async (
    sendTransaction: (tx: any, connection: any) => Promise<string>,
    walletPubkey: PublicKey,
    lobsAmount: number, // in whole $LOBS tokens
    solAmount: number    // in SOL
  ): Promise<string> => {
    if (!burnerRef.current) throw new Error("Agent not unlocked");

    const { Transaction, SystemProgram } = await import("@solana/web3.js");
    const {
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
      getAssociatedTokenAddress,
      createAssociatedTokenAccountInstruction,
      createTransferCheckedInstruction,
      getAccount,
    } = await import("@solana/spl-token");

    const LOBS_MINT = new PublicKey("3xHvvEomh6jFDQ1WEqS3NzPwr7a5F11VASQy3eu1pump");
    const conn = connectionRef.current;
    const burnerPk = burnerRef.current.publicKey;

    const tx = new Transaction();

    // 1. Transfer SOL for fees
    if (solAmount > 0) {
      tx.add(SystemProgram.transfer({
        fromPubkey: walletPubkey,
        toPubkey: burnerPk,
        lamports: Math.floor(solAmount * LAMPORTS_PER_SOL),
      }));
    }

    // 2. Ensure burner has an ATA for $LOBS
    const burnerAta = await getAssociatedTokenAddress(
      LOBS_MINT, burnerPk, false, TOKEN_2022_PROGRAM_ID
    );
    try {
      await getAccount(conn, burnerAta, "confirmed", TOKEN_2022_PROGRAM_ID);
    } catch {
      tx.add(createAssociatedTokenAccountInstruction(
        walletPubkey, burnerAta, burnerPk, LOBS_MINT,
        TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
      ));
    }

    // 3. Transfer $LOBS tokens
    if (lobsAmount > 0) {
      const userAta = await getAssociatedTokenAddress(
        LOBS_MINT, walletPubkey, false, TOKEN_2022_PROGRAM_ID
      );
      const smallestUnits = BigInt(lobsAmount) * BigInt(1_000_000);
      tx.add(createTransferCheckedInstruction(
        userAta, LOBS_MINT, burnerAta, walletPubkey,
        smallestUnits, 6, [], TOKEN_2022_PROGRAM_ID
      ));
    }

    tx.feePayer = walletPubkey;
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;

    const sig = await sendTransaction(tx, conn);
    await conn.confirmTransaction(sig, "confirmed");

    // Refresh balances
    await refreshBalancesInner();

    return sig;
  }, []);

  const startAgent = useCallback((config: AgentConfig) => {
    if (!burnerRef.current) return;

    // Save config
    if (burnerPubkey) {
      // Find which wallet this belongs to — use burnerPubkey as a proxy
      saveAgentConfig(burnerPubkey, {
        creatureName: config.creatureName,
        aggression: config.aggression,
        maxWagerTokens: config.maxWagerTokens,
      });
    }

    const engine = new AgentEngine(
      connectionRef.current,
      burnerRef.current,
      config,
      handleUpdate
    );

    engineRef.current = engine;
    engine.start();
    handleUpdate();
  }, [burnerPubkey, handleUpdate]);

  const pauseAgent = useCallback(() => {
    engineRef.current?.pause();
    handleUpdate();
  }, [handleUpdate]);

  const stopAgent = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
    handleUpdate();
  }, [handleUpdate]);

  const withdrawFunds = useCallback(async (userWallet: PublicKey): Promise<string> => {
    if (!engineRef.current && !burnerRef.current) throw new Error("No agent");

    // Stop agent if running
    if (engineRef.current) {
      engineRef.current.stop();
    }

    // Build and create a temporary engine for withdrawal if needed
    const engine = engineRef.current || new AgentEngine(
      connectionRef.current,
      burnerRef.current!,
      { creatureName: "", aggression: "balanced", maxWagerTokens: 0, tickIntervalMs: 45000 },
      () => {}
    );

    const tx = await engine.buildWithdrawTx(userWallet);
    if (tx.instructions.length === 0) throw new Error("Nothing to withdraw");

    const sig = await connectionRef.current.sendRawTransaction(tx.serialize());
    await connectionRef.current.confirmTransaction(sig, "confirmed");

    engineRef.current = null;
    await refreshBalancesInner();
    handleUpdate();
    return sig;
  }, [handleUpdate]);

  const refreshBalancesInner = async () => {
    if (!burnerRef.current) return;
    const conn = connectionRef.current;

    const sol = await conn.getBalance(burnerRef.current.publicKey);
    setSolBalance(sol);

    try {
      const { getAssociatedTokenAddress, getAccount, TOKEN_2022_PROGRAM_ID } = await import("@solana/spl-token");
      const LOBS_MINT = new PublicKey("3xHvvEomh6jFDQ1WEqS3NzPwr7a5F11VASQy3eu1pump");
      const ata = await getAssociatedTokenAddress(LOBS_MINT, burnerRef.current.publicKey, false, TOKEN_2022_PROGRAM_ID);
      const account = await getAccount(conn, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
      setLobsBalance(Number(account.amount));
    } catch {
      setLobsBalance(0);
    }
  };

  const refreshBalances = useCallback(async () => {
    await refreshBalancesInner();
  }, []);

  const refreshLobs = useCallback(async () => {
    if (!engineRef.current) return;
    const lobs = await engineRef.current.getMyLobs();
    setMyLobs(lobs);
  }, []);

  return {
    snapshot,
    burnerPubkey,
    myLobs,
    lobsBalance,
    solBalance,
    isUnlocked,
    unlockOrCreateAgent,
    fundAgent,
    startAgent,
    pauseAgent,
    stopAgent,
    withdrawFunds,
    refreshBalances,
    refreshLobs,
  };
}
