/**
 * Hand evaluation system for Texas Hold'em poker.
 * Determines hand rankings and compares hands to find winners.
 */

import { Card, HandEvaluation, HandRank } from '../types/game';
import { RANK_VALUES } from '../constants/cards';
import { Rank } from '../types/game';

/**
 * Gets the numeric value of a card rank.
 * Aces are treated as 14 by default (can be 1 for ace-low straights).
 */
function getCardValue(rank: Rank): number {
  return RANK_VALUES[rank];
}

/**
 * Groups cards by rank.
 * Returns a map of rank -> array of cards with that rank.
 */
function groupByRank(cards: Card[]): Map<Rank, Card[]> {
  const groups = new Map<Rank, Card[]>();

  for (const card of cards) {
    const existing = groups.get(card.rank) || [];
    existing.push(card);
    groups.set(card.rank, existing);
  }

  return groups;
}

/**
 * Sorts cards by rank value in descending order.
 */
function sortByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank));
}

/**
 * Checks if cards form a straight.
 * Returns the high card of the straight if true, null otherwise.
 * Handles both ace-high (10-J-Q-K-A) and ace-low (A-2-3-4-5) straights.
 */
function checkStraight(cards: Card[]): Card | null {
  if (cards.length !== 5) return null;

  const sorted = sortByRank(cards);
  const values = sorted.map(c => getCardValue(c.rank));

  // Check for regular straight (including ace-high)
  let isStraight = true;
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      isStraight = false;
      break;
    }
  }

  if (isStraight) {
    return sorted[0]; // Return high card
  }

  // Check for ace-low straight (A-2-3-4-5)
  // In this case, ace is treated as 1
  if (values[0] === 14 && values[1] === 5 && values[2] === 4 &&
      values[3] === 3 && values[4] === 2) {
    return sorted[1]; // Return the 5 as high card (ace is low)
  }

  return null;
}

/**
 * Checks if all cards are the same suit.
 */
function checkFlush(cards: Card[]): boolean {
  if (cards.length !== 5) return false;
  const suit = cards[0].suit;
  return cards.every(card => card.suit === suit);
}

/**
 * Evaluates a 5-card poker hand and returns its ranking.
 * @param cards - Exactly 5 cards to evaluate
 * @returns HandEvaluation with rank, cards, description, and comparison values
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error('Hand evaluation requires exactly 5 cards');
  }

  const sorted = sortByRank(cards);
  const rankGroups = groupByRank(cards);
  const groupSizes = Array.from(rankGroups.values())
    .map(group => group.length)
    .sort((a, b) => b - a);

  const isFlush = checkFlush(cards);
  const straightHighCard = checkStraight(cards);
  const isStraight = straightHighCard !== null;

  // Royal Flush: A-K-Q-J-10 of same suit
  if (isStraight && isFlush && getCardValue(sorted[0].rank) === 14 &&
      getCardValue(sorted[1].rank) === 13) {
    return {
      rank: HandRank.RoyalFlush,
      cards: sorted,
      description: 'Royal Flush',
      values: [10], // Royal flush is unbeatable
    };
  }

  // Straight Flush: Five cards in sequence, all same suit
  if (isStraight && isFlush) {
    const highValue = getCardValue(straightHighCard!.rank);
    return {
      rank: HandRank.StraightFlush,
      cards: sorted,
      description: `Straight Flush, ${straightHighCard!.rank}-high`,
      values: [highValue],
    };
  }

  // Four of a Kind: Four cards of same rank
  if (groupSizes[0] === 4) {
    const quadRank = Array.from(rankGroups.entries())
      .find(([_, group]) => group.length === 4)![0];
    const kicker = Array.from(rankGroups.entries())
      .find(([_, group]) => group.length === 1)![0];

    return {
      rank: HandRank.FourOfAKind,
      cards: sorted,
      description: `Four of a Kind, ${quadRank}s`,
      values: [getCardValue(quadRank), getCardValue(kicker)],
    };
  }

  // Full House: Three of a kind plus a pair
  if (groupSizes[0] === 3 && groupSizes[1] === 2) {
    const tripRank = Array.from(rankGroups.entries())
      .find(([_, group]) => group.length === 3)![0];
    const pairRank = Array.from(rankGroups.entries())
      .find(([_, group]) => group.length === 2)![0];

    return {
      rank: HandRank.FullHouse,
      cards: sorted,
      description: `Full House, ${tripRank}s over ${pairRank}s`,
      values: [getCardValue(tripRank), getCardValue(pairRank)],
    };
  }

  // Flush: Five cards of same suit
  if (isFlush) {
    const values = sorted.map(c => getCardValue(c.rank));
    return {
      rank: HandRank.Flush,
      cards: sorted,
      description: `Flush, ${sorted[0].rank}-high`,
      values,
    };
  }

  // Straight: Five cards in sequence
  if (isStraight) {
    const highValue = getCardValue(straightHighCard!.rank);
    return {
      rank: HandRank.Straight,
      cards: sorted,
      description: `Straight, ${straightHighCard!.rank}-high`,
      values: [highValue],
    };
  }

  // Three of a Kind: Three cards of same rank
  if (groupSizes[0] === 3) {
    const tripRank = Array.from(rankGroups.entries())
      .find(([_, group]) => group.length === 3)![0];
    const kickers = Array.from(rankGroups.entries())
      .filter(([_, group]) => group.length === 1)
      .map(([rank]) => getCardValue(rank))
      .sort((a, b) => b - a);

    return {
      rank: HandRank.ThreeOfAKind,
      cards: sorted,
      description: `Three of a Kind, ${tripRank}s`,
      values: [getCardValue(tripRank), ...kickers],
    };
  }

  // Two Pair: Two different pairs
  if (groupSizes[0] === 2 && groupSizes[1] === 2) {
    const pairs = Array.from(rankGroups.entries())
      .filter(([_, group]) => group.length === 2)
      .map(([rank]) => rank)
      .sort((a, b) => getCardValue(b) - getCardValue(a));
    const kicker = Array.from(rankGroups.entries())
      .find(([_, group]) => group.length === 1)![0];

    return {
      rank: HandRank.TwoPair,
      cards: sorted,
      description: `Two Pair, ${pairs[0]}s and ${pairs[1]}s`,
      values: [getCardValue(pairs[0]), getCardValue(pairs[1]), getCardValue(kicker)],
    };
  }

  // One Pair: Two cards of same rank
  if (groupSizes[0] === 2) {
    const pairRank = Array.from(rankGroups.entries())
      .find(([_, group]) => group.length === 2)![0];
    const kickers = Array.from(rankGroups.entries())
      .filter(([_, group]) => group.length === 1)
      .map(([rank]) => getCardValue(rank))
      .sort((a, b) => b - a);

    return {
      rank: HandRank.Pair,
      cards: sorted,
      description: `Pair of ${pairRank}s`,
      values: [getCardValue(pairRank), ...kickers],
    };
  }

  // High Card: No matching ranks
  const values = sorted.map(c => getCardValue(c.rank));
  return {
    rank: HandRank.HighCard,
    cards: sorted,
    description: `High Card, ${sorted[0].rank}`,
    values,
  };
}

/**
 * Finds the best 5-card hand from 7 cards (2 hole cards + 5 community cards).
 * Evaluates all possible 5-card combinations and returns the best one.
 * @param holeCards - Player's 2 hole cards
 * @param communityCards - The 5 community cards
 * @returns The best possible HandEvaluation
 */
