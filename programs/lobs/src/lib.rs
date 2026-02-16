use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("GDjye2re8UKJFaDf6ez45vjSyqWvBLffeRNTfgi3fpfL");

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

    /// Feed a Lob to increase mood and XP. Costs $LOBS tokens.
    pub fn feed_lob(ctx: Context<FeedLob>) -> Result<()> {
        instructions::feed::handler(ctx)
    }

    /// Battle another agent's Lob. Free, no wager.
    pub fn battle(ctx: Context<Battle>) -> Result<()> {
        instructions::battle::handler(ctx)
    }

    /// Evolve a Lob to the next stage when XP threshold is met.
    pub fn evolve_lob(ctx: Context<EvolveLob>) -> Result<()> {
        instructions::evolve::handler(ctx)
    }

    /// Create a wager battle challenge. Stakes $LOBS tokens in escrow.
    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        wager: u64,
        defender_lob: Option<Pubkey>,
    ) -> Result<()> {
        instructions::create_challenge::handler(ctx, wager, defender_lob)
    }

    /// Accept a wager challenge. Matches the stake, resolves battle, pays winner.
    pub fn accept_challenge(ctx: Context<AcceptChallenge>) -> Result<()> {
        instructions::accept_challenge::handler(ctx)
    }
}
