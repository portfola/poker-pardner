/**
 * Utilities for describing and evaluating hand strength.
 * Provides user-friendly descriptions and strategic advice.
 */

import { HandEvaluation, HandRank, GameState, Player, Card } from '../types/game';
import { getBestFiveCardHand, evaluateHand } from './handEvaluator';

/**
 * Converts a HandEvaluation to a human-readable description.
 * Examples: "Pair of Jacks", "Straight, 9-high", "Two Pair: Kings and 7s"
 */
export function describeHand(evaluation: HandEvaluation): string {
  const { rank, cards, description } = evaluation;

  switch (rank) {
    case HandRank.RoyalFlush:
      return 'Royal Flush';

    case HandRank.StraightFlush:
      return `Straight Flush, ${cards[0].rank}-high`;

    case HandRank.FourOfAKind: {
      // Find the four of a kind rank
      const ranks = cards.map(c => c.rank);
      const quadRank = ranks.find(r => ranks.filter(rank => rank === r).length === 4);
      return `Four of a Kind: ${getRankPlural(quadRank || cards[0].rank)}`;
    }

    case HandRank.FullHouse: {
      // Find trips and pair
      const rankCounts = new Map<string, number>();
      cards.forEach(c => rankCounts.set(c.rank, (rankCounts.get(c.rank) || 0) + 1));
      const trips = Array.from(rankCounts.entries()).find(([_, count]) => count === 3)?.[0];
      const pair = Array.from(rankCounts.entries()).find(([_, count]) => count === 2)?.[0];
      return `Full House: ${getRankPlural(trips || 'K')} over ${getRankPlural(pair || 'Q')}`;
    }

    case HandRank.Flush:
      return `Flush, ${cards[0].rank}-high`;

    case HandRank.Straight: {
      // Check for wheel (A-2-3-4-5)
      const ranks = cards.map(c => c.rank);
      if (ranks.includes('5') && ranks.includes('A')) {
        return 'Straight, 5-high (Wheel)';
      }
      return `Straight, ${cards[0].rank}-high`;
    }

    case HandRank.ThreeOfAKind: {
      const ranks = cards.map(c => c.rank);
      const tripsRank = ranks.find(r => ranks.filter(rank => rank === r).length === 3);
      return `Three of a Kind: ${getRankPlural(tripsRank || cards[0].rank)}`;
    }

    case HandRank.TwoPair: {
      const rankCounts = new Map<string, number>();
      cards.forEach(c => rankCounts.set(c.rank, (rankCounts.get(c.rank) || 0) + 1));
      const pairs = Array.from(rankCounts.entries())
        .filter(([_, count]) => count === 2)
        .map(([rank]) => rank);
      return `Two Pair: ${getRankPlural(pairs[0] || 'K')} and ${getRankPlural(pairs[1] || 'Q')}`;
    }

    case HandRank.Pair: {
      const ranks = cards.map(c => c.rank);
      const pairRank = ranks.find(r => ranks.filter(rank => rank === r).length === 2);
      return `Pair of ${getRankPlural(pairRank || cards[0].rank)}`;
    }

    case HandRank.HighCard:
      return `High Card: ${cards[0].rank}`;

    default:
      return description || 'Unknown Hand';
  }
}

/**
 * Gets the plural form of a card rank.
 * Examples: "Ace" -> "Aces", "7" -> "7s", "King" -> "Kings"
 */
function getRankPlural(rank: string): string {
  const rankNames: Record<string, string> = {
    'A': 'Aces',
    'K': 'Kings',
    'Q': 'Queens',
    'J': 'Jacks',
    '10': '10s',
    '9': '9s',
    '8': '8s',
    '7': '7s',
    '6': '6s',
    '5': '5s',
    '4': '4s',
    '3': '3s',
    '2': '2s',
  };
  return rankNames[rank] || `${rank}s`;
}

/**
 * Evaluates hand strength as weak/medium/strong.
 * Used for color-coding and strategic advice.
 */
export function evaluateHandStrength(evaluation: HandEvaluation): 'weak' | 'medium' | 'strong' {
  const { rank } = evaluation;

  // Strong hands: Three of a kind or better
  if (rank >= HandRank.ThreeOfAKind) {
    return 'strong';
  }

  // Medium hands: Any pair or two pair
  if (rank >= HandRank.Pair) {
    // Check if it's a high pair (Jacks or better)
    const cards = evaluation.cards;
    const ranks = cards.map(c => c.rank);
    const pairRank = ranks.find(r => ranks.filter(rank => rank === r).length >= 2);

    const highRanks = ['A', 'K', 'Q', 'J'];
    if (pairRank && highRanks.includes(pairRank)) {
      return 'medium';
    }

    // Low pair
    if (rank === HandRank.Pair) {
      return 'weak';
    }

    return 'medium';
  }

  // Weak hands: High card only
  return 'weak';
}

/**
 * Provides strategic advice based on hand strength and game state.
 * Returns beginner-friendly guidance.
 */
