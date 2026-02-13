use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::slot_hashes;
use anchor_lang::system_program;

use crate::constants::*;
use crate::errors::LobsError;
use crate::state::{BattleChallenge, GameConfig, Lob};

#[derive(Accounts)]
pub struct AcceptChallenge<'info> {
    #[account(mut)]
    pub defender: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, GameConfig>,

    #[account(
        mut,
        constraint = challenge.is_active @ LobsError::ChallengeInactive,
    )]
    pub challenge: Account<'info, BattleChallenge>,

    #[account(
        mut,
        constraint = challenger_lob.key() == challenge.challenger_lob,
        constraint = challenger_lob.is_alive @ LobsError::LobDead,
    )]
    pub challenger_lob: Account<'info, Lob>,

    #[account(
        mut,
        constraint = defender_lob.owner == defender.key(),
        constraint = defender_lob.is_alive @ LobsError::LobDead,
        constraint = defender_lob.owner != challenge.challenger @ LobsError::CannotBattleSelf,
    )]
    pub defender_lob: Account<'info, Lob>,

    /// CHECK: Treasury PDA
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump = config.treasury_bump,
    )]
    pub treasury: AccountInfo<'info>,

    /// CHECK: Challenger wallet to receive winnings
    #[account(
        mut,
        constraint = challenger_wallet.key() == challenge.challenger,
    )]
    pub challenger_wallet: AccountInfo<'info>,

    /// CHECK: SlotHashes sysvar for tiebreaker
    #[account(address = slot_hashes::id())]
    pub slot_hashes: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AcceptChallenge>) -> Result<()> {
    let challenge = &ctx.accounts.challenge;

    // If challenge targeted a specific defender, verify it
    if challenge.defender_lob != Pubkey::default() {
        require!(
            ctx.accounts.defender_lob.key() == challenge.defender_lob,
            LobsError::WrongDefender
        );
    }

    let wager = challenge.wager;

    // Defender matches the wager -> treasury
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.defender.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            },
        ),
        wager,
    )?;

    // === Resolve battle (same logic as free battle) ===
    let clock = Clock::get()?;
    let slot_hashes_data = ctx.accounts.slot_hashes.try_borrow_data()?;

    let c_str = ctx.accounts.challenger_lob.effective_strength();
    let c_vit = ctx.accounts.challenger_lob.effective_vitality();
    let c_spd = ctx.accounts.challenger_lob.effective_speed();

    let d_str = ctx.accounts.defender_lob.effective_strength();
    let d_vit = ctx.accounts.defender_lob.effective_vitality();
    let d_spd = ctx.accounts.defender_lob.effective_speed();

    let mut c_hp = c_vit;
    let mut d_hp = d_vit;
    let c_damage = c_str.max(1);
    let d_damage = d_str.max(1);

    for _ in 0..100 {
        if c_spd >= d_spd {
            d_hp = d_hp.saturating_sub(c_damage);
            if d_hp == 0 { break; }
            c_hp = c_hp.saturating_sub(d_damage);
            if c_hp == 0 { break; }
        } else {
            c_hp = c_hp.saturating_sub(d_damage);
            if c_hp == 0 { break; }
            d_hp = d_hp.saturating_sub(c_damage);
            if d_hp == 0 { break; }
        }
    }

    let challenger_wins = if c_hp > 0 && d_hp > 0 {
        let tb = slot_hashes_data
            .get((clock.unix_timestamp as usize) % slot_hashes_data.len().max(1))
            .copied()
            .unwrap_or(0);
        tb % 2 == 0
    } else {
        c_hp > 0
    };

    drop(slot_hashes_data);

    // === Distribute wager ===
    let total_pot = wager.checked_mul(2).ok_or(LobsError::Overflow)?;
    let fee = total_pot
        .checked_mul(WAGER_FEE_BPS)
        .ok_or(LobsError::Overflow)?
        / 10000;
    let winnings = total_pot.checked_sub(fee).ok_or(LobsError::Overflow)?;

    // Pay winner from treasury PDA
    let treasury_bump = ctx.accounts.config.treasury_bump;
    let treasury_seeds: &[&[u8]] = &[TREASURY_SEED, &[treasury_bump]];

    if challenger_wins {
        // Pay challenger
        **ctx.accounts.treasury.try_borrow_mut_lamports()? -= winnings;
        **ctx.accounts.challenger_wallet.try_borrow_mut_lamports()? += winnings;
    } else {
        // Pay defender
        **ctx.accounts.treasury.try_borrow_mut_lamports()? -= winnings;
        **ctx.accounts.defender.try_borrow_mut_lamports()? += winnings;
    }

    // === Update lob stats ===
    let challenger_lob = &mut ctx.accounts.challenger_lob;
    let defender_lob = &mut ctx.accounts.defender_lob;

    if challenger_wins {
        challenger_lob.xp = challenger_lob.xp.checked_add(BATTLE_WIN_XP).ok_or(LobsError::Overflow)?;
        challenger_lob.mood = challenger_lob.mood.saturating_add(BATTLE_WIN_MOOD).min(MAX_MOOD);
        challenger_lob.battles_won = challenger_lob.battles_won.checked_add(1).ok_or(LobsError::Overflow)?;
        challenger_lob.sol_won = challenger_lob.sol_won.checked_add(winnings).ok_or(LobsError::Overflow)?;

        defender_lob.mood = defender_lob.mood.saturating_sub(BATTLE_LOSE_MOOD);
        defender_lob.battles_lost = defender_lob.battles_lost.checked_add(1).ok_or(LobsError::Overflow)?;
        defender_lob.sol_lost = defender_lob.sol_lost.checked_add(wager).ok_or(LobsError::Overflow)?;

        msg!("Wager battle: {} defeated {}! Won {} lamports", challenger_lob.name, defender_lob.name, winnings);
    } else {
        defender_lob.xp = defender_lob.xp.checked_add(BATTLE_WIN_XP).ok_or(LobsError::Overflow)?;
        defender_lob.mood = defender_lob.mood.saturating_add(BATTLE_WIN_MOOD).min(MAX_MOOD);
        defender_lob.battles_won = defender_lob.battles_won.checked_add(1).ok_or(LobsError::Overflow)?;
        defender_lob.sol_won = defender_lob.sol_won.checked_add(winnings).ok_or(LobsError::Overflow)?;

        challenger_lob.mood = challenger_lob.mood.saturating_sub(BATTLE_LOSE_MOOD);
        challenger_lob.battles_lost = challenger_lob.battles_lost.checked_add(1).ok_or(LobsError::Overflow)?;
        challenger_lob.sol_lost = challenger_lob.sol_lost.checked_add(wager).ok_or(LobsError::Overflow)?;

        msg!("Wager battle: {} defeated {}! Won {} lamports", defender_lob.name, challenger_lob.name, winnings);
    }

    // Update config stats
    let config = &mut ctx.accounts.config;
    config.total_wager_battles = config.total_wager_battles.checked_add(1).ok_or(LobsError::Overflow)?;
    config.total_sol_wagered = config.total_sol_wagered.checked_add(total_pot).ok_or(LobsError::Overflow)?;

    // Deactivate challenge
    let challenge = &mut ctx.accounts.challenge;
    challenge.is_active = false;

    Ok(())
}
