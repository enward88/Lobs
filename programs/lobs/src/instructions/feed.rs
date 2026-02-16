use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Burn, Mint, TokenAccount, TokenInterface};

use crate::constants::*;
use crate::errors::LobsError;
use crate::state::{GameConfig, Lob};

#[derive(Accounts)]
pub struct FeedLob<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
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

    /// Owner's $LOBS token account (tokens are burned from here)
    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key(),
        constraint = owner_token_account.mint == config.token_mint,
    )]
    pub owner_token_account: InterfaceAccount<'info, TokenAccount>,

    /// $LOBS token mint (required for burn)
    #[account(
        mut,
        constraint = token_mint.key() == config.token_mint,
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
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

    // Burn $LOBS tokens permanently — reduces total supply
    token_interface::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                from: ctx.accounts.owner_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        FEED_COST,
    )?;

    // Track burned tokens
    let config = &mut ctx.accounts.config;
    config.total_tokens_burned = config
        .total_tokens_burned
        .checked_add(FEED_COST)
        .ok_or(LobsError::Overflow)?;

    // Update lob stats
    lob.mood = lob.mood.saturating_add(FEED_MOOD_GAIN).min(MAX_MOOD);
    lob.xp = lob.xp.checked_add(FEED_XP_GAIN).ok_or(LobsError::Overflow)?;
    lob.last_fed = clock.unix_timestamp;

    msg!(
        "Fed {}! Mood: {}, XP: {} (burned {} $LOBS)",
        lob.name,
        lob.mood,
        lob.xp,
        FEED_COST
    );

    Ok(())
}
