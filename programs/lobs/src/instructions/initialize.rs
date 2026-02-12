use anchor_lang::prelude::*;

use crate::constants::*;
use crate::state::GameConfig;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + GameConfig::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Account<'info, GameConfig>,

    /// CHECK: Treasury PDA, just holds SOL
    #[account(
        seeds = [TREASURY_SEED],
        bump,
    )]
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.authority = ctx.accounts.authority.key();
    config.total_lobs_minted = 0;
    config.bump = ctx.bumps.config;
    config.treasury_bump = ctx.bumps.treasury;

    msg!("Lobs game initialized!");
    Ok(())
}
