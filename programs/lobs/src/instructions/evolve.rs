use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::LobsError;
use crate::state::Lob;

#[derive(Accounts)]
pub struct EvolveLob<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        constraint = lob.owner == owner.key(),
        constraint = lob.is_alive @ LobsError::LobDead,
    )]
    pub lob: Account<'info, Lob>,
}

pub fn handler(ctx: Context<EvolveLob>) -> Result<()> {
    let lob = &mut ctx.accounts.lob;

    require!(
        lob.evolution_stage < MAX_EVOLUTION,
        LobsError::AlreadyMaxEvolution
    );

    let threshold = EVOLUTION_THRESHOLDS[lob.evolution_stage as usize];
    require!(lob.xp >= threshold, LobsError::InsufficientXp);

    lob.evolution_stage += 1;

    msg!(
        "{} evolved to {} (stage {})!",
        lob.name,
        lob.stage_name(),
        lob.evolution_stage
    );

    Ok(())
}
