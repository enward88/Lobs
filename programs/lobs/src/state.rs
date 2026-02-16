use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
#[derive(InitSpace)]
pub struct GameConfig {
    /// Authority who initialized the game
    pub authority: Pubkey,
    /// $LOBS SPL token mint address (from Pump.fun)
    pub token_mint: Pubkey,
    /// Total lobs minted across all players
    pub total_lobs_minted: u64,
    /// Total wager battles completed
    pub total_wager_battles: u64,
    /// Total $LOBS wagered (token smallest units)
    pub total_tokens_wagered: u64,
    /// Total $LOBS permanently burned (feeds + wager fees)
    pub total_tokens_burned: u64,
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
    /// Species type (0-29)
    pub species: u8,
    /// Current XP
    pub xp: u32,
    /// Base strength stat
    pub strength: u8,
    /// Base vitality stat
    pub vitality: u8,
    /// Base speed stat
    pub speed: u8,
    /// Base luck stat (affects crit chance and dodge chance)
    pub luck: u8,
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
    /// Total $LOBS tokens won from wagers
    pub tokens_won: u64,
    /// Total $LOBS tokens lost from wagers
    pub tokens_lost: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

/// A pending wager battle challenge. Challenger stakes $LOBS tokens,
/// defender accepts to match and trigger the fight.
#[account]
#[derive(InitSpace)]
pub struct BattleChallenge {
    /// Who issued the challenge
    pub challenger: Pubkey,
    /// The challenger's lob
    pub challenger_lob: Pubkey,
    /// The target defender's lob (or Pubkey::default for open challenge)
    pub defender_lob: Pubkey,
    /// Wager amount in token smallest units (each side puts up this amount)
    pub wager: u64,
    /// When the challenge was created
    pub created_at: i64,
    /// Whether the challenge is still active
    pub is_active: bool,
    /// Bump seed
    pub bump: u8,
}

impl Lob {
    pub fn effective_strength(&self) -> u64 {
        let multiplier = EVOLUTION_MULTIPLIERS[self.evolution_stage as usize] as u64;
        let base = self.strength as u64;
        let mood_factor = self.mood as u64;
        base.checked_mul(multiplier)
            .and_then(|v| v.checked_mul(mood_factor))
            .map(|v| v / 1_000_000)
            .unwrap_or(0)
    }

    pub fn effective_vitality(&self) -> u64 {
        let multiplier = EVOLUTION_MULTIPLIERS[self.evolution_stage as usize] as u64;
        let base = self.vitality as u64;
        base.checked_mul(multiplier)
            .map(|v| v * 10 / 10000)
            .unwrap_or(0)
    }

    pub fn effective_speed(&self) -> u64 {
        let multiplier = EVOLUTION_MULTIPLIERS[self.evolution_stage as usize] as u64;
        let base = self.speed as u64;
        base.checked_mul(multiplier)
            .map(|v| v / 10000)
            .unwrap_or(0)
    }

    pub fn effective_luck(&self) -> u64 {
        let multiplier = EVOLUTION_MULTIPLIERS[self.evolution_stage as usize] as u64;
        let base = self.luck as u64;
        base.checked_mul(multiplier)
            .map(|v| v / 10000)
            .unwrap_or(0)
    }

    pub fn stage_name(&self) -> &str {
        match self.evolution_stage {
            0 => "Larva",
            1 => "Juvenile",
            2 => "Adult",
            3 => "Elder",
            _ => "Unknown",
        }
    }

    pub fn species_name(&self) -> &str {
        match self.species {
            0 => "Snapclaw", 1 => "Tidecrawler", 2 => "Ironpincer",
            3 => "Razorshrimp", 4 => "Boulderclaw",
            5 => "Inkshade", 6 => "Coilshell", 7 => "Pearlmouth",
            8 => "Spiralhorn", 9 => "Venomcone",
            10 => "Driftbloom", 11 => "Stormbell", 12 => "Ghostveil",
            13 => "Warbloom", 14 => "Moonpulse",
            15 => "Deepmaw", 16 => "Flashfin", 17 => "Gulpjaw",
            18 => "Mirrorfin", 19 => "Stonescale",
            20 => "Reefling", 21 => "Thorncoil", 22 => "Bloomsire",
            23 => "Tendrilwrap", 24 => "Sporeling",
            25 => "Voidmaw", 26 => "Pressureking", 27 => "Darkdrifter",
            28 => "Abysswatcher", 29 => "Depthcrown",
            _ => "Unknown",
        }
    }

    pub fn family_name(&self) -> &str {
        match self.species {
            0..=4 => "Crustacean",
            5..=9 => "Mollusk",
            10..=14 => "Jellyfish",
            15..=19 => "Fish",
            20..=24 => "Flora",
            25..=29 => "Abyssal",
            _ => "Unknown",
        }
    }
}