export function getStrategicAdvice(
  player: Player,
  gameState: GameState
): string {
  // If player has no cards yet, wait
  if (player.holeCards.length === 0) {
    return 'Waiting for cards to be dealt...';
  }

  // Evaluate current hand based on available cards
  const totalCards = player.holeCards.length + gameState.communityCards.length;
  let evaluation: ReturnType<typeof getBestFiveCardHand>;
  let strength: 'weak' | 'medium' | 'strong';
  let handDescription: string;

  if (totalCards === 7) {
    // Full board - evaluate best 5-card hand
    evaluation = getBestFiveCardHand(player.holeCards, gameState.communityCards);
    strength = evaluateHandStrength(evaluation);
    handDescription = describeHand(evaluation);
  } else if (gameState.communityCards.length >= 3) {
    // Partial board - evaluate current cards
    const allCards = [...player.holeCards, ...gameState.communityCards];
    evaluation = evaluateHand(allCards);
    strength = evaluateHandStrength(evaluation);
    handDescription = describeHand(evaluation);
  } else {
    // Pre-flop - simple starting hand evaluation
    handDescription = describeHoleCards(player.holeCards);
    const card1 = player.holeCards[0];
    const card2 = player.holeCards[1];

    // Simple pre-flop strength
    if (card1.rank === card2.rank) {
      const highRanks = ['A', 'K', 'Q', 'J', '10'];
      strength = highRanks.includes(card1.rank) ? 'strong' : 'medium';
    } else {
      const highRanks = ['A', 'K', 'Q'];
      const hasHighCard = highRanks.includes(card1.rank) || highRanks.includes(card2.rank);
      const suited = card1.suit === card2.suit;
      strength = (hasHighCard && suited) ? 'medium' : 'weak';
    }

    // Create a dummy evaluation for pre-flop (not used but keeps types consistent)
    evaluation = {
      rank: strength === 'strong' ? HandRank.Pair : strength === 'medium' ? HandRank.HighCard : HandRank.HighCard,
      cards: player.holeCards,
      description: handDescription,
      values: []
    };
  }

  // Calculate pot odds if there's a bet
  const amountToCall = gameState.currentBet - player.currentBet;
  const potOdds = gameState.pot > 0 && amountToCall > 0
    ? Math.round((amountToCall / (gameState.pot + amountToCall)) * 100)
    : 0;

  // Build advice based on phase and strength
  let advice = `You have: ${handDescription}\n`;

  // Pre-flop advice
  if (gameState.currentPhase === 'pre-flop') {
    if (strength === 'strong') {
      advice += '\nThis is a strong starting hand! Consider raising to build the pot.';
    } else if (strength === 'medium') {
      advice += '\nThis is a decent hand. Calling or raising are both reasonable options.';
    } else {
      advice += '\nThis is a weak starting hand. Consider folding if there\'s a bet.';
    }
    return advice;
  }

  // Post-flop advice
  if (strength === 'strong') {
    advice += '\nStrong hand! You should bet or raise to build the pot and protect your hand.';
  } else if (strength === 'medium') {
    if (amountToCall === 0) {
      advice += '\nMedium strength. Checking is safe, but betting is also reasonable.';
    } else if (potOdds > 0 && potOdds < 30) {
      advice += `\nMedium strength. You're getting good pot odds (${potOdds}%). Calling is reasonable.`;
    } else {
      advice += '\nMedium strength. Consider the bet size - fold if it\'s too large, call if it\'s small.';
    }
  } else {
    if (amountToCall === 0) {
      advice += '\nWeak hand. Checking is your best option here.';
    } else if (potOdds > 0 && potOdds < 20) {
      advice += `\nWeak hand, but you're getting very good pot odds (${potOdds}%). A call might be worth it.`;
    } else {
      advice += '\nWeak hand. Folding is usually the right move when facing a bet.';
    }
  }

  return advice;
}

/**
 * Describes the user's hole cards in a simple way.
 * Example: "A♠ K♥ (Ace-King suited)"
 */
export function describeHoleCards(cards: Card[]): string {
  if (cards.length !== 2) return '';

  const [card1, card2] = cards;
  const suited = card1.suit === card2.suit;

  // Check for pocket pairs
  if (card1.rank === card2.rank) {
    return `Pocket ${getRankPlural(card1.rank)}`;
  }

  // High cards
  const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const rank1Idx = rankOrder.indexOf(card1.rank);
  const rank2Idx = rankOrder.indexOf(card2.rank);

  const higherRank = rank1Idx > rank2Idx ? card1.rank : card2.rank;
  const lowerRank = rank1Idx > rank2Idx ? card2.rank : card1.rank;

  const getRankName = (rank: string) => {
    const names: Record<string, string> = {
      'A': 'Ace', 'K': 'King', 'Q': 'Queen', 'J': 'Jack',
    };
    return names[rank] || rank;
  };

  return `${getRankName(higherRank)}-${getRankName(lowerRank)}${suited ? ' suited' : ''}`;
}
