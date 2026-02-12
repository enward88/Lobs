use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("LoBS1111111111111111111111111111111111111111");

#[program]
pub mod lobs {
    use super::*;

    /// Initialize the game config and treasury. Called once.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    /// Mint a new Lob with random species and stats.
    pub fn mint_lob(ctx: Context<MintLob>, name: String) -> Result<()> {
        instructions::mint::handler(ctx, name)
    }

    /// Feed a Lob to increase mood and XP. Costs 0.001 SOL.
    pub fn feed_lob(ctx: Context<FeedLob>) -> Result<()> {
        instructions::feed::handler(ctx)
    }

    /// Battle another agent's Lob. On-chain deterministic resolution.
    pub fn battle(ctx: Context<Battle>) -> Result<()> {
        instructions::battle::handler(ctx)
    }

    /// Evolve a Lob to the next stage when XP threshold is met.
    pub fn evolve_lob(ctx: Context<EvolveLob>) -> Result<()> {
        instructions::evolve::handler(ctx)
    }
}