export function getBestFiveCardHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length !== 7) {
    throw new Error('getBestFiveCardHand requires exactly 7 cards (2 hole + 5 community)');
  }

  let bestHand: HandEvaluation | null = null;

  // Generate all possible 5-card combinations from 7 cards (21 combinations)
  for (let i = 0; i < allCards.length - 4; i++) {
    for (let j = i + 1; j < allCards.length - 3; j++) {
      for (let k = j + 1; k < allCards.length - 2; k++) {
        for (let l = k + 1; l < allCards.length - 1; l++) {
          for (let m = l + 1; m < allCards.length; m++) {
            const fiveCards = [allCards[i], allCards[j], allCards[k], allCards[l], allCards[m]];
            const evaluation = evaluateHand(fiveCards);

            if (!bestHand || compareHands(evaluation, bestHand) > 0) {
              bestHand = evaluation;
            }
          }
        }
      }
    }
  }

  return bestHand!;
}

/**
 * Finds the best 5-card hand from 6 cards (e.g., 2 hole cards + 4 community cards on the turn).
 * Evaluates all possible 5-card combinations and returns the best one.
 * @param cards - Exactly 6 cards to evaluate
 * @returns The best possible HandEvaluation
 */
export function getBestHandFromSix(cards: Card[]): HandEvaluation {
  if (cards.length !== 6) {
    throw new Error('getBestHandFromSix requires exactly 6 cards');
  }

  let bestHand: HandEvaluation | null = null;

  // Try all combinations of 5 cards from 6 (6 combinations)
  for (let i = 0; i < cards.length; i++) {
    const fiveCards = cards.filter((_, idx) => idx !== i);
    const evaluation = evaluateHand(fiveCards);

    if (!bestHand || compareHands(evaluation, bestHand) > 0) {
      bestHand = evaluation;
    }
  }

  return bestHand!;
}

/**
 * Compares two hands to determine which is better.
 * @param hand1 - First hand
 * @param hand2 - Second hand
 * @returns Positive if hand1 wins, negative if hand2 wins, 0 if tie
 */
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  // First compare by rank
  if (hand1.rank !== hand2.rank) {
    return hand1.rank - hand2.rank;
  }

  // Same rank, compare by values (kickers)
  for (let i = 0; i < Math.min(hand1.values.length, hand2.values.length); i++) {
    if (hand1.values[i] !== hand2.values[i]) {
      return hand1.values[i] - hand2.values[i];
    }
  }

  // Hands are identical
  return 0;
}

/**
 * Determines the winner(s) from multiple hand evaluations.
 * @param hands - Array of hand evaluations with player info
 * @returns Array of winning hand indices (can be multiple in case of tie)
 */
export function determineWinners(hands: HandEvaluation[]): number[] {
  if (hands.length === 0) {
    return [];
  }

  let bestHandIndices = [0];
  let bestHand = hands[0];

  for (let i = 1; i < hands.length; i++) {
    const comparison = compareHands(hands[i], bestHand);

    if (comparison > 0) {
      // New best hand
      bestHandIndices = [i];
      bestHand = hands[i];
    } else if (comparison === 0) {
      // Tie with current best
      bestHandIndices.push(i);
    }
  }

  return bestHandIndices;
}
