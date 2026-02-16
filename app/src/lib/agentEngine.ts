import {
  AnchorProvider,
  Program,
  BN,
} from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import idlJson from "./idl.json";

// ─── Constants ────────────────────────────────────────

const PROGRAM_ID = new PublicKey("GDjye2re8UKJFaDf6ez45vjSyqWvBLffeRNTfgi3fpfL");
const LOBS_TOKEN_MINT = new PublicKey("3xHvvEomh6jFDQ1WEqS3NzPwr7a5F11VASQy3eu1pump");
const SLOT_HASHES_SYSVAR = new PublicKey("SysvarS1otHashes111111111111111111111111111");
const CONFIG_SEED = Buffer.from("config");
const TREASURY_SEED = Buffer.from("treasury");
const LOB_SEED = Buffer.from("lob");
const CHALLENGE_SEED = Buffer.from("challenge");

const EVOLUTION_THRESHOLDS = [100, 500, 2000];
const FEED_COOLDOWN_SECONDS = 3600;
const MIN_LOBS_BALANCE = 10_000_000_000; // 10K $LOBS (6 decimals)
const MIN_SOL_BALANCE = 0.003 * LAMPORTS_PER_SOL;

// ─── Types ────────────────────────────────────────────

export type AgentStrategy = "conservative" | "balanced" | "aggressive";

export interface AgentConfig {
  creatureName: string;
  aggression: AgentStrategy;
  maxWagerTokens: number;
  tickIntervalMs: number;
}

export type AgentStatus = "idle" | "running" | "paused" | "error" | "low_funds";

export interface AgentAction {
  id: string;
  timestamp: number;
  type: "mint" | "feed" | "battle" | "evolve" | "wager" | "error" | "info";
  description: string;
  txSignature?: string;
  success: boolean;
}

export interface LobState {
  address: PublicKey;
  owner: PublicKey;
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
}

export interface AgentSnapshot {
  status: AgentStatus;
  myLobs: LobState[];
  lobsBalance: number;
  solBalance: number;
  actionLog: AgentAction[];
  totalBurned: number;
  tickCount: number;
  lastError: string | null;
}

// ─── PDA helpers ──────────────────────────────────────

function deriveConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([CONFIG_SEED], PROGRAM_ID);
}

function deriveTreasuryPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([TREASURY_SEED], PROGRAM_ID);
}

function deriveLobPda(owner: PublicKey, mintIndex: number): [PublicKey, number] {
  const indexBuf = Buffer.alloc(8);
  indexBuf.writeBigUInt64LE(BigInt(mintIndex));
  return PublicKey.findProgramAddressSync([LOB_SEED, owner.toBuffer(), indexBuf], PROGRAM_ID);
}

function deriveChallengePda(challengerLob: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([CHALLENGE_SEED, challengerLob.toBuffer()], PROGRAM_ID);
}

// ─── Agent Engine ─────────────────────────────────────

export class AgentEngine {
  private connection: Connection;
  private burner: Keypair;
  private program: Program;
  private config: AgentConfig;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private _status: AgentStatus = "idle";
  private _actionLog: AgentAction[] = [];
  private _tickCount = 0;
  private _totalBurned = 0;
  private _lastError: string | null = null;
  private consecutiveErrors = 0;
  private onUpdate: () => void;

  // PDAs
  private configPda: PublicKey;
  private treasuryPda: PublicKey;

