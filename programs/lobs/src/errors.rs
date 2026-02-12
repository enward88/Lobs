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
}
