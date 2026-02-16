use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TokenAccount, TokenInterface, TransferChecked, Mint};

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

    /// Challenger's $LOBS token account (source of wager)
    #[account(
        mut,
        constraint = challenger_token_account.owner == challenger.key(),
        constraint = challenger_token_account.mint == config.token_mint,
    )]
    pub challenger_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Treasury's $LOBS token account (escrow for wager)
    #[account(
        mut,
        constraint = treasury_token_account.mint == config.token_mint,
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

    /// $LOBS token mint (required for transfer_checked)
    #[account(
        constraint = token_mint.key() == config.token_mint,
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(
    ctx: Context<CreateChallenge>,
    wager: u64,
    defender_lob: Option<Pubkey>,
) -> Result<()> {
    require!(wager >= MIN_WAGER, LobsError::WagerTooLow);
    require!(wager <= MAX_WAGER, LobsError::WagerTooHigh);

    // Transfer $LOBS wager to treasury as escrow
    token_interface::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.challenger_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.challenger.to_account_info(),
            },
        ),
        wager,
        TOKEN_DECIMALS,
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
        "Challenge created: {} wagered {} $LOBS tokens",
        ctx.accounts.challenger_lob.name,
        wager
    );

    Ok(())
}
