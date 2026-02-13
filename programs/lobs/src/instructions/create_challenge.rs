use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::constants::*;
use crate::errors::LobsError;
use crate::state::{BattleChallenge, GameConfig, Lob};

#[derive(Accounts)]
pub struct CreateChallenge<'info> {
    #[account(mut)]
    pub challenger: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, GameConfig>,

    #[account(
        constraint = challenger_lob.owner == challenger.key(),
        constraint = challenger_lob.is_alive @ LobsError::LobDead,
    )]
    pub challenger_lob: Account<'info, Lob>,

    #[account(
        init,
        payer = challenger,
        space = 8 + BattleChallenge::INIT_SPACE,
        seeds = [CHALLENGE_SEED, challenger_lob.key().as_ref()],
        bump,
    )]
    pub challenge: Account<'info, BattleChallenge>,

    /// CHECK: Treasury PDA that holds the wager escrow
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = config.treasury_bump,
    )]
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateChallenge>,
    wager: u64,
    defender_lob: Option<Pubkey>,
) -> Result<()> {
    require!(wager >= MIN_WAGER, LobsError::WagerTooLow);
    require!(wager <= MAX_WAGER, LobsError::WagerTooHigh);

    // Transfer wager to treasury as escrow
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.challenger.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        ),
        wager,
    )?;

    let clock = Clock::get()?;
    let challenge = &mut ctx.accounts.challenge;
    challenge.challenger = ctx.accounts.challenger.key();
    challenge.challenger_lob = ctx.accounts.challenger_lob.key();
    challenge.defender_lob = defender_lob.unwrap_or_default();
    challenge.wager = wager;
    challenge.created_at = clock.unix_timestamp;
    challenge.is_active = true;
    challenge.bump = ctx.bumps.challenge;

    msg!(
        "Challenge created: {} wagered {} lamports",
        ctx.accounts.challenger_lob.name,
        wager
    );

    Ok(())
}