  constructor(
    connection: Connection,
    burner: Keypair,
    config: AgentConfig,
    onUpdate: () => void
  ) {
    this.connection = connection;
    this.burner = burner;
    this.config = config;
    this.onUpdate = onUpdate;

    // Create a simple wallet wrapper for AnchorProvider
    const wallet = {
      publicKey: burner.publicKey,
      signTransaction: async (tx: any) => {
        tx.sign(burner);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        txs.forEach((tx) => tx.sign(burner));
        return txs;
      },
    };

    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });

    this.program = new Program(idlJson as any, provider);
    [this.configPda] = deriveConfigPda();
    [this.treasuryPda] = deriveTreasuryPda();
  }

  get status() { return this._status; }
  get actionLog() { return this._actionLog; }
  get tickCount() { return this._tickCount; }

  getSnapshot(): AgentSnapshot {
    return {
      status: this._status,
      myLobs: [], // filled by hook via refresh
      lobsBalance: 0,
      solBalance: 0,
      actionLog: [...this._actionLog],
      totalBurned: this._totalBurned,
      tickCount: this._tickCount,
      lastError: this._lastError,
    };
  }

  start() {
    if (this._status === "running") return;
    this._status = "running";
    this.log("info", "Agent released into the deep", true);
    this.onUpdate();

    // Run first tick immediately
    this.tick();

    this.intervalHandle = setInterval(() => {
      if (this._status === "running") this.tick();
    }, this.config.tickIntervalMs);
  }

  pause() {
    this._status = "paused";
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.log("info", "Agent paused", true);
    this.onUpdate();
  }

  stop() {
    this._status = "idle";
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.log("info", "Agent stopped", true);
    this.onUpdate();
  }

  updateConfig(config: Partial<AgentConfig>) {
    Object.assign(this.config, config);
  }

  // ─── Main tick ──────────────────────────────────────

  private async tick() {
    this._tickCount++;

    try {
      // Check balances
      const solBalance = await this.connection.getBalance(this.burner.publicKey);
      if (solBalance < MIN_SOL_BALANCE) {
        this._status = "low_funds";
        this.log("error", `Low SOL: ${(solBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`, false);
        this.pause();
        return;
      }

      const lobsBalance = await this.getTokenBalance();
      if (lobsBalance < MIN_LOBS_BALANCE) {
        // Only error if we already have a creature (minting costs more)
        const myLobs = await this.getMyLobs();
        if (myLobs.length > 0) {
          this._status = "low_funds";
          this.log("error", `Low $LOBS: ${this.formatTokens(lobsBalance)}`, false);
          this.pause();
          return;
        }
      }

      // Decision tree
      const myLobs = await this.getMyLobs();

      // 1. Mint if no creatures
      if (myLobs.length === 0) {
        if (lobsBalance >= 50_000_000_000) { // 50K $LOBS
          await this.doMint();
        } else {
          this.log("info", `Need 50K $LOBS to mint (have ${this.formatTokens(lobsBalance)})`, true);
        }
        this.onUpdate();
        return;
      }

      const myLob = myLobs[0]; // Play with first creature

      // 2. Feed if hungry
      const now = Math.floor(Date.now() / 1000);
      const timeSinceFed = now - myLob.lastFed;
      if (myLob.mood < 50 && timeSinceFed >= FEED_COOLDOWN_SECONDS && lobsBalance >= 10_000_000_000) {
        await this.doFeed(myLob);
        this.onUpdate();
        return;
      }

      // 3. Evolve if ready
      if (myLob.evolutionStage < 3) {
        const threshold = EVOLUTION_THRESHOLDS[myLob.evolutionStage];
        if (myLob.xp >= threshold) {
          await this.doEvolve(myLob);
          this.onUpdate();
          return;
        }
      }

      // 4. Battle
      const allLobs = await this.getAllLobs();
      const opponents = allLobs.filter(
        (l) => l.isAlive && !l.owner.equals(this.burner.publicKey)
      );

      if (opponents.length > 0) {
        const opponent = this.pickOpponent(myLob, opponents);
        await this.doBattle(myLob, opponent);
      } else {
        this.log("info", "No opponents found in the deep...", true);
      }

      this.consecutiveErrors = 0;
      this.onUpdate();
    } catch (err: any) {
      this.consecutiveErrors++;
      this._lastError = err.message || "Unknown error";
      this.log("error", `Tick failed: ${this._lastError}`, false);

      if (this.consecutiveErrors >= 10) {
        this.log("error", "Too many consecutive errors — pausing agent", false);
        this.pause();
      }
      this.onUpdate();
    }
  }

  // ─── Actions ────────────────────────────────────────

  private async doMint() {
    const gameConfig = await this.getGameConfig();
    const mintIndex = gameConfig.totalLobsMinted;
    const [lobPda] = deriveLobPda(this.burner.publicKey, mintIndex);

    const tx = await this.program.methods
      .mintLob(this.config.creatureName)
      .accounts({
        owner: this.burner.publicKey,
        config: this.configPda,
        lob: lobPda,
        slotHashes: SLOT_HASHES_SYSVAR,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    this._totalBurned += 50_000;
    this.log("mint", `Minted "${this.config.creatureName}"`, true, tx);
  }

  private async doFeed(lob: LobState) {
    const ownerAta = await this.ensureAta();

    const tx = await this.program.methods
      .feedLob()
      .accounts({
        owner: this.burner.publicKey,
        config: this.configPda,
        lob: lob.address,
        ownerTokenAccount: ownerAta,
        tokenMint: LOBS_TOKEN_MINT,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    this._totalBurned += 10_000;
    this.log("feed", `Fed ${lob.name} (+20 mood, +10 XP)`, true, tx);
  }

  private async doEvolve(lob: LobState) {
    const stages = ["Larva", "Juvenile", "Adult", "Elder"];
    const nextStage = stages[lob.evolutionStage + 1] || "Elder";

    const tx = await this.program.methods
      .evolveLob()
      .accounts({
        owner: this.burner.publicKey,
        lob: lob.address,
      })
      .rpc();

    this.log("evolve", `${lob.name} evolved to ${nextStage}!`, true, tx);
  }

  private async doBattle(myLob: LobState, opponent: LobState) {
    const tx = await this.program.methods
      .battle()
      .accounts({
        challenger: this.burner.publicKey,
        challengerLob: myLob.address,
        defenderLob: opponent.address,
        slotHashes: SLOT_HASHES_SYSVAR,
      })
      .rpc();

    // Check result
    const after = await this.fetchLob(myLob.address);
    const won = after.battlesWon > myLob.battlesWon;

    this.log(
      "battle",
      won
        ? `${myLob.name} defeated ${opponent.name}! (+XP)`
        : `${myLob.name} lost to ${opponent.name}`,
      won,
      tx
    );
  }

  // ─── Opponent selection ─────────────────────────────

  private pickOpponent(myLob: LobState, opponents: LobState[]): LobState {
    const scored = opponents.map((o) => ({
      lob: o,
      power: this.powerScore(o),
    }));
    scored.sort((a, b) => a.power - b.power);

    switch (this.config.aggression) {
      case "conservative":
        return scored[0].lob; // weakest
      case "aggressive":
        return scored[scored.length - 1].lob; // strongest
      case "balanced":
      default:
        return scored[Math.floor(Math.random() * scored.length)].lob; // random
    }
  }

  private powerScore(lob: LobState): number {
    const mult = [1.0, 1.2, 1.5, 2.0][lob.evolutionStage] || 1.0;
    return (lob.strength + lob.vitality + lob.speed + lob.luck) * mult * (lob.mood / 100);
  }

  // ─── Queries ────────────────────────────────────────

  private async getGameConfig(): Promise<{ totalLobsMinted: number; tokenMint: PublicKey }> {
    const c = await (this.program.account as any).gameConfig.fetch(this.configPda);
    return {
      totalLobsMinted: (c.totalLobsMinted as any as BN).toNumber(),
      tokenMint: c.tokenMint,
    };
  }

  async getMyLobs(): Promise<LobState[]> {
    const all = await this.getAllLobs();
    return all.filter((l) => l.owner.equals(this.burner.publicKey));
  }

  async getAllLobs(): Promise<LobState[]> {
    const accounts = await (this.program.account as any).lob.all();
    return accounts.map((a: any) => this.parseLob(a.publicKey, a.account));
  }

  private async fetchLob(address: PublicKey): Promise<LobState> {
    const a = await (this.program.account as any).lob.fetch(address);
    return this.parseLob(address, a);
  }

  private parseLob(address: PublicKey, a: any): LobState {
    return {
      address,
      owner: a.owner,
      name: a.name,
      species: a.species,
      xp: a.xp,
      strength: a.strength,
      vitality: a.vitality,
      speed: a.speed,
      luck: a.luck,
      mood: a.mood,
      lastFed: (a.lastFed as any as BN).toNumber(),
      battlesWon: a.battlesWon,
      battlesLost: a.battlesLost,
      evolutionStage: a.evolutionStage,
      isAlive: a.isAlive,
      mintIndex: (a.mintIndex as any as BN).toNumber(),
    };
  }

  async getTokenBalance(): Promise<number> {
    try {
      const ata = await getAssociatedTokenAddress(
        LOBS_TOKEN_MINT,
        this.burner.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      const account = await getAccount(this.connection, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
      return Number(account.amount);
    } catch {
      return 0;
    }
  }

  async getSolBalance(): Promise<number> {
    return this.connection.getBalance(this.burner.publicKey);
  }

  private async ensureAta(): Promise<PublicKey> {
    const ata = await getAssociatedTokenAddress(
      LOBS_TOKEN_MINT,
      this.burner.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    try {
      await getAccount(this.connection, ata, "confirmed", TOKEN_2022_PROGRAM_ID);
    } catch {
      // Create ATA if it doesn't exist
      const ix = createAssociatedTokenAccountInstruction(
        this.burner.publicKey,
        ata,
        this.burner.publicKey,
        LOBS_TOKEN_MINT,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const tx = new Transaction().add(ix);
      tx.feePayer = this.burner.publicKey;
      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.sign(this.burner);
      await this.connection.sendRawTransaction(tx.serialize());
      // Wait for confirmation
      await new Promise((r) => setTimeout(r, 2000));
    }

    return ata;
  }

  /** Build a withdraw transaction to send remaining funds back to user wallet */
  async buildWithdrawTx(userWallet: PublicKey): Promise<Transaction> {
    const tx = new Transaction();

    // Transfer $LOBS back
    const lobsBalance = await this.getTokenBalance();
    if (lobsBalance > 0) {
      const { createTransferCheckedInstruction } = await import("@solana/spl-token");
      const burnerAta = await getAssociatedTokenAddress(
        LOBS_TOKEN_MINT, this.burner.publicKey, false, TOKEN_2022_PROGRAM_ID
      );
      const userAta = await getAssociatedTokenAddress(
        LOBS_TOKEN_MINT, userWallet, false, TOKEN_2022_PROGRAM_ID
      );

      // Ensure user has an ATA
      try {
        await getAccount(this.connection, userAta, "confirmed", TOKEN_2022_PROGRAM_ID);
      } catch {
        tx.add(createAssociatedTokenAccountInstruction(
          this.burner.publicKey, userAta, userWallet, LOBS_TOKEN_MINT,
          TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
        ));
      }

      tx.add(createTransferCheckedInstruction(
        burnerAta, LOBS_TOKEN_MINT, userAta, this.burner.publicKey,
        BigInt(lobsBalance), 6, [], TOKEN_2022_PROGRAM_ID
      ));
    }

    // Transfer remaining SOL back (leave 5000 lamports for rent)
    const solBalance = await this.connection.getBalance(this.burner.publicKey);
    const solToSend = solBalance - 10000; // keep small amount for fees
    if (solToSend > 0) {
      tx.add(SystemProgram.transfer({
        fromPubkey: this.burner.publicKey,
        toPubkey: userWallet,
        lamports: solToSend,
      }));
    }

    if (tx.instructions.length === 0) return tx;

    tx.feePayer = this.burner.publicKey;
    tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    tx.sign(this.burner);
    return tx;
  }

  // ─── Logging ────────────────────────────────────────

  private log(type: AgentAction["type"], description: string, success: boolean, txSignature?: string) {
    const action: AgentAction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      type,
      description,
      txSignature,
      success,
    };
    this._actionLog.unshift(action);
    // Keep last 100 entries
    if (this._actionLog.length > 100) this._actionLog.length = 100;
  }

  private formatTokens(smallest: number): string {
    return (smallest / 1_000_000).toLocaleString() + " $LOBS";
  }
}
