use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::slot_hashes;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

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

    /// CHECK: Treasury PDA — signer for token transfers and burns
    #[account(
        seeds = [TREASURY_SEED],
        bump = config.treasury_bump,
    )]
    pub treasury: AccountInfo<'info>,

    /// Treasury's $LOBS token account (holds escrow)
    #[account(
        mut,
        constraint = treasury_token_account.mint == config.token_mint,
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    /// Defender's $LOBS token account (matches wager, receives winnings if winner)
    #[account(
        mut,
        constraint = defender_token_account.owner == defender.key(),
        constraint = defender_token_account.mint == config.token_mint,
    )]
    pub defender_token_account: Account<'info, TokenAccount>,

    /// Challenger's $LOBS token account (receives winnings if winner)
    #[account(
        mut,
        constraint = challenger_token_account.owner == challenge.challenger,
        constraint = challenger_token_account.mint == config.token_mint,
    )]
    pub challenger_token_account: Account<'info, TokenAccount>,

    /// $LOBS token mint (required for burning the arena fee)
    #[account(
        mut,
        constraint = token_mint.key() == config.token_mint,
    )]
    pub token_mint: Account<'info, Mint>,

    /// CHECK: SlotHashes sysvar for tiebreaker
    #[account(address = slot_hashes::id())]
    pub slot_hashes: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
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
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.defender_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.defender.to_account_info(),
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

    // Treasury PDA signs transfers and burns
    let treasury_bump = ctx.accounts.config.treasury_bump;
    let treasury_seeds: &[&[&[u8]]] = &[&[TREASURY_SEED, &[treasury_bump]]];

    let winner_token_account = if challenger_wins {
        ctx.accounts.challenger_token_account.to_account_info()
    } else {
        ctx.accounts.defender_token_account.to_account_info()
    };

    // Transfer winnings to the winner
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.treasury_token_account.to_account_info(),
                to: winner_token_account,
                authority: ctx.accounts.treasury.to_account_info(),
            },
            treasury_seeds,
        ),
        winnings,
    )?;

    // Burn the 2.5% arena fee permanently — reduces total supply
    token::burn(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                from: ctx.accounts.treasury_token_account.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                authority: ctx.accounts.treasury.to_account_info(),
            },
            treasury_seeds,
        ),
        fee,
    )?;

    // === Update lob stats ===
    let challenger_lob = &mut ctx.accounts.challenger_lob;
    let defender_lob = &mut ctx.accounts.defender_lob;

    if challenger_wins {
        challenger_lob.xp = challenger_lob.xp.checked_add(BATTLE_WIN_XP).ok_or(LobsError::Overflow)?;
        challenger_lob.mood = challenger_lob.mood.saturating_add(BATTLE_WIN_MOOD).min(MAX_MOOD);
        challenger_lob.battles_won = challenger_lob.battles_won.checked_add(1).ok_or(LobsError::Overflow)?;
        challenger_lob.tokens_won = challenger_lob.tokens_won.checked_add(winnings).ok_or(LobsError::Overflow)?;

        defender_lob.mood = defender_lob.mood.saturating_sub(BATTLE_LOSE_MOOD);
        defender_lob.battles_lost = defender_lob.battles_lost.checked_add(1).ok_or(LobsError::Overflow)?;
        defender_lob.tokens_lost = defender_lob.tokens_lost.checked_add(wager).ok_or(LobsError::Overflow)?;

        msg!("Wager battle: {} defeated {}! Won {} $LOBS ({} burned)", challenger_lob.name, defender_lob.name, winnings, fee);
    } else {
        defender_lob.xp = defender_lob.xp.checked_add(BATTLE_WIN_XP).ok_or(LobsError::Overflow)?;
        defender_lob.mood = defender_lob.mood.saturating_add(BATTLE_WIN_MOOD).min(MAX_MOOD);
        defender_lob.battles_won = defender_lob.battles_won.checked_add(1).ok_or(LobsError::Overflow)?;
        defender_lob.tokens_won = defender_lob.tokens_won.checked_add(winnings).ok_or(LobsError::Overflow)?;

        challenger_lob.mood = challenger_lob.mood.saturating_sub(BATTLE_LOSE_MOOD);
        challenger_lob.battles_lost = challenger_lob.battles_lost.checked_add(1).ok_or(LobsError::Overflow)?;
        challenger_lob.tokens_lost = challenger_lob.tokens_lost.checked_add(wager).ok_or(LobsError::Overflow)?;

        msg!("Wager battle: {} defeated {}! Won {} $LOBS ({} burned)", defender_lob.name, challenger_lob.name, winnings, fee);
    }

    // Update config stats
    let config = &mut ctx.accounts.config;
    config.total_wager_battles = config.total_wager_battles.checked_add(1).ok_or(LobsError::Overflow)?;
    config.total_tokens_wagered = config.total_tokens_wagered.checked_add(total_pot).ok_or(LobsError::Overflow)?;
    config.total_tokens_burned = config.total_tokens_burned.checked_add(fee).ok_or(LobsError::Overflow)?;

    // Deactivate challenge
    let challenge = &mut ctx.accounts.challenge;
    challenge.is_active = false;

    Ok(())
}
