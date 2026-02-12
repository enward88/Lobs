use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::constants::*;
use crate::errors::LobsError;
use crate::state::{GameConfig, Lob};

#[derive(Accounts)]
pub struct FeedLob<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, GameConfig>,

    #[account(
        mut,
        constraint = lob.owner == owner.key(),
        constraint = lob.is_alive @ LobsError::LobDead,
    )]
    pub lob: Account<'info, Lob>,

    /// CHECK: Treasury PDA that receives feed fees
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = config.treasury_bump,
    )]
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<FeedLob>) -> Result<()> {
    let clock = Clock::get()?;
    let lob = &mut ctx.accounts.lob;

    // Check cooldown
    let elapsed = clock
        .unix_timestamp
        .checked_sub(lob.last_fed)
        .ok_or(LobsError::Overflow)?;
    require!(elapsed >= FEED_COOLDOWN, LobsError::FeedCooldown);

    // Transfer feed cost to treasury
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        ),
        FEED_COST,
    )?;

    // Update lob stats
    lob.mood = lob.mood.saturating_add(FEED_MOOD_GAIN).min(MAX_MOOD);
    lob.xp = lob.xp.checked_add(FEED_XP_GAIN).ok_or(LobsError::Overflow)?;
    lob.last_fed = clock.unix_timestamp;

    msg!(
        "Fed {}! Mood: {}, XP: {}",
        lob.name,
        lob.mood,
        lob.xp
    );

    Ok(())
}
