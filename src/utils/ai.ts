/**
 * Simple AI decision engine for poker opponents.
 * Uses basic strategy suitable for educational purposes.
 */

import { Player, GameState, BettingAction, Card } from '../types/game';
import { getBestFiveCardHand } from './handEvaluator';

/**
 * Evaluates the strength of a hand for AI decision-making.
 * Returns a score from 0-10 (higher is better).
 */
function evaluateHandStrength(player: Player, communityCards: Card[]): number {
  if (player.holeCards.length === 0) return 0;

  // Pre-flop: evaluate hole cards only
  if (communityCards.length === 0) {
    // Simple pre-flop hand strength based on high cards and pairs
    const card1Value = getCardValue(player.holeCards[0].rank);
    const card2Value = getCardValue(player.holeCards[1].rank);

    // Pocket pair
    if (card1Value === card2Value) {
      return Math.min(10, card1Value / 2 + 3); // Pairs are strong
    }

    // High cards
    const avgValue = (card1Value + card2Value) / 2;
    return avgValue / 2;
  }

  // Post-flop: evaluate best hand
  const evaluation = getBestFiveCardHand(player.holeCards, communityCards);

  // Convert hand rank to strength score (0-10)
  const rankScore = evaluation.rank; // HandRank enum (0-9)
  return rankScore;
}

/**
 * Gets numeric value for a card rank.
 */
function getCardValue(rank: string): number {
  const values: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank] || 0;
}

/**
 * Makes a decision for an AI player.
 * Returns the action and optional raise amount.
 */
export function makeAIDecision(
  player: Player,
  gameState: GameState
): { action: BettingAction; amount?: number } {
  const { currentBet, communityCards, minRaise } = gameState;

  // Calculate hand strength
  const handStrength = evaluateHandStrength(player, communityCards);

  // Calculate amount needed to call
  const amountToCall = currentBet - player.currentBet;
  const canCall = player.chips >= amountToCall;
  const canRaise = player.chips > amountToCall;

  // Pot odds consideration (simplified)
  const potOdds = gameState.pot > 0 ? amountToCall / gameState.pot : 0;

  // Decision thresholds based on hand strength
  const foldThreshold = 2;
  const callThreshold = 4;
  const raiseThreshold = 6;

  // Add some randomness (±20%)
  const randomFactor = 0.8 + Math.random() * 0.4;
  const adjustedStrength = handStrength * randomFactor;

  // Decision logic
  if (amountToCall === 0) {
    // No bet to call - we can check for free
    if (adjustedStrength >= raiseThreshold && canRaise) {
      // Strong hand - bet/raise
      return { action: 'raise', amount: minRaise };
    }
    // Weak/medium hand - check
    return { action: 'check' };
  }

  // There's a bet to call
  if (adjustedStrength < foldThreshold) {
    // Very weak hand - fold
    return { action: 'fold' };
  }

  if (adjustedStrength >= raiseThreshold && canRaise) {
    // Strong hand - raise
    return { action: 'raise', amount: minRaise };
  }

  if (adjustedStrength >= callThreshold && canCall) {
    // Medium hand - call
    return { action: 'call' };
  }

  // Weak hand - fold if bet is too big, otherwise call
  if (potOdds < 0.3 && canCall) {
    // Small bet relative to pot - worth calling
    return { action: 'call' };
  }

  // Default to fold
  return { action: 'fold' };
}
