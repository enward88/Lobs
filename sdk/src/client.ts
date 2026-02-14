import {
  AnchorProvider,
  Program,
  Idl,
  BN,
  Wallet,
} from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  LobData,
  GameConfigData,
  BattleResult,
  ChallengeData,
  WagerResult,
  Species,
  EvolutionStage,
} from "./types";
import {
  deriveConfigPda,
  deriveTreasuryPda,
  deriveLobPda,
  deriveChallengePda,
  SLOT_HASHES_SYSVAR,
} from "./utils";

/**
 * LobsClient — the main interface for agents to interact with the Lobs game.
 *
 * Usage with an x402 wallet (or any Solana keypair):
 *
 * ```ts
 * import { LobsClient } from "lobs-sdk";
 * import { Connection, Keypair } from "@solana/web3.js";
 * import { Wallet } from "@coral-xyz/anchor";
 *
 * const keypair = Keypair.fromSecretKey(yourX402PrivateKey);
 * const wallet = new Wallet(keypair);
 * const connection = new Connection("https://api.mainnet-beta.solana.com");
 *
 * const client = LobsClient.create(connection, wallet);
 * const { lob } = await client.mintLob("MyCreature");
 * ```
 */
export class LobsClient {
  readonly program: Program;
  readonly connection: Connection;
  readonly wallet: Wallet;
  readonly programId: PublicKey;

  private configPda: PublicKey;
  private configBump: number;
  private treasuryPda: PublicKey;

  constructor(
    connection: Connection,
    wallet: Wallet,
    programId: PublicKey,
    idl: Idl
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = programId;

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    this.program = new Program(idl as any, provider);

    [this.configPda, this.configBump] = deriveConfigPda(programId);
    [this.treasuryPda] = deriveTreasuryPda(programId);
  }

  /**
   * Convenience factory — uses the default program ID.
   * Pass your x402 wallet (Keypair wrapped in anchor Wallet).
   */
  static create(
    connection: Connection,
    wallet: Wallet,
    idl: Idl,
    programId?: PublicKey
  ): LobsClient {
    const pid = programId || new PublicKey("LoBS1111111111111111111111111111111111111111");
    return new LobsClient(connection, wallet, pid, idl);
  }

  // ─── Core Actions ─────────────────────────────────────────

  /** Initialize the game (one-time setup by deployer). Pass the $LOBS token mint. */
  async initialize(tokenMint: PublicKey): Promise<string> {
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      this.treasuryPda,
      true // allowOwnerOffCurve (PDA)
    );

