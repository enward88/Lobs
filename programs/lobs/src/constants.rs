/// Token decimals (Pump.fun standard = 6)
pub const TOKEN_DECIMALS: u8 = 6;

/// Feed cost in token smallest units (10,000 $LOBS with 6 decimals)
/// Burned permanently — never enters treasury
pub const FEED_COST: u64 = 10_000_000_000;

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

/// Number of species (6 families x 5 each = 30)
pub const NUM_SPECIES: u8 = 30;

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

/// Minimum wager in token smallest units (100,000 $LOBS)
pub const MIN_WAGER: u64 = 100_000_000_000;

/// Maximum wager in token smallest units (10,000,000 $LOBS)
pub const MAX_WAGER: u64 = 10_000_000_000_000;

/// Wager fee in basis points (2.5% = 250 bps — burned permanently)
pub const WAGER_FEE_BPS: u64 = 250;

/// Lob account seed
pub const LOB_SEED: &[u8] = b"lob";

/// Game config seed
pub const CONFIG_SEED: &[u8] = b"config";

/// Treasury seed
pub const TREASURY_SEED: &[u8] = b"treasury";

/// Challenge seed
pub const CHALLENGE_SEED: &[u8] = b"challenge";

/// Species stat bonuses: (str_bonus, vit_bonus, spd_bonus, luck_bonus) as i8
/// Organized by family:
///   0-4:   Crustaceans  (low luck — brute force)
///   5-9:   Mollusks     (medium luck — sneaky ink escapes)
///   10-14: Jellyfish    (high luck — ethereal, phase through attacks)
///   15-19: Fish         (medium luck — varied)
///   20-24: Coral/Flora  (low luck — rooted)
///   25-29: Abyssal      (medium luck — ancient instinct)
pub const SPECIES_BONUSES: [(i8, i8, i8, i8); 30] = [
    // === Crustaceans ===                    STR VIT SPD LCK
    ( 3,  0,  0, -1), //  0: Snapclaw      — aggressive lobster
    ( 0,  0,  3,  0), //  1: Tidecrawler   — swift crab
    ( 0,  3,  0, -1), //  2: Ironpincer    — armored crab
    ( 2, -1,  2,  1), //  3: Razorshrimp   — glass shrimp
    ( 0,  4, -2, -2), //  4: Boulderclaw   — giant isopod

    // === Mollusks ===
    ( 2,  0,  2,  2), //  5: Inkshade      — octopus (ink dodge)
    ( 0,  3,  0,  1), //  6: Coilshell     — nautilus
    ( 0,  4, -2, -1), //  7: Pearlmouth    — giant clam
    (-1,  2,  1,  2), //  8: Spiralhorn    — sea snail (shell ricochet)
    ( 3, -2,  0,  1), //  9: Venomcone     — cone snail (venom crit)

    // === Jellyfish ===
    (-1,  0,  4,  3), // 10: Driftbloom    — ethereal jelly (phase through)
    ( 3,  0,  0,  1), // 11: Stormbell     — electric jelly
    ( 0, -1,  3,  4), // 12: Ghostveil     — phantom jelly (highest luck)
    ( 2,  2, -1,  0), // 13: Warbloom      — war jelly
    ( 1,  1,  1,  2), // 14: Moonpulse     — moon jelly (lunar fortune)

    // === Fish ===
    ( 4,  0, -2,  0), // 15: Deepmaw       — anglerfish
    ( 0,  0,  3,  2), // 16: Flashfin      — lanternfish (flash crit)
    ( 3,  0, -1,  0), // 17: Gulpjaw       — gulper eel
    (-1,  0,  3,  3), // 18: Mirrorfin     — hatchetfish (mirror dodge)
    ( 0,  3,  0, -1), // 19: Stonescale    — coelacanth

    // === Coral/Flora ===
    ( 1,  1,  1,  0), // 20: Reefling      — coral symbiote
    ( 3,  0, -2, -1), // 21: Thorncoil     — thorny coral
    ( 2,  2, -1,  0), // 22: Bloomsire     — anemone
    (-2,  3,  0,  1), // 23: Tendrilwrap   — kelp creature
    ( 0,  2,  1,  2), // 24: Sporeling     — deep fungus (spore luck)

    // === Abyssal ===
    ( 4,  0, -1,  1), // 25: Voidmaw       — abyssal predator
    ( 0,  2,  2,  1), // 26: Pressureking  — barreleye fish
    ( 0,  4, -1, -1), // 27: Darkdrifter   — sea cucumber
    ( 2,  0,  2,  2), // 28: Abysswatcher  — giant squid (tentacle crit)
    ( 3,  1,  0,  1), // 29: Depthcrown    — sea dragon
];
