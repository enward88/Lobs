use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::slot_hashes;

use crate::constants::*;
use crate::errors::LobsError;
use crate::state::{GameConfig, Lob};

#[derive(Accounts)]
pub struct MintLob<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = owner,
        space = 8 + Lob::INIT_SPACE,
        seeds = [LOB_SEED, owner.key().as_ref(), &config.total_lobs_minted.to_le_bytes()],
        bump,
    )]
    pub lob: Account<'info, Lob>,

    /// CHECK: SlotHashes sysvar for pseudo-randomness
    #[account(address = slot_hashes::id())]
    pub slot_hashes: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MintLob>, name: String) -> Result<()> {
    require!(name.len() <= MAX_NAME_LEN, LobsError::NameTooLong);

    let clock = Clock::get()?;
    let slot_hashes_data = ctx.accounts.slot_hashes.try_borrow_data()?;

    // Generate pseudo-random seed from slot hash + owner + timestamp
    let seed = generate_seed(
        &slot_hashes_data,
        &ctx.accounts.owner.key(),
        clock.unix_timestamp,
        ctx.accounts.config.total_lobs_minted,
    );

    // Derive species (0-5)
    let species = (seed[0] % NUM_SPECIES) as u8;

    // Generate base stats with species bonuses
    let (strength, vitality, speed, luck) = generate_stats(species, &seed);

    let lob = &mut ctx.accounts.lob;
    lob.owner = ctx.accounts.owner.key();
    lob.name = name;
    lob.species = species;
    lob.xp = 0;
    lob.strength = strength;
    lob.vitality = vitality;
    lob.speed = speed;
    lob.luck = luck;
    lob.mood = 80; // Start happy
    lob.last_fed = clock.unix_timestamp;
    lob.battles_won = 0;
    lob.battles_lost = 0;
    lob.evolution_stage = 0;
    lob.is_alive = true;
    lob.mint_index = ctx.accounts.config.total_lobs_minted;
    lob.bump = ctx.bumps.lob;

    let config = &mut ctx.accounts.config;
    config.total_lobs_minted = config
        .total_lobs_minted
        .checked_add(1)
        .ok_or(LobsError::Overflow)?;

    msg!(
        "Minted Lob #{}: {} the {} (STR:{} VIT:{} SPD:{} LCK:{})",
        lob.mint_index,
        lob.name,
        lob.species_name(),
        lob.strength,
        lob.vitality,
        lob.speed,
        lob.luck
    );

    Ok(())
}

fn generate_seed(slot_hashes_data: &[u8], owner: &Pubkey, timestamp: i64, index: u64) -> [u8; 32] {
    let mut hasher = [0u8; 32];

    // Mix slot hash data (take a chunk from recent slots)
    let offset = (index as usize * 8) % slot_hashes_data.len().saturating_sub(32).max(1);
    let end = (offset + 32).min(slot_hashes_data.len());
    let len = end - offset;
    hasher[..len].copy_from_slice(&slot_hashes_data[offset..end]);

    // XOR with owner pubkey
    let owner_bytes = owner.to_bytes();
    for i in 0..32 {
        hasher[i] ^= owner_bytes[i];
    }

    // Mix in timestamp
    let ts_bytes = timestamp.to_le_bytes();
    for i in 0..8 {
        hasher[i] ^= ts_bytes[i];
    }

    // Mix in index
    let idx_bytes = index.to_le_bytes();
    for i in 0..8 {
        hasher[i + 8] ^= idx_bytes[i];
    }

    hasher
}

fn generate_stats(species: u8, seed: &[u8; 32]) -> (u8, u8, u8, u8) {
    // Base random stats in range [BASE_STAT_MIN, BASE_STAT_MIN + BASE_STAT_RANGE)
    let raw_str = BASE_STAT_MIN + (seed[1] % BASE_STAT_RANGE);
    let raw_vit = BASE_STAT_MIN + (seed[2] % BASE_STAT_RANGE);
    let raw_spd = BASE_STAT_MIN + (seed[3] % BASE_STAT_RANGE);
    let raw_lck = BASE_STAT_MIN + (seed[4] % BASE_STAT_RANGE);

    // Apply species bonuses from the lookup table
    if (species as usize) < SPECIES_BONUSES.len() {
        let (s_bonus, v_bonus, sp_bonus, l_bonus) = SPECIES_BONUSES[species as usize];
        let strength = apply_bonus(raw_str, s_bonus);
        let vitality = apply_bonus(raw_vit, v_bonus);
        let speed = apply_bonus(raw_spd, sp_bonus);
        let luck = apply_bonus(raw_lck, l_bonus);
        (strength, vitality, speed, luck)
    } else {
        (raw_str, raw_vit, raw_spd, raw_lck)
    }
}

fn apply_bonus(base: u8, bonus: i8) -> u8 {
    if bonus >= 0 {
        base.saturating_add(bonus as u8)
    } else {
        base.saturating_sub(bonus.unsigned_abs())
    }
}
