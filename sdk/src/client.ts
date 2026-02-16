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
  TOKEN_2022_PROGRAM_ID,
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
import { LobsSocial, SocialConfig, SocialPostResult } from "./social";

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
  readonly social: LobsSocial;

  private configPda: PublicKey;
  private configBump: number;
  private treasuryPda: PublicKey;

  constructor(
    connection: Connection,
    wallet: Wallet,
    programId: PublicKey,
    idl: Idl,
    socialConfig?: SocialConfig
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
    this.social = new LobsSocial(socialConfig);
  }

  /**
   * Convenience factory — uses the default program ID.
   * Pass your x402 wallet (Keypair wrapped in anchor Wallet).
   * Pass socialConfig to enable auto-posting to MoltBook and MoltX.
   */
  static create(
    connection: Connection,
    wallet: Wallet,
    idl: Idl,
    programId?: PublicKey,
    socialConfig?: SocialConfig
  ): LobsClient {
    const pid = programId || new PublicKey("GDjye2re8UKJFaDf6ez45vjSyqWvBLffeRNTfgi3fpfL");
    return new LobsClient(connection, wallet, pid, idl, socialConfig);
  }

  // ─── Core Actions ─────────────────────────────────────────

  /** Initialize the game (one-time setup by deployer). Pass the $LOBS token mint. */
  async initialize(tokenMint: PublicKey): Promise<string> {
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      this.treasuryPda,
      true, // allowOwnerOffCurve (PDA)
      TOKEN_2022_PROGRAM_ID
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
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  /** Mint a new Lob with random species and stats. Auto-posts to MoltBook/MoltX if social is configured. */
  async mintLob(name: string): Promise<{ lob: LobData; txSignature: string; socialPost?: SocialPostResult }> {
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

    // Auto-post to social platforms
    let socialPost: SocialPostResult | undefined;
    if (this.social.isAutoPostEnabled && this.social.isConfigured) {
      socialPost = await this.social.postMint(lob).catch(() => undefined);
    }

    return { lob, txSignature: tx, socialPost };
  }

  /** Feed a Lob — burns $LOBS tokens permanently, +20 mood, +10 XP, 1hr cooldown */
  async feedLob(lobAddress: PublicKey): Promise<string> {
    const config = await this.getConfig();
    const ownerTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    return this.program.methods
      .feedLob()
      .accounts({
        owner: this.wallet.publicKey,
        config: this.configPda,
        lob: lobAddress,
        ownerTokenAccount,
        tokenMint: config.tokenMint,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();
  }

  /** Free battle — no wager, just XP and glory. Auto-posts result to MoltBook/MoltX. */
  async battle(myLob: PublicKey, opponentLob: PublicKey): Promise<BattleResult & { socialPost?: SocialPostResult }> {
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
    const result: BattleResult = {
      txSignature: tx,
      challengerWon: after.battlesWon > before.battlesWon,
      challengerLob: myLob,
      defenderLob: opponentLob,
    };

    // Auto-post battle result
    let socialPost: SocialPostResult | undefined;
    if (this.social.isAutoPostEnabled && this.social.isConfigured) {
      const defender = await this.getLob(opponentLob);
      socialPost = await this.social.postBattle(result, after, defender).catch(() => undefined);
    }

    return { ...result, socialPost };
  }

  /** Evolve a Lob to the next stage. Auto-posts evolution event to MoltBook/MoltX. */
  async evolveLob(lobAddress: PublicKey): Promise<{ txSignature: string; socialPost?: SocialPostResult }> {
    const tx = await this.program.methods
      .evolveLob()
      .accounts({
        owner: this.wallet.publicKey,
        lob: lobAddress,
      })
      .rpc();

    // Auto-post evolution
    let socialPost: SocialPostResult | undefined;
    if (this.social.isAutoPostEnabled && this.social.isConfigured) {
      const lob = await this.getLob(lobAddress);
      socialPost = await this.social.postEvolution(lob).catch(() => undefined);
    }

    return { txSignature: tx, socialPost };
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
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.treasuryPda,
      true,
      TOKEN_2022_PROGRAM_ID
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
        tokenMint: config.tokenMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    return { challenge: challengePda, txSignature: tx };
  }

  /**
   * Accept an existing wager challenge. Matches the stake, triggers battle.
   * Winner gets the pot minus 2.5% fee (fee is burned permanently).
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
      this.wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    const challengerTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      challenge.challenger,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      config.tokenMint,
      this.treasuryPda,
      true,
      TOKEN_2022_PROGRAM_ID
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
        tokenMint: config.tokenMint,
        slotHashes: SLOT_HASHES_SYSVAR,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();

    const afterLob = await this.getLob(myLob);
    const defenderWon = afterLob.battlesWon > beforeLob.battlesWon;
    const totalPot = challenge.wager * 2;
    const fee = Math.floor((totalPot * 250) / 10000);

    const wagerResult: WagerResult = {
      txSignature: tx,
      challengerWon: !defenderWon,
      challengerLob: challenge.challengerLob,
      defenderLob: myLob,
      wager: challenge.wager,
      winnings: totalPot - fee,
    };

    // Auto-post wager result
    let socialPost: SocialPostResult | undefined;
    if (this.social.isAutoPostEnabled && this.social.isConfigured) {
      const challengerLob = await this.getLob(challenge.challengerLob);
      socialPost = await this.social.postWager(wagerResult, challengerLob, afterLob).catch(() => undefined);
    }

    return { ...wagerResult, socialPost };
  }

  // ─── Queries ──────────────────────────────────────────────

  /** Fetch a single Lob */
  async getLob(address: PublicKey): Promise<LobData> {
    const a = await (this.program.account as any).lob.fetch(address);
    return {
      address,
      owner: a.owner,
      name: a.name,
      species: a.species as Species,
      xp: a.xp,
      strength: a.strength,
      vitality: a.vitality,
      speed: a.speed,
      luck: a.luck,
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
    const accounts = await (this.program.account as any).lob.all();
    return accounts.map((a: any) => ({
      address: a.publicKey,
      owner: a.account.owner,
      name: a.account.name,
      species: a.account.species as Species,
      xp: a.account.xp,
      strength: a.account.strength,
      vitality: a.account.vitality,
      speed: a.account.speed,
      luck: a.account.luck,
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
    const a = await (this.program.account as any).battleChallenge.fetch(address);
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
    const accounts = await (this.program.account as any).battleChallenge.all();
    return accounts
      .filter((a: any) => a.account.isActive)
      .map((a: any) => ({
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
    const c = await (this.program.account as any).gameConfig.fetch(this.configPda);
    return {
      address: this.configPda,
      authority: c.authority,
      tokenMint: c.tokenMint,
      totalLobsMinted: (c.totalLobsMinted as any as BN).toNumber(),
      totalWagerBattles: (c.totalWagerBattles as any as BN).toNumber(),
      totalTokensWagered: (c.totalTokensWagered as any as BN).toNumber(),
      totalTokensBurned: (c.totalTokensBurned as any as BN).toNumber(),
      bump: c.bump,
      treasuryBump: c.treasuryBump,
    };
  }
}
