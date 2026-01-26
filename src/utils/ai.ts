/**
 * Simple AI decision engine for poker opponents.
 * Uses basic strategy suitable for educational purposes.
 */

import { Player, GameState, BettingAction, Card, Rank } from '../types/game';
import { getBestFiveCardHand, getBestHandFromSix, evaluateHand } from './handEvaluator';
import { DifficultyLevel, getDifficultyConfig, DEFAULT_DIFFICULTY } from '../constants/difficulty';

/**
 * Evaluates the strength of a hand for AI decision-making.
 * Returns a score from 0-10 (higher is better).
 * Uses the same evaluation logic as shown to the user.
 */
function evaluateHandStrength(player: Player, communityCards: Card[]): number {
  if (player.holeCards.length !== 2) return 0;

  // Pre-flop: Simple evaluation based on hole cards only
  if (communityCards.length === 0) {
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

  // Flop: 3 community cards (5 total) - evaluate as-is
  if (communityCards.length === 3) {
    const allCards = [...player.holeCards, ...communityCards];
    const evaluation = evaluateHand(allCards);
    return evaluation.rank;
  }

  // Turn: 4 community cards (6 total) - find best 5 from 6
  if (communityCards.length === 4) {
    const allCards = [...player.holeCards, ...communityCards];
    const evaluation = getBestHandFromSix(allCards);
    return evaluation.rank;
  }

  // River: 5 community cards (7 total) - find best 5 from 7
  if (communityCards.length === 5) {
    const evaluation = getBestFiveCardHand(player.holeCards, communityCards);
    return evaluation.rank;
  }

  // Fallback for unexpected card counts
  const card1Value = getCardValue(player.holeCards[0].rank);
  const card2Value = getCardValue(player.holeCards[1].rank);
  const avgValue = (card1Value + card2Value) / 2;
  return avgValue / 2;
}

/**
 * Gets numeric value for a card rank.
 */
function getCardValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank];
}

/**
 * Makes a decision for an AI player.
 * Returns the action and optional raise amount.
 *
 * @param player - The AI player making the decision
 * @param gameState - Current game state
 * @param difficulty - AI difficulty level (easy/medium/hard), defaults to medium
 */
export function makeAIDecision(
  player: Player,
  gameState: GameState,
  difficulty: DifficultyLevel = DEFAULT_DIFFICULTY
): { action: BettingAction; amount?: number } {
  const { currentBet, communityCards, minRaise } = gameState;

  // Get difficulty-specific configuration
  const config = getDifficultyConfig(difficulty);
  const thresholds = config.thresholds;
  const variance = config.variance;
  const potOddsThreshold = config.potOddsCallThreshold;

  // Calculate hand strength
  const handStrength = evaluateHandStrength(player, communityCards);

  // Calculate amount needed to call
  const amountToCall = currentBet - player.currentBet;
  const canCall = player.chips >= amountToCall;
  const canRaise = player.chips > amountToCall;

  // Pot odds consideration (simplified)
  const potOdds = gameState.pot > 0 ? amountToCall / gameState.pot : 0;

  // Add randomness for unpredictability (using difficulty-specific variance)
  const randomFactor = variance.MIN + Math.random() * variance.RANGE;
  const adjustedStrength = handStrength * randomFactor;

  // Decision logic
  if (amountToCall === 0) {
    // No bet to call - we can check for free
    if (adjustedStrength >= thresholds.RAISE && canRaise) {
      // Strong hand - bet/raise
      return { action: 'raise', amount: minRaise };
    }
    // Weak/medium hand - check
    return { action: 'check' };
  }

  // There's a bet to call
  if (adjustedStrength < thresholds.FOLD) {
    // Very weak hand - fold
    return { action: 'fold' };
  }

  if (adjustedStrength >= thresholds.RAISE && canRaise) {
    // Strong hand - raise
    return { action: 'raise', amount: minRaise };
  }

  if (adjustedStrength >= thresholds.CALL && canCall) {
    // Medium hand - call
    return { action: 'call' };
  }

  // Weak hand - fold if bet is too big, otherwise call
  if (potOdds < potOddsThreshold && canCall) {
    // Small bet relative to pot - worth calling
    return { action: 'call' };
  }

  // Default to fold
  return { action: 'fold' };
}
