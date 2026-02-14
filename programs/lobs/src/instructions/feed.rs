use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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

    /// Owner's $LOBS token account (source of feed payment)
    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key(),
        constraint = owner_token_account.mint == config.token_mint,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    /// Treasury's $LOBS token account (receives feed fees)
    #[account(
        mut,
        constraint = treasury_token_account.mint == config.token_mint,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
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

    // Transfer $LOBS tokens to treasury
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.owner_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        FEED_COST,
    )?;

    // Update lob stats
    lob.mood = lob.mood.saturating_add(FEED_MOOD_GAIN).min(MAX_MOOD);
    lob.xp = lob.xp.checked_add(FEED_XP_GAIN).ok_or(LobsError::Overflow)?;
    lob.last_fed = clock.unix_timestamp;

    msg!(
        "Fed {}! Mood: {}, XP: {} (cost: {} $LOBS)",
        lob.name,
        lob.mood,
        lob.xp,
        FEED_COST
    );

    Ok(())
}
