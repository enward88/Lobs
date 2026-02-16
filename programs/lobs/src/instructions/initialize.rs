use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;

use crate::constants::*;
use crate::state::GameConfig;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The $LOBS token mint (from Pump.fun — Token-2022)
    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = 8 + GameConfig::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Account<'info, GameConfig>,

    /// CHECK: Treasury PDA — authority over the treasury token account
    #[account(
        seeds = [TREASURY_SEED],
        bump,
    )]
    pub treasury: AccountInfo<'info>,

    /// Treasury's associated token account for $LOBS
    #[account(
        init,
        payer = authority,
        associated_token::mint = token_mint,
        associated_token::authority = treasury,
        associated_token::token_program = token_program,
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.authority = ctx.accounts.authority.key();
    config.token_mint = ctx.accounts.token_mint.key();
    config.total_lobs_minted = 0;
    config.total_wager_battles = 0;
    config.total_tokens_wagered = 0;
    config.bump = ctx.bumps.config;
    config.treasury_bump = ctx.bumps.treasury;

    msg!(
        "Lobs game initialized! Token mint: {}",
        ctx.accounts.token_mint.key()
    );
    Ok(())
}
