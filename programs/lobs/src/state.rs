use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
#[derive(InitSpace)]
pub struct GameConfig {
    /// Authority who initialized the game
    pub authority: Pubkey,
    /// Total lobs minted across all players
    pub total_lobs_minted: u64,
    /// Bump seed for PDA
    pub bump: u8,
    /// Treasury bump seed
    pub treasury_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Lob {
    /// Owner wallet address
    pub owner: Pubkey,
    /// Lob name
    #[max_len(32)]
    pub name: String,
    /// Species type (0-5)
    pub species: u8,
    /// Current XP
    pub xp: u32,
    /// Base strength stat
    pub strength: u8,
    /// Base vitality stat
    pub vitality: u8,
    /// Base speed stat
    pub speed: u8,
    /// Current mood (0-100)
    pub mood: u8,
    /// Last fed timestamp
    pub last_fed: i64,
    /// Total battles won
    pub battles_won: u32,
    /// Total battles lost
    pub battles_lost: u32,
    /// Evolution stage (0-3)
    pub evolution_stage: u8,
    /// Whether the lob is alive
    pub is_alive: bool,
    /// Mint index for this owner (used in PDA derivation)
    pub mint_index: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl Lob {
    /// Calculate effective stat with evolution multiplier and mood modifier
    pub fn effective_strength(&self) -> u64 {
        let multiplier = EVOLUTION_MULTIPLIERS[self.evolution_stage as usize] as u64;
        let base = self.strength as u64;
        let mood_factor = self.mood as u64;
        // (base * multiplier * mood) / (10000 * 100)
        base.checked_mul(multiplier)
            .and_then(|v| v.checked_mul(mood_factor))
            .map(|v| v / 1_000_000)
            .unwrap_or(0)
    }

    /// Calculate effective vitality (HP) with evolution multiplier
    pub fn effective_vitality(&self) -> u64 {
        let multiplier = EVOLUTION_MULTIPLIERS[self.evolution_stage as usize] as u64;
        let base = self.vitality as u64;
        // (base * multiplier) / 10000
        // Scale up by 10 for more granular HP
        base.checked_mul(multiplier)
            .map(|v| v * 10 / 10000)
            .unwrap_or(0)
    }

    /// Calculate effective speed with evolution multiplier
    pub fn effective_speed(&self) -> u64 {
        let multiplier = EVOLUTION_MULTIPLIERS[self.evolution_stage as usize] as u64;
        let base = self.speed as u64;
        base.checked_mul(multiplier)
            .map(|v| v / 10000)
            .unwrap_or(0)
    }

    /// Get current evolution level name
    pub fn stage_name(&self) -> &str {
        match self.evolution_stage {
            0 => "Larva",
            1 => "Juvenile",
            2 => "Adult",
            3 => "Elder",
            _ => "Unknown",
        }
    }

    /// Get species name
    pub fn species_name(&self) -> &str {
        match self.species {
            0 => "Snapclaw",
            1 => "Shellback",
            2 => "Reefling",
            3 => "Tidecrawler",
            4 => "Deepmaw",
            5 => "Driftbloom",
            _ => "Unknown",
        }
    }
}
