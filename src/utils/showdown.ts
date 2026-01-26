/**
 * Utility functions for handling showdown and distributing pots with side pot support.
 * This module orchestrates pot calculation, winner determination, and chip distribution.
 */

import { Player } from '../types/game';
import { HandEvaluation, determineWinners } from './handEvaluator';
import { calculateSidePots, distributePot } from './sidePots';

/**
 * Handles the complete showdown process including side pot distribution.
 *
 * Algorithm:
 * 1. Calculate all pots (main and side) based on player bets
 * 2. For each pot, determine winners from eligible players only
 * 3. Distribute each pot to its winners
 *
 * @param players All players in the hand (will be modified with updated chip counts)
 * @param handEvaluations Hand evaluations for active (non-folded) players
 * @returns Array of winners (players who won at least one pot)
 */
export function handleShowdown(
  players: Player[],
  handEvaluations: HandEvaluation[]
): Player[] {
  // Calculate all pots (main and side pots)
  const pots = calculateSidePots(players);

  if (pots.length === 0) {
    return [];
  }

  // Get mapping of player IDs to their hand evaluations (for active players only)
  const activePlayers = players.filter(p => !p.isFolded);
  const playerIdToEvaluation = new Map<string, HandEvaluation>();
  activePlayers.forEach((player, index) => {
    playerIdToEvaluation.set(player.id, handEvaluations[index]);
  });

  // Track all winners across all pots
  const allWinnerIds = new Set<string>();

  // Process each pot from main to side pots
  for (const pot of pots) {
    // Filter to only eligible players for this pot
    const eligiblePlayers = activePlayers.filter(p =>
      pot.eligiblePlayerIds.includes(p.id)
    );

    if (eligiblePlayers.length === 0) {
      // Should not happen if calculateSidePots is correct, but handle gracefully
      continue;
    }

    // Get hand evaluations for eligible players only
    const eligibleHandEvaluations = eligiblePlayers.map(p =>
      playerIdToEvaluation.get(p.id)!
    );

    // Determine winners for this pot
    const winnerIndices = determineWinners(eligibleHandEvaluations);
    const potWinnerIds = winnerIndices.map(i => eligiblePlayers[i].id);

    // Distribute this pot to its winners
    distributePot(pot, potWinnerIds, players);

    // Track all winners
    potWinnerIds.forEach(id => allWinnerIds.add(id));
  }

  // Return all players who won at least one pot
  return players.filter(p => allWinnerIds.has(p.id));
}
