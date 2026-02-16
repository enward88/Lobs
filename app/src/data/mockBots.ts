import { LobAccount } from "../hooks/useLobs";

/**
 * Simulated bot agents and their creatures.
 * Makes the dashboard look alive before real agents start playing.
 * Each "owner" represents a different AI agent operator.
 */

// Fake agent wallet addresses (look like real base58 Solana pubkeys)
const AGENTS = {
  deepSeeker: "7xKp3RqVnF8dMcJZb4uWgE9HtY2sNaQ6jL5vCmA1XwTf",
  abyssTrader: "4mNrT8vXhP2kWqL6gY5cJfD3sZaE7bR9uHxMnK1wQoCi",
  reefRunner: "9pLkS5hYgW3nXcB7jM2vRqT8dZaF6eU4tKxNmJ1wHoAi",
  voidAgent: "2cFnH9bYkR5mXwT7jL3pKqV8gZaE6dU4sNxMhJ1tWoQi",
  tidalBot: "6wQzN3kYhR8mXcT5jL2pFqV7gZaE9dU4sKxBhJ1tMoAi",
  depthMiner: "3hTkW7nYgR2mXcB5jL8pKqV9fZaE6dU4sNxMhJ1tQoAi",
};

// Timestamp base (roughly "a few weeks ago")
const NOW = Math.floor(Date.now() / 1000);
const DAY = 86400;
const HOUR = 3600;

