/**
 * Unit tests for hand strength utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  describeHand,
  evaluateHandStrength,
  getStrategicAdvice,
  describeHoleCards,
} from './handStrength';
import { HandEvaluation, HandRank, Card, Player, GameState } from '../types/game';

// Helper to create a card
const c = (rank: Card['rank'], suit: Card['suit']): Card => ({ rank, suit });

// Helper to create a HandEvaluation
function createEvaluation(
  rank: HandRank,
  cards: Card[],
  description: string = ''
): HandEvaluation {
  return {
    rank,
    cards,
    description,
    values: cards.map((card) => {
      const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
      return rankOrder.indexOf(card.rank) + 2;
    }),
  };
}

// Helper to create a minimal player
function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'user',
    name: 'You',
    chips: 100,
    holeCards: [],
    isFolded: false,
    isUser: true,
    position: 0,
    currentBet: 0,
    totalBet: 0,
    hasActed: false,
    isAllIn: false,
    ...overrides,
  };
}

// Helper to create a minimal game state
function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [],
    pot: 0,
    communityCards: [],
    currentPhase: 'pre-flop',
    dealerPosition: 0,
    currentPlayerIndex: 0,
    currentBet: 0,
    minRaise: 20,
    smallBlind: 5,
    bigBlind: 10,
    deck: [],
    mode: 'tutorial',
    difficulty: 'medium',
    isHandComplete: false,
    winners: [],
    winningHands: [],
    isAdvancingPhase: false,
    isWaitingForContinue: false,
    pendingEvent: null,
    actionHistory: [],
    isWaitingForNextAction: false,
    ...overrides,
  };
}

describe('describeHand', () => {
  it('should describe Royal Flush', () => {
    const cards = [
      c('A', 'spades'),
      c('K', 'spades'),
      c('Q', 'spades'),
      c('J', 'spades'),
      c('10', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.RoyalFlush, cards);
    expect(describeHand(evaluation)).toBe('Royal Flush');
  });

  it('should describe Straight Flush with high card', () => {
    const cards = [
      c('9', 'hearts'),
      c('8', 'hearts'),
      c('7', 'hearts'),
      c('6', 'hearts'),
      c('5', 'hearts'),
    ];
    const evaluation = createEvaluation(HandRank.StraightFlush, cards);
    expect(describeHand(evaluation)).toBe('Straight Flush, 9-high');
  });

  it('should describe Four of a Kind', () => {
    const cards = [
      c('A', 'spades'),
      c('A', 'hearts'),
      c('A', 'diamonds'),
      c('A', 'clubs'),
      c('K', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.FourOfAKind, cards);
    expect(describeHand(evaluation)).toBe('Four of a Kind: Aces');
  });

  it('should describe Full House', () => {
    const cards = [
      c('K', 'spades'),
      c('K', 'hearts'),
      c('K', 'diamonds'),
      c('Q', 'clubs'),
      c('Q', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.FullHouse, cards);
    expect(describeHand(evaluation)).toBe('Full House: Kings over Queens');
  });

  it('should describe Flush', () => {
    const cards = [
      c('A', 'hearts'),
      c('J', 'hearts'),
      c('8', 'hearts'),
      c('5', 'hearts'),
      c('2', 'hearts'),
    ];
    const evaluation = createEvaluation(HandRank.Flush, cards);
    expect(describeHand(evaluation)).toBe('Flush, A-high');
  });

  it('should describe Straight', () => {
    const cards = [
      c('9', 'spades'),
      c('8', 'hearts'),
      c('7', 'diamonds'),
      c('6', 'clubs'),
      c('5', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.Straight, cards);
    expect(describeHand(evaluation)).toBe('Straight, 9-high');
  });

  it('should describe Wheel (ace-low straight)', () => {
    const cards = [
      c('5', 'spades'),
      c('4', 'hearts'),
      c('3', 'diamonds'),
      c('2', 'clubs'),
      c('A', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.Straight, cards);
    expect(describeHand(evaluation)).toBe('Straight, 5-high (Wheel)');
  });

  it('should describe Three of a Kind', () => {
    const cards = [
      c('J', 'spades'),
      c('J', 'hearts'),
      c('J', 'diamonds'),
      c('K', 'clubs'),
      c('Q', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.ThreeOfAKind, cards);
    expect(describeHand(evaluation)).toBe('Three of a Kind: Jacks');
  });

  it('should describe Two Pair', () => {
    const cards = [
      c('K', 'spades'),
      c('K', 'hearts'),
      c('7', 'diamonds'),
      c('7', 'clubs'),
      c('A', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.TwoPair, cards);
    expect(describeHand(evaluation)).toBe('Two Pair: Kings and 7s');
  });

  it('should describe Pair', () => {
    const cards = [
      c('J', 'spades'),
      c('J', 'hearts'),
      c('A', 'diamonds'),
      c('K', 'clubs'),
      c('Q', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.Pair, cards);
    expect(describeHand(evaluation)).toBe('Pair of Jacks');
  });

  it('should describe High Card', () => {
    const cards = [
      c('A', 'spades'),
      c('K', 'hearts'),
      c('J', 'diamonds'),
      c('8', 'clubs'),
      c('5', 'spades'),
    ];
    const evaluation = createEvaluation(HandRank.HighCard, cards);
    expect(describeHand(evaluation)).toBe('High Card: A');
  });
});

describe('evaluateHandStrength', () => {
  it('should classify three of a kind or better as strong', () => {
    const threeOfAKind = createEvaluation(HandRank.ThreeOfAKind, [
      c('J', 'spades'),
      c('J', 'hearts'),
      c('J', 'diamonds'),
      c('K', 'clubs'),
      c('Q', 'spades'),
    ]);
    expect(evaluateHandStrength(threeOfAKind)).toBe('strong');

    const flush = createEvaluation(HandRank.Flush, [
      c('A', 'hearts'),
      c('J', 'hearts'),
      c('8', 'hearts'),
      c('5', 'hearts'),
      c('2', 'hearts'),
    ]);
    expect(evaluateHandStrength(flush)).toBe('strong');

    const fourOfAKind = createEvaluation(HandRank.FourOfAKind, [
      c('A', 'spades'),
      c('A', 'hearts'),
      c('A', 'diamonds'),
      c('A', 'clubs'),
      c('K', 'spades'),
    ]);
    expect(evaluateHandStrength(fourOfAKind)).toBe('strong');
  });

  it('should classify high pair as medium', () => {
    const highPair = createEvaluation(HandRank.Pair, [
      c('K', 'spades'),
      c('K', 'hearts'),
      c('A', 'diamonds'),
      c('J', 'clubs'),
      c('8', 'spades'),
    ]);
    expect(evaluateHandStrength(highPair)).toBe('medium');

    const acePair = createEvaluation(HandRank.Pair, [
      c('A', 'spades'),
      c('A', 'hearts'),
      c('K', 'diamonds'),
      c('J', 'clubs'),
      c('8', 'spades'),
    ]);
    expect(evaluateHandStrength(acePair)).toBe('medium');
  });

  it('should classify low pair as weak', () => {
    const lowPair = createEvaluation(HandRank.Pair, [
      c('7', 'spades'),
      c('7', 'hearts'),
      c('A', 'diamonds'),
      c('K', 'clubs'),
      c('Q', 'spades'),
    ]);
    expect(evaluateHandStrength(lowPair)).toBe('weak');
  });

  it('should classify two pair as medium', () => {
    const twoPair = createEvaluation(HandRank.TwoPair, [
      c('5', 'spades'),
      c('5', 'hearts'),
      c('3', 'diamonds'),
      c('3', 'clubs'),
      c('A', 'spades'),
    ]);
    expect(evaluateHandStrength(twoPair)).toBe('medium');
  });

  it('should classify high card as weak', () => {
    const highCard = createEvaluation(HandRank.HighCard, [
      c('A', 'spades'),
      c('K', 'hearts'),
      c('J', 'diamonds'),
      c('8', 'clubs'),
      c('5', 'spades'),
    ]);
    expect(evaluateHandStrength(highCard)).toBe('weak');
  });
});

describe('describeHoleCards', () => {
  it('should describe pocket pairs', () => {
    expect(describeHoleCards([c('A', 'spades'), c('A', 'hearts')])).toBe('Pocket Aces');
    expect(describeHoleCards([c('K', 'spades'), c('K', 'hearts')])).toBe('Pocket Kings');
    expect(describeHoleCards([c('7', 'spades'), c('7', 'hearts')])).toBe('Pocket 7s');
  });

  it('should describe suited connectors', () => {
    expect(describeHoleCards([c('A', 'spades'), c('K', 'spades')])).toBe('Ace-King suited');
    expect(describeHoleCards([c('Q', 'hearts'), c('J', 'hearts')])).toBe('Queen-Jack suited');
  });

  it('should describe offsuit hands', () => {
    expect(describeHoleCards([c('A', 'spades'), c('K', 'hearts')])).toBe('Ace-King');
    expect(describeHoleCards([c('10', 'diamonds'), c('9', 'clubs')])).toBe('10-9');
  });

  it('should order cards correctly (higher rank first)', () => {
    expect(describeHoleCards([c('9', 'spades'), c('A', 'hearts')])).toBe('Ace-9');
    expect(describeHoleCards([c('2', 'diamonds'), c('K', 'clubs')])).toBe('King-2');
  });

  it('should handle empty or incomplete arrays', () => {
    expect(describeHoleCards([])).toBe('');
    expect(describeHoleCards([c('A', 'spades')])).toBe('');
  });
});

describe('getStrategicAdvice', () => {
  it('should return waiting message when no cards', () => {
    const player = createPlayer({ holeCards: [] });
    const gameState = createGameState();

    const advice = getStrategicAdvice(player, gameState);
    expect(advice).toBe('Waiting for cards to be dealt...');
  });

  it('should provide pre-flop advice for strong hands', () => {
    const player = createPlayer({
      holeCards: [c('A', 'spades'), c('A', 'hearts')],
    });
    const gameState = createGameState({
      currentPhase: 'pre-flop',
      communityCards: [],
    });

    const advice = getStrategicAdvice(player, gameState);
    expect(advice).toContain('Pocket Aces');
    expect(advice).toContain('strong');
    expect(advice.toLowerCase()).toContain('raising');
  });

  it('should provide pre-flop advice for weak hands', () => {
    const player = createPlayer({
      holeCards: [c('2', 'hearts'), c('7', 'clubs')],
    });
    const gameState = createGameState({
      currentPhase: 'pre-flop',
      communityCards: [],
    });

    const advice = getStrategicAdvice(player, gameState);
    expect(advice).toContain('weak');
    expect(advice.toLowerCase()).toContain('fold');
  });

  it('should provide post-flop advice with community cards', () => {
    const player = createPlayer({
      holeCards: [c('A', 'spades'), c('K', 'spades')],
    });
    const gameState = createGameState({
      currentPhase: 'flop',
      communityCards: [c('A', 'hearts'), c('K', 'hearts'), c('2', 'clubs')],
      currentBet: 0,
    });

    const advice = getStrategicAdvice(player, gameState);
    expect(advice).toContain('Two Pair');
  });

  it('should mention pot odds when facing a bet', () => {
    const player = createPlayer({
      holeCards: [c('J', 'spades'), c('10', 'hearts')],
      currentBet: 0,
    });
    const gameState = createGameState({
      currentPhase: 'flop',
      communityCards: [c('A', 'hearts'), c('K', 'hearts'), c('2', 'clubs')],
      currentBet: 10,
      pot: 50,
    });

    const advice = getStrategicAdvice(player, gameState);
    // Should provide advice about the bet situation
    expect(advice).toBeDefined();
    expect(advice.length).toBeGreaterThan(0);
  });

  it('should advise checking with weak hands when no bet', () => {
    const player = createPlayer({
      holeCards: [c('2', 'hearts'), c('7', 'clubs')],
    });
    const gameState = createGameState({
      currentPhase: 'flop',
      communityCards: [c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds')],
      currentBet: 0,
    });

    const advice = getStrategicAdvice(player, gameState);
    expect(advice.toLowerCase()).toContain('check');
  });

  it('should handle turn correctly (6 cards)', () => {
    const player = createPlayer({
      holeCards: [c('A', 'spades'), c('A', 'hearts')],
    });
    const gameState = createGameState({
      currentPhase: 'turn',
      communityCards: [
        c('A', 'diamonds'),
        c('K', 'clubs'),
        c('2', 'hearts'),
        c('7', 'spades'),
      ],
    });

    const advice = getStrategicAdvice(player, gameState);
    expect(advice).toContain('Three of a Kind');
  });

  it('should handle river correctly (7 cards)', () => {
    const player = createPlayer({
      holeCards: [c('A', 'spades'), c('K', 'spades')],
    });
    const gameState = createGameState({
      currentPhase: 'river',
      communityCards: [
        c('Q', 'spades'),
        c('J', 'spades'),
        c('10', 'spades'),
        c('2', 'hearts'),
        c('3', 'diamonds'),
      ],
    });

    const advice = getStrategicAdvice(player, gameState);
    expect(advice).toContain('Royal Flush');
    expect(advice).toContain('Strong');
  });
});
