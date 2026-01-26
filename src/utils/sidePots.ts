/**
 * Utility functions for calculating and distributing side pots.
 * Side pots occur when multiple players go all-in for different amounts.
 */

import { Player } from '../types/game';

/**
 * Represents a pot (main or side) in the game.
 */
export interface Pot {
  /** Total chips in this pot */
  amount: number;
  /** IDs of players eligible to win this pot */
  eligiblePlayerIds: string[];
}

/**
 * Calculates all pots (main and side) based on player bets.
 *
 * Algorithm:
 * 1. Sort players by their total bet amount (ascending)
 * 2. For each unique bet level, create a pot containing contributions from all players
 *    who bet at least that amount
 * 3. Each pot is eligible only to players who contributed to it
 *
 * Example:
 * - Player A: folded (totalBet: $10)
 * - Player B: all-in for $20 (totalBet: $20)
 * - Player C: all-in for $50 (totalBet: $50)
 * - Player D: called $50 (totalBet: $50)
 *
 * Results in:
 * - Main pot: $20 × 4 = $80 (eligible: B, C, D - A folded)
 * - Side pot: ($50 - $20) × 2 = $60 (eligible: C, D - B can't win more than they bet)
 *
 * @param players All players in the hand
 * @returns Array of pots ordered from main to side pots
 */
export function calculateSidePots(players: Player[]): Pot[] {
  // Filter to only players who contributed to the pot (not folded or totalBet > 0)
  const playersWithBets = players.filter(p => p.totalBet > 0);

  if (playersWithBets.length === 0) {
    return [];
  }

  // Get all unique bet amounts, sorted ascending
  const uniqueBetAmounts = Array.from(
    new Set(playersWithBets.map(p => p.totalBet))
  ).sort((a, b) => a - b);

  const pots: Pot[] = [];
  let previousBetLevel = 0;

  // Create a pot for each bet level
  for (const betLevel of uniqueBetAmounts) {
    // Find all players who bet at least this amount
    const eligiblePlayers = playersWithBets.filter(p => p.totalBet >= betLevel && !p.isFolded);

    if (eligiblePlayers.length === 0) {
      // If no eligible players (all folded), skip this pot level
      previousBetLevel = betLevel;
      continue;
    }

    // Calculate pot amount: (current level - previous level) × number of players who bet at least this much
    const playersAtThisLevel = playersWithBets.filter(p => p.totalBet >= betLevel);
    const potContribution = (betLevel - previousBetLevel) * playersAtThisLevel.length;

    pots.push({
      amount: potContribution,
      eligiblePlayerIds: eligiblePlayers.map(p => p.id),
    });

    previousBetLevel = betLevel;
  }

  return pots;
}

/**
 * Distributes pot winnings to players based on pot structure and winners.
 * Modifies player chip counts in place.
 *
 * @param pot The pot to distribute
 * @param winnerIds IDs of players who won this pot (may be split)
 * @param players All players (will be modified)
 */
export function distributePot(pot: Pot, winnerIds: string[], players: Player[]): void {
  if (winnerIds.length === 0) {
    throw new Error('Cannot distribute pot with no winners');
  }

  // Split pot evenly among winners
  const potShare = Math.floor(pot.amount / winnerIds.length);
  const remainder = pot.amount % winnerIds.length;

  winnerIds.forEach((winnerId, index) => {
    const winner = players.find(p => p.id === winnerId);
    if (!winner) {
      throw new Error(`Winner not found: ${winnerId}`);
    }

    // First winner gets the remainder (if any) from rounding
    winner.chips += potShare + (index === 0 ? remainder : 0);
  });
}