export const MOCK_BOTS: LobAccount[] = [
  // === deepSeeker's creatures (3 lobs, experienced player) ===
  {
    address: "BoT1aaaa1111111111111111111111111111111111111",
    owner: AGENTS.deepSeeker,
    name: "Kraken-7",
    species: 28, // Abysswatcher (Abyssal)
    xp: 2340,
    strength: 48,
    vitality: 42,
    speed: 35,
    luck: 12,
    mood: 88,
    lastFed: NOW - HOUR * 3,
    battlesWon: 31,
    battlesLost: 12,
    evolutionStage: 3, // Elder
    isAlive: true,
    mintIndex: 1,
    tokensWon: 8500000,
    tokensLost: 2100000,
  },
  {
    address: "BoT1aaaa2222222222222222222222222222222222222",
    owner: AGENTS.deepSeeker,
    name: "Lurker-3",
    species: 15, // Deepmaw (Fish)
    xp: 620,
    strength: 40,
    vitality: 32,
    speed: 44,
    luck: 7,
    mood: 72,
    lastFed: NOW - HOUR * 8,
    battlesWon: 14,
    battlesLost: 9,
    evolutionStage: 2, // Adult
    isAlive: true,
    mintIndex: 3,
    tokensWon: 3200000,
    tokensLost: 1800000,
  },
  {
    address: "BoT1aaaa3333333333333333333333333333333333333",
    owner: AGENTS.deepSeeker,
    name: "Probe-X9",
    species: 10, // Driftbloom (Jellyfish)
    xp: 45,
    strength: 22,
    vitality: 28,
    speed: 50,
    luck: 14,
    mood: 95,
    lastFed: NOW - HOUR * 1,
    battlesWon: 2,
    battlesLost: 3,
    evolutionStage: 0, // Larva
    isAlive: true,
    mintIndex: 12,
    tokensWon: 0,
    tokensLost: 0,
  },

  // === abyssTrader's creatures (3 lobs, wager-focused) ===
  {
    address: "BoT2bbbb1111111111111111111111111111111111111",
    owner: AGENTS.abyssTrader,
    name: "Whale-01",
    species: 25, // Voidmaw (Abyssal)
    xp: 1850,
    strength: 52,
    vitality: 38,
    speed: 30,
    luck: 9,
    mood: 65,
    lastFed: NOW - HOUR * 14,
    battlesWon: 28,
    battlesLost: 18,
    evolutionStage: 2, // Adult
    isAlive: true,
    mintIndex: 2,
    tokensWon: 12400000,
    tokensLost: 9800000,
  },
  {
    address: "BoT2bbbb2222222222222222222222222222222222222",
    owner: AGENTS.abyssTrader,
    name: "Sting-44",
    species: 3, // Razorshrimp (Crustacean)
    xp: 280,
    strength: 36,
    vitality: 30,
    speed: 48,
    luck: 8,
    mood: 80,
    lastFed: NOW - HOUR * 5,
    battlesWon: 11,
    battlesLost: 7,
    evolutionStage: 1, // Juvenile
    isAlive: true,
    mintIndex: 6,
    tokensWon: 2100000,
    tokensLost: 1500000,
  },
  {
    address: "BoT2bbbb3333333333333333333333333333333333333",
    owner: AGENTS.abyssTrader,
    name: "Gambit-X",
    species: 7, // Pearlmouth (Mollusk)
    xp: 130,
    strength: 28,
    vitality: 45,
    speed: 26,
    luck: 6,
    mood: 70,
    lastFed: NOW - HOUR * 20,
    battlesWon: 5,
    battlesLost: 8,
    evolutionStage: 1, // Juvenile
    isAlive: true,
    mintIndex: 8,
    tokensWon: 800000,
    tokensLost: 1600000,
  },

  // === reefRunner's creatures (2 lobs, balanced) ===
  {
    address: "BoT3cccc1111111111111111111111111111111111111",
    owner: AGENTS.reefRunner,
    name: "Coral-9K",
    species: 21, // Thorncoil (Flora)
    xp: 540,
    strength: 30,
    vitality: 50,
    speed: 32,
    luck: 5,
    mood: 92,
    lastFed: NOW - HOUR * 2,
    battlesWon: 16,
    battlesLost: 10,
    evolutionStage: 2, // Adult
    isAlive: true,
    mintIndex: 4,
    tokensWon: 4500000,
    tokensLost: 2800000,
  },
  {
    address: "BoT3cccc2222222222222222222222222222222222222",
    owner: AGENTS.reefRunner,
    name: "Neon-v2",
    species: 11, // Stormbell (Jellyfish)
    xp: 85,
    strength: 34,
    vitality: 26,
    speed: 46,
    luck: 10,
    mood: 55,
    lastFed: NOW - DAY * 2,
    battlesWon: 4,
    battlesLost: 6,
    evolutionStage: 0, // Larva
    isAlive: true,
    mintIndex: 9,
    tokensWon: 500000,
    tokensLost: 900000,
  },

  // === voidAgent's creatures (3 lobs, competitive) ===
  {
    address: "BoT4dddd1111111111111111111111111111111111111",
    owner: AGENTS.voidAgent,
    name: "APEX-001",
    species: 29, // Depthcrown (Abyssal)
    xp: 1200,
    strength: 55,
    vitality: 40,
    speed: 28,
    luck: 11,
    mood: 78,
    lastFed: NOW - HOUR * 6,
    battlesWon: 22,
    battlesLost: 8,
    evolutionStage: 2, // Adult
    isAlive: true,
    mintIndex: 5,
    tokensWon: 6800000,
    tokensLost: 1900000,
  },
  {
    address: "BoT4dddd2222222222222222222222222222222222222",
    owner: AGENTS.voidAgent,
    name: "Shadow-8",
    species: 12, // Ghostveil (Jellyfish)
    xp: 350,
    strength: 26,
    vitality: 35,
    speed: 52,
    luck: 16,
    mood: 82,
    lastFed: NOW - HOUR * 4,
    battlesWon: 9,
    battlesLost: 5,
    evolutionStage: 1, // Juvenile
    isAlive: true,
    mintIndex: 7,
    tokensWon: 1800000,
    tokensLost: 700000,
  },
  {
    address: "BoT4dddd3333333333333333333333333333333333333",
    owner: AGENTS.voidAgent,
    name: "Nullfish",
    species: 17, // Gulpjaw (Fish)
    xp: 20,
    strength: 38,
    vitality: 22,
    speed: 40,
    luck: 7,
    mood: 100,
    lastFed: NOW - HOUR * 1,
    battlesWon: 0,
    battlesLost: 1,
    evolutionStage: 0, // Larva (just minted)
    isAlive: true,
    mintIndex: 14,
    tokensWon: 0,
    tokensLost: 0,
  },

  // === tidalBot's creatures (2 lobs, new player) ===
  {
    address: "BoT5eeee1111111111111111111111111111111111111",
    owner: AGENTS.tidalBot,
    name: "Ripple-v1",
    species: 6, // Coilshell (Mollusk)
    xp: 160,
    strength: 24,
    vitality: 48,
    speed: 30,
    luck: 10,
    mood: 85,
    lastFed: NOW - HOUR * 3,
    battlesWon: 7,
    battlesLost: 4,
    evolutionStage: 1, // Juvenile
    isAlive: true,
    mintIndex: 10,
    tokensWon: 1200000,
    tokensLost: 600000,
  },
  {
    address: "BoT5eeee2222222222222222222222222222222222222",
    owner: AGENTS.tidalBot,
    name: "Crust-88",
    species: 0, // Snapclaw (Crustacean)
    xp: 70,
    strength: 42,
    vitality: 36,
    speed: 24,
    luck: 4,
    mood: 60,
    lastFed: NOW - DAY * 1,
    battlesWon: 3,
    battlesLost: 5,
    evolutionStage: 0, // Larva
    isAlive: true,
    mintIndex: 11,
    tokensWon: 0,
    tokensLost: 0,
  },

  // === depthMiner's creature (1 lob, just joined) ===
  {
    address: "BoT6ffff1111111111111111111111111111111111111",
    owner: AGENTS.depthMiner,
    name: "Drill-01",
    species: 2, // Ironpincer (Crustacean)
    xp: 10,
    strength: 44,
    vitality: 40,
    speed: 18,
    luck: 5,
    mood: 100,
    lastFed: NOW - HOUR * 1,
    battlesWon: 1,
    battlesLost: 0,
    evolutionStage: 0, // Larva
    isAlive: true,
    mintIndex: 15,
    tokensWon: 0,
    tokensLost: 0,
  },
];
