# 🦞 Lobs

**On-chain pet collection game on Solana.** Mint, raise, and battle deep-sea creatures.

## What are Lobs?

Lobs are unique deep-sea creatures that live on the Solana blockchain. Each Lob has randomized species, stats, and personality. Feed them to keep them happy, train them through battles, and evolve them into powerful forms.

### Species

| Species | Type | Bonus |
|---------|------|-------|
| 🦞 Snapclaw | Aggressive crustacean | +STR |
| 🐢 Shellback | Armored turtle | +VIT |
| 🪸 Reefling | Coral symbiote | Balanced |
| 🦀 Tidecrawler | Swift crab | +SPD |
| 🐡 Deepmaw | Abyssal predator | +STR, -SPD |
| 🪼 Driftbloom | Ethereal jellyfish | +SPD, -VIT |

### Evolution

Lobs evolve through 4 stages as they gain experience:

| Stage | XP Required | Power |
|-------|-------------|-------|
| Larva | 0 | 1.0x |
| Juvenile | 100 | 1.2x |
| Adult | 500 | 1.5x |
| Elder | 2,000 | 2.0x |

### Game Loop

1. **Mint** — Create a Lob with random species and stats (~0.005 SOL rent)
2. **Feed** — Costs 0.001 SOL. +20 mood, +10 XP. 1-hour cooldown.
3. **Battle** — Challenge other Lobs. Winner gets +50 XP, loser loses mood.
4. **Evolve** — When XP threshold is met, ascend to the next stage.

## Architecture

```
├── programs/lobs/     # Solana program (Anchor/Rust)
├── sdk/               # TypeScript SDK
├── app/               # Web dashboard (React + Vite)
└── tests/             # Integration tests
```

## Quick Start

### Prerequisites

- Rust & Cargo
- Solana CLI (v1.18+)
- Anchor CLI (v0.30+)
- Node.js (v18+)

### Build

```bash
# Install dependencies
npm install

# Build the Solana program
anchor build

# Run tests (devnet)
anchor test

# Build the SDK
cd sdk && npm run build

# Start the dashboard
cd app && npm run dev
```

### Deploy

```bash
# Deploy to devnet
solana config set --url devnet
anchor deploy

# Deploy to mainnet
solana config set --url mainnet-beta
anchor deploy --provider.cluster mainnet
```

After deploying, update the program ID in:
- `Anchor.toml`
- `programs/lobs/src/lib.rs` (the `declare_id!` macro)
- `app/src/lib/program.ts` (the `PROGRAM_ID` constant)

### Initialize

After first deploy, initialize the game:

```bash
# Using the Anchor CLI or the SDK:
npx ts-node -e "
const { LobsClient } = require('./sdk');
// ... initialize with your wallet
"
```

## SDK Usage

```typescript
import { LobsClient, formatLob } from "@lobs/sdk";
import { Connection, PublicKey } from "@solana/web3.js";

const client = new LobsClient(connection, wallet, programId, idl);

// Mint a new Lob
const { lob } = await client.mintLob("Crusher");
console.log(formatLob(lob));

// Feed your Lob
await client.feedLob(lob.address);

// Battle another Lob
const result = await client.battle(myLob.address, opponentLob.address);
console.log(result.challengerWon ? "Victory!" : "Defeat...");

// Evolve when ready
await client.evolveLob(lob.address);

// View all Lobs
const allLobs = await client.getAllLobs();
```

## Game Mechanics

### Battle Resolution

Battles are resolved entirely on-chain:
- Speed determines attack order
- Effective STR = base STR × evolution multiplier × (mood/100)
- Effective VIT = base VIT × evolution multiplier
- Rounds continue until one Lob's HP reaches 0
- Tiebreaker uses slot hash for randomness

### Mood

Mood affects battle performance and decays when Lobs aren't cared for.
- Starts at 80
- Feed to increase by 20 (max 100)
- Losing battles decreases by 20
- Winning battles increases by 10

### Fees

- Minting: ~0.005 SOL (rent-exempt minimum)
- Feeding: 0.001 SOL per feed
- Battling: Free
- Evolving: Free

## License

MIT
