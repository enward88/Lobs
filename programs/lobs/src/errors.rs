use anchor_lang::prelude::*;

#[error_code]
pub enum LobsError {
    #[msg("Name exceeds maximum length of 32 bytes")]
    NameTooLong,

    #[msg("Feed is on cooldown")]
    FeedCooldown,

    #[msg("Lob is no longer alive")]
    LobDead,

    #[msg("Already at maximum evolution stage")]
    AlreadyMaxEvolution,

    #[msg("Insufficient XP to evolve")]
    InsufficientXp,

    #[msg("Cannot battle your own Lob")]
    CannotBattleSelf,

    #[msg("Arithmetic overflow")]
    Overflow,

    #[msg("Invalid species value")]
    InvalidSpecies,

    #[msg("Wager below minimum (0.01 SOL)")]
    WagerTooLow,

    #[msg("Wager above maximum (10 SOL)")]
    WagerTooHigh,

    #[msg("Challenge is no longer active")]
    ChallengeInactive,

    #[msg("Wrong defender lob for this challenge")]
    WrongDefender,
}
