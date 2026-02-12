use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::slot_hashes;

use crate::constants::*;
use crate::errors::LobsError;
use crate::state::Lob;

#[derive(Accounts)]
pub struct Battle<'info> {
    #[account(mut)]
    pub challenger: Signer<'info>,

    #[account(
        mut,
        constraint = challenger_lob.owner == challenger.key(),
        constraint = challenger_lob.is_alive @ LobsError::LobDead,
    )]
    pub challenger_lob: Account<'info, Lob>,

    #[account(
        mut,
        constraint = defender_lob.is_alive @ LobsError::LobDead,
        constraint = defender_lob.owner != challenger.key() @ LobsError::CannotBattleSelf,
    )]
    pub defender_lob: Account<'info, Lob>,

    /// CHECK: SlotHashes sysvar for tiebreaker randomness
    #[account(address = slot_hashes::id())]
    pub slot_hashes: AccountInfo<'info>,
}

pub fn handler(ctx: Context<Battle>) -> Result<()> {
    let clock = Clock::get()?;
    let slot_hashes_data = ctx.accounts.slot_hashes.try_borrow_data()?;

    // Get effective stats for both lobs
    let c_str = ctx.accounts.challenger_lob.effective_strength();
    let c_vit = ctx.accounts.challenger_lob.effective_vitality();
    let c_spd = ctx.accounts.challenger_lob.effective_speed();

    let d_str = ctx.accounts.defender_lob.effective_strength();
    let d_vit = ctx.accounts.defender_lob.effective_vitality();
    let d_spd = ctx.accounts.defender_lob.effective_speed();

    // Determine battle outcome
    // Simulate rounds: faster lob attacks first each round
    let mut c_hp = c_vit;
    let mut d_hp = d_vit;

    // Ensure minimum damage of 1
    let c_damage = c_str.max(1);
    let d_damage = d_str.max(1);

    // Simulate up to 100 rounds to prevent infinite loops
    for _ in 0..100 {
        if c_spd >= d_spd {
            // Challenger attacks first
            d_hp = d_hp.saturating_sub(c_damage);
            if d_hp == 0 {
                break;
            }
            c_hp = c_hp.saturating_sub(d_damage);
            if c_hp == 0 {
                break;
            }
        } else {
            // Defender attacks first
            c_hp = c_hp.saturating_sub(d_damage);
            if c_hp == 0 {
                break;
            }
            d_hp = d_hp.saturating_sub(c_damage);
            if d_hp == 0 {
                break;
            }
        }
    }

    // Determine winner - if both alive after 100 rounds, use randomness as tiebreaker
    let challenger_wins = if c_hp > 0 && d_hp > 0 {
        // Tiebreaker: pseudo-random from slot hash + timestamp
        let tiebreaker_byte = slot_hashes_data
            .get((clock.unix_timestamp as usize) % slot_hashes_data.len().max(1))
            .copied()
            .unwrap_or(0);
        tiebreaker_byte % 2 == 0
    } else {
        c_hp > 0
    };

    // Drop the borrow before mutable access
    drop(slot_hashes_data);

    // Apply results
    let challenger_lob = &mut ctx.accounts.challenger_lob;
    let defender_lob = &mut ctx.accounts.defender_lob;

    if challenger_wins {
        challenger_lob.xp = challenger_lob
            .xp
            .checked_add(BATTLE_WIN_XP)
            .ok_or(LobsError::Overflow)?;
        challenger_lob.mood = challenger_lob
            .mood
            .saturating_add(BATTLE_WIN_MOOD)
            .min(MAX_MOOD);
        challenger_lob.battles_won = challenger_lob
            .battles_won
            .checked_add(1)
            .ok_or(LobsError::Overflow)?;

        defender_lob.mood = defender_lob.mood.saturating_sub(BATTLE_LOSE_MOOD);
        defender_lob.battles_lost = defender_lob
            .battles_lost
            .checked_add(1)
            .ok_or(LobsError::Overflow)?;

        msg!(
            "Battle: {} defeated {}!",
            challenger_lob.name,
            defender_lob.name
        );
    } else {
        defender_lob.xp = defender_lob
            .xp
            .checked_add(BATTLE_WIN_XP)
            .ok_or(LobsError::Overflow)?;
        defender_lob.mood = defender_lob
            .mood
            .saturating_add(BATTLE_WIN_MOOD)
            .min(MAX_MOOD);
        defender_lob.battles_won = defender_lob
            .battles_won
            .checked_add(1)
            .ok_or(LobsError::Overflow)?;

        challenger_lob.mood = challenger_lob.mood.saturating_sub(BATTLE_LOSE_MOOD);
        challenger_lob.battles_lost = challenger_lob
            .battles_lost
            .checked_add(1)
            .ok_or(LobsError::Overflow)?;

        msg!(
            "Battle: {} defeated {}!",
            defender_lob.name,
            challenger_lob.name
        );
    }

    Ok(())
}
