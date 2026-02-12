/// Feed cost in lamports (0.001 SOL)
pub const FEED_COST: u64 = 1_000_000;

/// Minimum time between feeds in seconds (1 hour)
pub const FEED_COOLDOWN: i64 = 3600;

/// Mood gained per feed
pub const FEED_MOOD_GAIN: u8 = 20;

/// XP gained per feed
pub const FEED_XP_GAIN: u32 = 10;

/// XP gained by battle winner
pub const BATTLE_WIN_XP: u32 = 50;

/// Mood gained by battle winner
pub const BATTLE_WIN_MOOD: u8 = 10;

/// Mood lost by battle loser
pub const BATTLE_LOSE_MOOD: u8 = 20;

/// Maximum mood value
pub const MAX_MOOD: u8 = 100;

/// Maximum evolution stage
pub const MAX_EVOLUTION: u8 = 3;

/// Number of species
pub const NUM_SPECIES: u8 = 6;

/// Base stat minimum
pub const BASE_STAT_MIN: u8 = 5;

/// Base stat range (max = min + range)
pub const BASE_STAT_RANGE: u8 = 11;

/// Maximum name length in bytes
pub const MAX_NAME_LEN: usize = 32;

/// Evolution XP thresholds
pub const EVOLUTION_THRESHOLDS: [u32; 3] = [100, 500, 2000];

/// Evolution stat multipliers (basis points: 10000 = 1.0x)
pub const EVOLUTION_MULTIPLIERS: [u16; 4] = [10000, 12000, 15000, 20000];

/// Lob account seed
pub const LOB_SEED: &[u8] = b"lob";

/// Game config seed
pub const CONFIG_SEED: &[u8] = b"config";

/// Treasury seed
pub const TREASURY_SEED: &[u8] = b"treasury";
