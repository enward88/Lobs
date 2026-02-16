import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAgentState } from "../hooks/useAgent";
import { AgentSetup } from "./AgentSetup";
import { AgentLog } from "./AgentLog";
import { CreatureArt } from "./CreatureArt";
import { SPECIES_NAME, SPECIES_FAMILY, FAMILY_COLOR, STAGE_NAME } from "../lib/program";

export function AgentDashboard() {
  const { publicKey, signMessage, sendTransaction, connected } = useWallet();
  const agent = useAgentState();
  const [deploying, setDeploying] = useState(false);
  const [userLobsBalance, setUserLobsBalance] = useState(0);
  const [withdrawing, setWithdrawing] = useState(false);

  // Fetch user's $LOBS balance when connected
  useEffect(() => {
    if (!publicKey) return;
    fetchUserBalance(publicKey.toBase58()).then(setUserLobsBalance);
    const interval = setInterval(() => {
      fetchUserBalance(publicKey.toBase58()).then(setUserLobsBalance);
    }, 15000);
    return () => clearInterval(interval);
  }, [publicKey]);

  // Refresh agent balances periodically
  useEffect(() => {
    if (!agent.isUnlocked) return;
    agent.refreshBalances();
    agent.refreshLobs();
    const interval = setInterval(() => {
      agent.refreshBalances();
      agent.refreshLobs();
    }, 10000);
    return () => clearInterval(interval);
  }, [agent.isUnlocked]);

  const handleUnlock = useCallback(async () => {
    if (!publicKey || !signMessage) return;
    await agent.unlockOrCreateAgent(publicKey.toBase58(), signMessage);
    await agent.refreshBalances();
  }, [publicKey, signMessage, agent]);

  const handleDeploy = useCallback(async (config: {
    creatureName: string;
    aggression: "conservative" | "balanced" | "aggressive";
    lobsAmount: number;
    solAmount: number;
    maxWager: number;
  }) => {
    if (!publicKey || !sendTransaction) return;
    setDeploying(true);
    try {
      // Fund the burner
      await agent.fundAgent(sendTransaction, publicKey, config.lobsAmount, config.solAmount);

      // Start the agent
      agent.startAgent({
        creatureName: config.creatureName,
        aggression: config.aggression,
        maxWagerTokens: config.maxWager,
        tickIntervalMs: 45000,
      });
    } catch (err: any) {
      console.error("Deploy failed:", err);
    } finally {
      setDeploying(false);
    }
  }, [publicKey, sendTransaction, agent]);

  const handleWithdraw = useCallback(async () => {
    if (!publicKey) return;
    setWithdrawing(true);
    try {
      await agent.withdrawFunds(publicKey);
    } catch (err: any) {
      console.error("Withdraw failed:", err);
    } finally {
      setWithdrawing(false);
    }
  }, [publicKey, agent]);

  const isRunning = agent.snapshot.status === "running";
  const isPaused = agent.snapshot.status === "paused";
  const isLowFunds = agent.snapshot.status === "low_funds";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-2"
          style={{
            background: "linear-gradient(135deg, #00ffd5, #00aaff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(0, 255, 213, 0.15))",
          }}
        >
          Deploy Your Agent
        </h1>
        <p className="text-abyss-400 text-sm tracking-wider">
          Release an AI into the deep — it plays while you watch
        </p>
      </div>

      {/* Step 1: Connect wallet */}
      {!connected && (
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-8 text-center glow-border">
          <div className="text-abyss-500 text-xs uppercase tracking-[0.2em] mb-4">
            Step 1 — Connect Wallet
          </div>
          <p className="text-abyss-300 text-sm mb-6 max-w-md mx-auto">
            Connect your Phantom wallet to create a burner agent. Your main wallet stays safe —
            only the burner holds funds for gameplay.
          </p>
          <div className="flex justify-center">
            <WalletMultiButton
              style={{
                background: "linear-gradient(135deg, rgba(0, 255, 213, 0.15), rgba(0, 170, 255, 0.15))",
                border: "1px solid rgba(0, 255, 213, 0.3)",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.05em",
                padding: "12px 24px",
              }}
            />
          </div>
        </div>
      )}

      {/* Step 2: Unlock agent */}
      {connected && !agent.isUnlocked && (
        <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-8 text-center glow-border">
          <div className="text-abyss-500 text-xs uppercase tracking-[0.2em] mb-4">
            Step 2 — Unlock Agent
          </div>
          <p className="text-abyss-300 text-sm mb-4 max-w-md mx-auto">
            Sign a message to create (or unlock your existing) burner agent keypair.
            This signature is used to encrypt the key — your wallet never shares its private key.
          </p>
          <div className="text-[9px] font-mono text-abyss-600 mb-6">
            Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-6)}
          </div>
          <button
            onClick={handleUnlock}
            className="px-8 py-3 rounded-xl text-sm font-medium tracking-wider transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(0, 255, 213, 0.15), rgba(0, 170, 255, 0.15))",
              border: "1px solid rgba(0, 255, 213, 0.3)",
              color: "#00ffd5",
              boxShadow: "0 0 20px rgba(0, 255, 213, 0.1)",
            }}
          >
            Sign & Unlock
          </button>
        </div>
      )}

      {/* Step 3: Setup and deploy OR Active dashboard */}
      {connected && agent.isUnlocked && (
        <div className="space-y-6">
          {/* Agent Info Bar */}
          <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 p-4 glow-border">
            <div className="flex flex-wrap items-center gap-4 text-[10px]">
              {/* Status dot */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isRunning ? "animate-glow-pulse" : ""}`}
                  style={{
                    backgroundColor: isRunning
                      ? "#00ff88"
                      : isPaused
                      ? "#ffcc00"
                      : isLowFunds
                      ? "#ff4466"
                      : "#4b5563",
                  }}
                />
                <span className="text-abyss-300 uppercase tracking-wider font-medium">
                  {isRunning ? "Diving" : isPaused ? "Surfaced" : isLowFunds ? "Low Funds" : "Idle"}
                </span>
              </div>

              <div className="h-3 w-px bg-abyss-700/30" />

              {/* Burner address */}
              <div className="font-mono text-abyss-500">
                Agent: {agent.burnerPubkey?.slice(0, 6)}...{agent.burnerPubkey?.slice(-4)}
              </div>

              <div className="h-3 w-px bg-abyss-700/30" />

              {/* Balances */}
              <div className="flex items-center gap-3">
                <span className="text-biolume-cyan font-mono">
                  {(agent.lobsBalance / 1_000_000).toLocaleString()} $LOBS
                </span>
                <span className="text-abyss-500 font-mono">
                  {(agent.solBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL
                </span>
              </div>

              {isRunning && (
                <>
                  <div className="h-3 w-px bg-abyss-700/30" />
                  <span className="text-abyss-600 font-mono">
                    Tick #{agent.snapshot.tickCount}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Creature Card (if agent has lobs) */}
          {agent.myLobs.length > 0 && (
            <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
              <div className="px-5 py-3 border-b border-abyss-700/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-biolume-cyan" />
                  <span className="text-[10px] text-abyss-500 uppercase tracking-[0.2em]">Your Creature</span>
                </div>
              </div>
              <div className="p-5">
                {agent.myLobs.map((lob) => {
                  const family = SPECIES_FAMILY[lob.species] || "Unknown";
                  const color = FAMILY_COLOR[family] || "#00ffd5";
                  return (
                    <div key={lob.address.toBase58()} className="flex items-start gap-5">
                      <CreatureArt species={lob.species} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{lob.name}</span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full border font-mono"
                            style={{ color, borderColor: `${color}33`, backgroundColor: `${color}11` }}
                          >
                            {SPECIES_NAME[lob.species]}
                          </span>
                        </div>
                        <div className="text-[10px] text-abyss-500 mb-3">
                          {STAGE_NAME[lob.evolutionStage]} &middot; {lob.xp} XP &middot; {family}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <StatMini label="STR" value={lob.strength} color="#ff4466" />
                          <StatMini label="VIT" value={lob.vitality} color="#00ff88" />
                          <StatMini label="SPD" value={lob.speed} color="#00aaff" />
                          <StatMini label="LCK" value={lob.luck} color="#ffcc00" />
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[9px] text-abyss-500">
                          <span>Mood: {lob.mood}/100</span>
                          <span>W: {lob.battlesWon}</span>
                          <span>L: {lob.battlesLost}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity Log */}
          {agent.snapshot.actionLog.length > 0 && (
            <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
              <div className="px-5 py-3 border-b border-abyss-700/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isRunning ? "animate-glow-pulse" : ""}`}
                    style={{ backgroundColor: isRunning ? "#00ff88" : "#4b5563" }}
                  />
                  <span className="text-[10px] text-abyss-500 uppercase tracking-[0.2em]">Activity Log</span>
                </div>
                {agent.snapshot.totalBurned > 0 && (
                  <span className="text-[9px] font-mono" style={{ color: "#ff446688" }}>
                    {agent.snapshot.totalBurned.toLocaleString()} $LOBS burned
                  </span>
                )}
              </div>
              <AgentLog actions={agent.snapshot.actionLog} />
            </div>
          )}

          {/* Controls */}
          {(isRunning || isPaused || isLowFunds) && (
            <div className="flex gap-3">
              {isRunning ? (
                <button
                  onClick={() => agent.pauseAgent()}
                  className="flex-1 py-3 rounded-xl text-sm font-medium tracking-wider border transition-all duration-200"
                  style={{
                    color: "#ffcc00",
                    borderColor: "rgba(255, 204, 0, 0.3)",
                    backgroundColor: "rgba(255, 204, 0, 0.05)",
                  }}
                >
                  Pause Agent
                </button>
              ) : (
                <button
                  onClick={() => agent.startAgent({
                    creatureName: "Resumed",
                    aggression: "balanced",
                    maxWagerTokens: 0,
                    tickIntervalMs: 45000,
                  })}
                  className="flex-1 py-3 rounded-xl text-sm font-medium tracking-wider border transition-all duration-200"
                  style={{
                    color: "#00ff88",
                    borderColor: "rgba(0, 255, 136, 0.3)",
                    backgroundColor: "rgba(0, 255, 136, 0.05)",
                  }}
                >
                  Resume Agent
                </button>
              )}
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 py-3 rounded-xl text-sm font-medium tracking-wider border transition-all duration-200 disabled:opacity-30"
                style={{
                  color: "#ff4466",
                  borderColor: "rgba(255, 68, 102, 0.3)",
                  backgroundColor: "rgba(255, 68, 102, 0.05)",
                }}
              >
                {withdrawing ? "Withdrawing..." : "Stop & Withdraw"}
              </button>
            </div>
          )}

          {/* Setup form (when idle and no creature yet) */}
          {!isRunning && !isPaused && !isLowFunds && (
            <div className="rounded-2xl bg-abyss-900/30 border border-abyss-700/15 overflow-hidden glow-border">
              <div className="px-5 py-3 border-b border-abyss-700/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-biolume-cyan" />
                  <span className="text-[10px] text-abyss-500 uppercase tracking-[0.2em]">Configure Agent</span>
                </div>
              </div>
              <div className="p-5">
                <AgentSetup
                  lobsBalance={userLobsBalance}
                  onDeploy={handleDeploy}
                  loading={deploying}
                />
              </div>
            </div>
          )}

          {/* Tab warning */}
          {isRunning && (
            <div
              className="text-center text-[10px] tracking-wider px-4 py-3 rounded-xl border"
              style={{
                color: "rgba(255, 204, 0, 0.6)",
                borderColor: "rgba(255, 204, 0, 0.15)",
                backgroundColor: "rgba(255, 204, 0, 0.03)",
              }}
            >
              Your agent dives while this tab is open. Close the tab and it surfaces — but your creature and funds stay safe on-chain.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[8px] text-abyss-600 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-mono font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

async function fetchUserBalance(walletPubkey: string): Promise<number> {
  try {
    const { Connection, PublicKey } = await import("@solana/web3.js");
    const { getAssociatedTokenAddress, getAccount, TOKEN_2022_PROGRAM_ID } = await import("@solana/spl-token");
    const conn = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
    const LOBS_MINT = new PublicKey("3xHvvEomh6jFDQ1WEqS3NzPwr7a5F11VASQy3eu1pump");
    const wallet = new PublicKey(walletPubkey);
    const ata = await getAssociatedTokenAddress(LOBS_MINT, wallet, false, TOKEN_2022_PROGRAM_ID);
    const account = await getAccount(conn, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
    return Number(account.amount);
  } catch {
    return 0;
  }
}
