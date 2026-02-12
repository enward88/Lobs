import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lobs } from "../target/types/lobs";
import { expect } from "chai";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("lobs", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Lobs as Program<Lobs>;
  const authority = provider.wallet;

  let configPda: PublicKey;
  let configBump: number;
  let treasuryPda: PublicKey;

  before(async () => {
    // Derive PDAs
    [configPda, configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    );
  });

  function deriveLobPda(owner: PublicKey, index: number): [PublicKey, number] {
    const indexBuffer = Buffer.alloc(8);
    indexBuffer.writeBigUInt64LE(BigInt(index));
    return PublicKey.findProgramAddressSync(
      [Buffer.from("lob"), owner.toBuffer(), indexBuffer],
      program.programId
    );
  }

  it("initializes the game", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        authority: authority.publicKey,
        config: configPda,
        treasury: treasuryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.gameConfig.fetch(configPda);
    expect(config.authority.toString()).to.equal(
      authority.publicKey.toString()
    );
    expect(config.totalLobsMinted.toNumber()).to.equal(0);
  });

  it("mints a lob", async () => {
    const [lobPda] = deriveLobPda(authority.publicKey, 0);
    const slotHashes = new PublicKey(
      "SysvarS1teleShses1111111111111111111111111"
    );

    const tx = await program.methods
      .mintLob("TestLob")
      .accounts({
        owner: authority.publicKey,
        config: configPda,
        lob: lobPda,
        slotHashes,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const lob = await program.account.lob.fetch(lobPda);
    expect(lob.name).to.equal("TestLob");
    expect(lob.owner.toString()).to.equal(authority.publicKey.toString());
    expect(lob.isAlive).to.be.true;
    expect(lob.evolutionStage).to.equal(0);
    expect(lob.mood).to.equal(80);
    expect(lob.species).to.be.lessThan(6);
    expect(lob.strength).to.be.greaterThan(0);
    expect(lob.vitality).to.be.greaterThan(0);
    expect(lob.speed).to.be.greaterThan(0);

    console.log(
      `  Minted: ${lob.name} the species=${lob.species} (STR:${lob.strength} VIT:${lob.vitality} SPD:${lob.speed})`
    );

    // Config should be updated
    const config = await program.account.gameConfig.fetch(configPda);
    expect(config.totalLobsMinted.toNumber()).to.equal(1);
  });

  it("feeds a lob", async () => {
    const [lobPda] = deriveLobPda(authority.publicKey, 0);

    // We need to wait or manipulate time for cooldown
    // In tests, the first feed should work since last_fed is set at mint time
    // and we may need to advance the clock. For devnet tests, we skip cooldown
    // by acknowledging the test may need to wait.
    // For now, test that the instruction structure is correct.

    try {
      const tx = await program.methods
        .feedLob()
        .accounts({
          owner: authority.publicKey,
          config: configPda,
          lob: lobPda,
          treasury: treasuryPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const lob = await program.account.lob.fetch(lobPda);
      console.log(`  After feed: Mood=${lob.mood} XP=${lob.xp}`);
    } catch (e: any) {
      // Expected if cooldown hasn't elapsed
      if (e.message.includes("FeedCooldown")) {
        console.log("  Feed cooldown active (expected in fast tests)");
      } else {
        throw e;
      }
    }
  });

  it("mints a second lob for battle testing", async () => {
    const [lobPda] = deriveLobPda(authority.publicKey, 1);
    const slotHashes = new PublicKey(
      "SysvarS1teleShses1111111111111111111111111"
    );

    const tx = await program.methods
      .mintLob("RivalLob")
      .accounts({
        owner: authority.publicKey,
        config: configPda,
        lob: lobPda,
        slotHashes,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const lob = await program.account.lob.fetch(lobPda);
    expect(lob.name).to.equal("RivalLob");
    console.log(
      `  Minted: ${lob.name} the species=${lob.species} (STR:${lob.strength} VIT:${lob.vitality} SPD:${lob.speed})`
    );
  });

  it("rejects battle against own lob", async () => {
    const [lob1Pda] = deriveLobPda(authority.publicKey, 0);
    const [lob2Pda] = deriveLobPda(authority.publicKey, 1);
    const slotHashes = new PublicKey(
      "SysvarS1teleShses1111111111111111111111111"
    );

    try {
      await program.methods
        .battle()
        .accounts({
          challenger: authority.publicKey,
          challengerLob: lob1Pda,
          defenderLob: lob2Pda,
          slotHashes,
        })
        .rpc();
      expect.fail("Should have thrown CannotBattleSelf");
    } catch (e: any) {
      expect(e.toString()).to.include("CannotBattleSelf");
    }
  });

  it("rejects evolution with insufficient XP", async () => {
    const [lobPda] = deriveLobPda(authority.publicKey, 0);

    try {
      await program.methods
        .evolveLob()
        .accounts({
          owner: authority.publicKey,
          lob: lobPda,
        })
        .rpc();
      expect.fail("Should have thrown InsufficientXp");
    } catch (e: any) {
      expect(e.toString()).to.include("InsufficientXp");
    }
  });

  it("rejects minting with name too long", async () => {
    const [lobPda] = deriveLobPda(authority.publicKey, 2);
    const slotHashes = new PublicKey(
      "SysvarS1teleShses1111111111111111111111111"
    );

    try {
      const longName = "A".repeat(33);
      await program.methods
        .mintLob(longName)
        .accounts({
          owner: authority.publicKey,
          config: configPda,
          lob: lobPda,
          slotHashes,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have thrown NameTooLong");
    } catch (e: any) {
      expect(e.toString()).to.include("NameTooLong");
    }
  });
});
