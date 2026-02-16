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
    let c_lck = ctx.accounts.challenger_lob.effective_luck();

    let d_str = ctx.accounts.defender_lob.effective_strength();
    let d_vit = ctx.accounts.defender_lob.effective_vitality();
    let d_spd = ctx.accounts.defender_lob.effective_speed();
    let d_lck = ctx.accounts.defender_lob.effective_luck();

    // Determine battle outcome
    // Simulate rounds: faster lob attacks first each round
    // Luck adds crit chance (2x damage) and dodge chance (avoid damage)
    let mut c_hp = c_vit;
    let mut d_hp = d_vit;

    // Ensure minimum damage of 1
    let c_damage = c_str.max(1);
    let d_damage = d_str.max(1);

    let data_len = slot_hashes_data.len().max(1);

    // Simulate up to 100 rounds to prevent infinite loops
    for round in 0u64..100 {
        if c_spd >= d_spd {
            // Challenger attacks first
            let actual_damage = resolve_attack(c_damage, c_lck, d_lck, &slot_hashes_data, data_len, round, 0);
            d_hp = d_hp.saturating_sub(actual_damage);
            if d_hp == 0 {
                break;
            }
            // Defender attacks
            let actual_damage = resolve_attack(d_damage, d_lck, c_lck, &slot_hashes_data, data_len, round, 2);
            c_hp = c_hp.saturating_sub(actual_damage);
            if c_hp == 0 {
                break;
            }
        } else {
            // Defender attacks first
            let actual_damage = resolve_attack(d_damage, d_lck, c_lck, &slot_hashes_data, data_len, round, 2);
            c_hp = c_hp.saturating_sub(actual_damage);
            if c_hp == 0 {
                break;
            }
            // Challenger attacks
            let actual_damage = resolve_attack(c_damage, c_lck, d_lck, &slot_hashes_data, data_len, round, 0);
            d_hp = d_hp.saturating_sub(actual_damage);
            if d_hp == 0 {
                break;
            }
        }
    }

    // Determine winner - if both alive after 100 rounds, use randomness as tiebreaker
    let challenger_wins = if c_hp > 0 && d_hp > 0 {
        // Tiebreaker: pseudo-random from slot hash + timestamp
        let tiebreaker_byte = slot_hashes_data
            .get((clock.unix_timestamp as usize) % data_len)
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

/// Resolve a single attack with luck-based crit and dodge.
/// `offset` differentiates attacker/defender bytes within the same round.
fn resolve_attack(
    base_damage: u64,
    attacker_luck: u64,
    defender_luck: u64,
    slot_data: &[u8],
    data_len: usize,
    round: u64,
    offset: u64,
) -> u64 {
    // Dodge check: defender_luck * 4 out of 256 (~1.6% per luck point)
    let dodge_idx = ((round * 4 + offset) as usize) % data_len;
    let dodge_byte = slot_data.get(dodge_idx).copied().unwrap_or(0) as u64;
    if dodge_byte < defender_luck.saturating_mul(4).min(200) {
        return 0; // dodged
    }

    // Crit check: attacker_luck * 5 out of 256 (~2% per luck point)
    let crit_idx = ((round * 4 + offset + 1) as usize) % data_len;
    let crit_byte = slot_data.get(crit_idx).copied().unwrap_or(255) as u64;
    if crit_byte < attacker_luck.saturating_mul(5).min(200) {
        return base_damage.saturating_mul(2); // critical hit
    }

    base_damage
}