    return this.program.methods
      .initialize()
      .accounts({
        authority: this.wallet.publicKey,
        config: this.configPda,
        treasury: this.treasuryPda,
        tokenMint,
        treasuryTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  /** Mint a new Lob with random species and stats */
  async mintLob(name: string): Promise<{ lob: LobData; txSignature: string }> {
    const config = await this.getConfig();
    const mintIndex = config.totalLobsMinted;
    const [lobPda] = deriveLobPda(this.programId, this.wallet.publicKey, mintIndex);

    const tx = await this.program.methods
      .mintLob(name)
      .accounts({
        owner: this.wallet.publicKey,
        config: this.configPda,
        lob: lobPda,
        slotHashes: SLOT_HASHES_SYSVAR,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const lob = await this.getLob(lobPda);
    return { lob, txSignature: tx };
  }

  /** Feed a Lob — costs $LOBS tokens, +20 mood, +10 XP, 1hr cooldown */
  async feedLob(lobAddress: PublicKey): Promise<string> {
    const config = await this.getConfig();
    const ownerTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.wallet.publicKey
    );
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.treasuryPda,
      true
    );

    return this.program.methods
      .feedLob()
      .accounts({
        owner: this.wallet.publicKey,
        config: this.configPda,
        lob: lobAddress,
        ownerTokenAccount,
        treasuryTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  /** Free battle — no wager, just XP and glory */
  async battle(myLob: PublicKey, opponentLob: PublicKey): Promise<BattleResult> {
    const before = await this.getLob(myLob);
    const tx = await this.program.methods
      .battle()
      .accounts({
        challenger: this.wallet.publicKey,
        challengerLob: myLob,
        defenderLob: opponentLob,
        slotHashes: SLOT_HASHES_SYSVAR,
      })
      .rpc();

    const after = await this.getLob(myLob);
    return {
      txSignature: tx,
      challengerWon: after.battlesWon > before.battlesWon,
      challengerLob: myLob,
      defenderLob: opponentLob,
    };
  }

  /** Evolve a Lob to the next stage */
  async evolveLob(lobAddress: PublicKey): Promise<string> {
    return this.program.methods
      .evolveLob()
      .accounts({
        owner: this.wallet.publicKey,
        lob: lobAddress,
      })
      .rpc();
  }

  // ─── Wager Battles ────────────────────────────────────────

  /**
   * Create a wager challenge. Your $LOBS tokens go into escrow.
   * @param myLob Your Lob's address
   * @param wagerTokens Wager in $LOBS tokens (whole units, e.g. 1000 = 1000 $LOBS)
   * @param targetLob Optional: specific opponent. Omit for open challenge.
   */
  async createChallenge(
    myLob: PublicKey,
    wagerTokens: number,
    targetLob?: PublicKey
  ): Promise<{ challenge: PublicKey; txSignature: string }> {
    const config = await this.getConfig();
    const wagerSmallestUnits = BigInt(wagerTokens) * BigInt(1_000_000); // 6 decimals
    const [challengePda] = deriveChallengePda(this.programId, myLob);

    const challengerTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.wallet.publicKey
    );
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.treasuryPda,
      true
    );

    const tx = await this.program.methods
      .createChallenge(
        new BN(wagerSmallestUnits.toString()),
        targetLob || null
      )
      .accounts({
        challenger: this.wallet.publicKey,
        config: this.configPda,
        challengerLob: myLob,
        challenge: challengePda,
        challengerTokenAccount,
        treasuryTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return { challenge: challengePda, txSignature: tx };
  }

  /**
   * Accept an existing wager challenge. Matches the stake, triggers battle.
   * Winner gets the pot minus 2.5% fee.
   */
  async acceptChallenge(
    challengeAddress: PublicKey,
    myLob: PublicKey
  ): Promise<WagerResult> {
    const config = await this.getConfig();
    const challenge = await this.getChallenge(challengeAddress);
    const beforeLob = await this.getLob(myLob);

    const defenderTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.wallet.publicKey
    );
    const challengerTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      challenge.challenger
    );
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.treasuryPda,
      true
    );

    const tx = await this.program.methods
      .acceptChallenge()
      .accounts({
        defender: this.wallet.publicKey,
        config: this.configPda,
        challenge: challengeAddress,
        challengerLob: challenge.challengerLob,
        defenderLob: myLob,
        treasury: this.treasuryPda,
        defenderTokenAccount,
        challengerTokenAccount,
        treasuryTokenAccount,
        slotHashes: SLOT_HASHES_SYSVAR,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const afterLob = await this.getLob(myLob);
    const defenderWon = afterLob.battlesWon > beforeLob.battlesWon;
    const totalPot = challenge.wager * 2;
    const fee = Math.floor((totalPot * 250) / 10000);

    return {
      txSignature: tx,
      challengerWon: !defenderWon,
      challengerLob: challenge.challengerLob,
      defenderLob: myLob,
      wager: challenge.wager,
      winnings: totalPot - fee,
    };
  }

  // ─── Queries ──────────────────────────────────────────────

  /** Fetch a single Lob */
  async getLob(address: PublicKey): Promise<LobData> {
    const a = await this.program.account.lob.fetch(address);
    return {
      address,
      owner: a.owner,
      name: a.name,
      species: a.species as Species,
      xp: a.xp,
      strength: a.strength,
      vitality: a.vitality,
      speed: a.speed,
      mood: a.mood,
      lastFed: (a.lastFed as any as BN).toNumber(),
      battlesWon: a.battlesWon,
      battlesLost: a.battlesLost,
      evolutionStage: a.evolutionStage as EvolutionStage,
      isAlive: a.isAlive,
      mintIndex: (a.mintIndex as any as BN).toNumber(),
      tokensWon: (a.tokensWon as any as BN).toNumber(),
      tokensLost: (a.tokensLost as any as BN).toNumber(),
      bump: a.bump,
    };
  }

  /** Fetch all Lobs */
  async getAllLobs(): Promise<LobData[]> {
    const accounts = await this.program.account.lob.all();
    return accounts.map((a) => ({
      address: a.publicKey,
      owner: a.account.owner,
      name: a.account.name,
      species: a.account.species as Species,
      xp: a.account.xp,
      strength: a.account.strength,
      vitality: a.account.vitality,
      speed: a.account.speed,
      mood: a.account.mood,
      lastFed: (a.account.lastFed as any as BN).toNumber(),
      battlesWon: a.account.battlesWon,
      battlesLost: a.account.battlesLost,
      evolutionStage: a.account.evolutionStage as EvolutionStage,
      isAlive: a.account.isAlive,
      mintIndex: (a.account.mintIndex as any as BN).toNumber(),
      tokensWon: (a.account.tokensWon as any as BN).toNumber(),
      tokensLost: (a.account.tokensLost as any as BN).toNumber(),
      bump: a.account.bump,
    }));
  }

  /** Fetch Lobs owned by the connected wallet */
  async getMyLobs(): Promise<LobData[]> {
    const all = await this.getAllLobs();
    return all.filter((l) => l.owner.equals(this.wallet.publicKey));
  }

  /** Fetch a challenge */
  async getChallenge(address: PublicKey): Promise<ChallengeData> {
    const a = await this.program.account.battleChallenge.fetch(address);
    return {
      address,
      challenger: a.challenger,
      challengerLob: a.challengerLob,
      defenderLob: a.defenderLob,
      wager: (a.wager as any as BN).toNumber(),
      createdAt: (a.createdAt as any as BN).toNumber(),
      isActive: a.isActive,
    };
  }

  /** Fetch all active challenges */
  async getActiveChallenges(): Promise<ChallengeData[]> {
    const accounts = await this.program.account.battleChallenge.all();
    return accounts
      .filter((a) => a.account.isActive)
      .map((a) => ({
        address: a.publicKey,
        challenger: a.account.challenger,
        challengerLob: a.account.challengerLob,
        defenderLob: a.account.defenderLob,
        wager: (a.account.wager as any as BN).toNumber(),
        createdAt: (a.account.createdAt as any as BN).toNumber(),
        isActive: a.account.isActive,
      }));
  }

  /** Fetch game config */
  async getConfig(): Promise<GameConfigData> {
    const c = await this.program.account.gameConfig.fetch(this.configPda);
    return {
      address: this.configPda,
      authority: c.authority,
      tokenMint: c.tokenMint,
      totalLobsMinted: (c.totalLobsMinted as any as BN).toNumber(),
      totalWagerBattles: (c.totalWagerBattles as any as BN).toNumber(),
      totalTokensWagered: (c.totalTokensWagered as any as BN).toNumber(),
      bump: c.bump,
      treasuryBump: c.treasuryBump,
    };
  }
}
