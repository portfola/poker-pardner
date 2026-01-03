/**
 * Comprehensive unit tests for hand evaluation.
 * Tests all hand rankings, edge cases, and comparison logic.
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateHand,
  getBestFiveCardHand,
  getBestHandFromSix,
  compareHands,
  determineWinners,
} from './handEvaluator';
import { Card, HandRank } from '../types/game';

// Helper function to create cards quickly
function c(rank: string, suit: string): Card {
  return { rank, suit } as Card;
}

describe('evaluateHand', () => {
  it('should throw error for non-5-card hands', () => {
    expect(() => evaluateHand([c('A', 'spades')])).toThrow();
    expect(() => evaluateHand([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds')])).toThrow();
  });

  describe('Royal Flush', () => {
    it('should detect royal flush', () => {
      const hand = [c('A', 'spades'), c('K', 'spades'), c('Q', 'spades'), c('J', 'spades'), c('10', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.RoyalFlush);
      expect(result.description).toBe('Royal Flush');
    });

    it('should detect royal flush in any suit', () => {
      const hand = [c('A', 'hearts'), c('K', 'hearts'), c('Q', 'hearts'), c('J', 'hearts'), c('10', 'hearts')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.RoyalFlush);
    });
  });

  describe('Straight Flush', () => {
    it('should detect straight flush', () => {
      const hand = [c('9', 'clubs'), c('8', 'clubs'), c('7', 'clubs'), c('6', 'clubs'), c('5', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.StraightFlush);
      expect(result.description).toContain('9-high');
    });

    it('should detect ace-low straight flush (steel wheel)', () => {
      const hand = [c('A', 'diamonds'), c('2', 'diamonds'), c('3', 'diamonds'), c('4', 'diamonds'), c('5', 'diamonds')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.StraightFlush);
      expect(result.description).toContain('5-high');
    });

    it('should rank higher straight flush above lower', () => {
      const high = evaluateHand([c('9', 'clubs'), c('8', 'clubs'), c('7', 'clubs'), c('6', 'clubs'), c('5', 'clubs')]);
      const low = evaluateHand([c('7', 'spades'), c('6', 'spades'), c('5', 'spades'), c('4', 'spades'), c('3', 'spades')]);
      expect(compareHands(high, low)).toBeGreaterThan(0);
    });
  });

  describe('Four of a Kind', () => {
    it('should detect four of a kind', () => {
      const hand = [c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.FourOfAKind);
      expect(result.description).toContain('Ks');
    });

    it('should compare four of a kind by quad rank', () => {
      const aces = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('A', 'diamonds'), c('A', 'clubs'), c('3', 'spades')]);
      const kings = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')]);
      expect(compareHands(aces, kings)).toBeGreaterThan(0);
    });

    it('should use kicker when quads are equal', () => {
      const highKicker = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('A', 'spades')]);
      const lowKicker = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')]);
      expect(compareHands(highKicker, lowKicker)).toBeGreaterThan(0);
    });
  });

  describe('Full House', () => {
    it('should detect full house', () => {
      const hand = [c('A', 'spades'), c('A', 'hearts'), c('A', 'diamonds'), c('K', 'clubs'), c('K', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.FullHouse);
      expect(result.description).toContain('As over Ks');
    });

    it('should compare full houses by trips rank first', () => {
      const acesOverKings = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('A', 'diamonds'), c('K', 'clubs'), c('K', 'spades')]);
      const kingsOverAces = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('A', 'clubs'), c('A', 'spades')]);
      expect(compareHands(acesOverKings, kingsOverAces)).toBeGreaterThan(0);
    });

    it('should use pair rank when trips are equal', () => {
      const kingsOverAces = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('A', 'clubs'), c('A', 'spades')]);
      const kingsOverQueens = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('Q', 'clubs'), c('Q', 'spades')]);
      expect(compareHands(kingsOverAces, kingsOverQueens)).toBeGreaterThan(0);
    });
  });

  describe('Flush', () => {
    it('should detect flush', () => {
      const hand = [c('A', 'hearts'), c('J', 'hearts'), c('9', 'hearts'), c('6', 'hearts'), c('3', 'hearts')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.Flush);
      expect(result.description).toContain('A-high');
    });

    it('should compare flushes by high card', () => {
      const aceHigh = evaluateHand([c('A', 'hearts'), c('J', 'hearts'), c('9', 'hearts'), c('6', 'hearts'), c('3', 'hearts')]);
      const kingHigh = evaluateHand([c('K', 'spades'), c('J', 'spades'), c('9', 'spades'), c('6', 'spades'), c('3', 'spades')]);
      expect(compareHands(aceHigh, kingHigh)).toBeGreaterThan(0);
    });

    it('should use all kickers when comparing flushes', () => {
      const hand1 = evaluateHand([c('A', 'hearts'), c('K', 'hearts'), c('Q', 'hearts'), c('J', 'hearts'), c('9', 'hearts')]);
      const hand2 = evaluateHand([c('A', 'spades'), c('K', 'spades'), c('Q', 'spades'), c('J', 'spades'), c('8', 'spades')]);
      expect(compareHands(hand1, hand2)).toBeGreaterThan(0);
    });
  });

  describe('Straight', () => {
    it('should detect straight', () => {
      const hand = [c('9', 'clubs'), c('8', 'hearts'), c('7', 'diamonds'), c('6', 'spades'), c('5', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.Straight);
      expect(result.description).toContain('9-high');
    });

    it('should detect ace-high straight (Broadway)', () => {
      const hand = [c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('10', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.Straight);
      expect(result.description).toContain('A-high');
    });

    it('should detect ace-low straight (wheel)', () => {
      const hand = [c('A', 'spades'), c('2', 'hearts'), c('3', 'diamonds'), c('4', 'clubs'), c('5', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.Straight);
      expect(result.description).toContain('5-high');
    });

    it('should compare straights by high card', () => {
      const nineStraight = evaluateHand([c('9', 'clubs'), c('8', 'hearts'), c('7', 'diamonds'), c('6', 'spades'), c('5', 'clubs')]);
      const eightStraight = evaluateHand([c('8', 'clubs'), c('7', 'hearts'), c('6', 'diamonds'), c('5', 'spades'), c('4', 'clubs')]);
      expect(compareHands(nineStraight, eightStraight)).toBeGreaterThan(0);
    });

    it('should rank ace-high straight above ace-low straight', () => {
      const aceHigh = evaluateHand([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('10', 'spades')]);
      const aceLow = evaluateHand([c('A', 'spades'), c('2', 'hearts'), c('3', 'diamonds'), c('4', 'clubs'), c('5', 'spades')]);
      expect(compareHands(aceHigh, aceLow)).toBeGreaterThan(0);
    });
  });

  describe('Three of a Kind', () => {
    it('should detect three of a kind', () => {
      const hand = [c('Q', 'spades'), c('Q', 'hearts'), c('Q', 'diamonds'), c('7', 'clubs'), c('3', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.ThreeOfAKind);
      expect(result.description).toContain('Qs');
    });

    it('should compare by trips rank', () => {
      const aces = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('A', 'diamonds'), c('7', 'clubs'), c('3', 'spades')]);
      const kings = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('7', 'clubs'), c('3', 'spades')]);
      expect(compareHands(aces, kings)).toBeGreaterThan(0);
    });

    it('should use kickers when trips are equal', () => {
      const highKicker = evaluateHand([c('Q', 'spades'), c('Q', 'hearts'), c('Q', 'diamonds'), c('A', 'clubs'), c('K', 'spades')]);
      const lowKicker = evaluateHand([c('Q', 'spades'), c('Q', 'hearts'), c('Q', 'diamonds'), c('7', 'clubs'), c('3', 'spades')]);
      expect(compareHands(highKicker, lowKicker)).toBeGreaterThan(0);
    });
  });

  describe('Two Pair', () => {
    it('should detect two pair', () => {
      const hand = [c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.TwoPair);
      expect(result.description).toContain('As and Ks');
    });

    it('should compare by high pair first', () => {
      const acesAndKings = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')]);
      const kingsAndQueens = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('Q', 'clubs'), c('3', 'spades')]);
      expect(compareHands(acesAndKings, kingsAndQueens)).toBeGreaterThan(0);
    });

    it('should use low pair when high pairs are equal', () => {
      const acesAndKings = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')]);
      const acesAndQueens = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('Q', 'diamonds'), c('Q', 'clubs'), c('3', 'spades')]);
      expect(compareHands(acesAndKings, acesAndQueens)).toBeGreaterThan(0);
    });

    it('should use kicker when both pairs are equal', () => {
      const highKicker = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('Q', 'spades')]);
      const lowKicker = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')]);
      expect(compareHands(highKicker, lowKicker)).toBeGreaterThan(0);
    });
  });

  describe('One Pair', () => {
    it('should detect one pair', () => {
      const hand = [c('J', 'spades'), c('J', 'hearts'), c('9', 'diamonds'), c('6', 'clubs'), c('3', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.Pair);
      expect(result.description).toContain('Pair of Js');
    });

    it('should compare by pair rank', () => {
      const aces = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('9', 'diamonds'), c('6', 'clubs'), c('3', 'spades')]);
      const kings = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('9', 'diamonds'), c('6', 'clubs'), c('3', 'spades')]);
      expect(compareHands(aces, kings)).toBeGreaterThan(0);
    });

    it('should use all three kickers when pairs are equal', () => {
      const hand1 = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('Q', 'clubs'), c('J', 'spades')]);
      const hand2 = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('Q', 'clubs'), c('10', 'spades')]);
      expect(compareHands(hand1, hand2)).toBeGreaterThan(0);
    });
  });

  describe('High Card', () => {
    it('should detect high card', () => {
      const hand = [c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('9', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe(HandRank.HighCard);
      expect(result.description).toContain('A');
    });

    it('should compare by all cards in order', () => {
      const hand1 = evaluateHand([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('9', 'spades')]);
      const hand2 = evaluateHand([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('8', 'spades')]);
      expect(compareHands(hand1, hand2)).toBeGreaterThan(0);
    });

    it('should detect tie with identical high cards', () => {
      const hand1 = evaluateHand([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('9', 'spades')]);
      const hand2 = evaluateHand([c('A', 'hearts'), c('K', 'spades'), c('Q', 'clubs'), c('J', 'diamonds'), c('9', 'hearts')]);
      expect(compareHands(hand1, hand2)).toBe(0);
    });
  });

  describe('Hand Ranking Hierarchy', () => {
    it('should rank hands in correct order', () => {
      const royalFlush = evaluateHand([c('A', 'spades'), c('K', 'spades'), c('Q', 'spades'), c('J', 'spades'), c('10', 'spades')]);
      const straightFlush = evaluateHand([c('9', 'clubs'), c('8', 'clubs'), c('7', 'clubs'), c('6', 'clubs'), c('5', 'clubs')]);
      const fourOfAKind = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')]);
      const fullHouse = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('A', 'diamonds'), c('K', 'clubs'), c('K', 'spades')]);
      const flush = evaluateHand([c('A', 'hearts'), c('J', 'hearts'), c('9', 'hearts'), c('6', 'hearts'), c('3', 'hearts')]);
      const straight = evaluateHand([c('9', 'clubs'), c('8', 'hearts'), c('7', 'diamonds'), c('6', 'spades'), c('5', 'clubs')]);
      const threeOfAKind = evaluateHand([c('Q', 'spades'), c('Q', 'hearts'), c('Q', 'diamonds'), c('7', 'clubs'), c('3', 'spades')]);
      const twoPair = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('K', 'clubs'), c('3', 'spades')]);
      const onePair = evaluateHand([c('J', 'spades'), c('J', 'hearts'), c('9', 'diamonds'), c('6', 'clubs'), c('3', 'spades')]);
      const highCard = evaluateHand([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('9', 'spades')]);

      expect(compareHands(royalFlush, straightFlush)).toBeGreaterThan(0);
      expect(compareHands(straightFlush, fourOfAKind)).toBeGreaterThan(0);
      expect(compareHands(fourOfAKind, fullHouse)).toBeGreaterThan(0);
      expect(compareHands(fullHouse, flush)).toBeGreaterThan(0);
      expect(compareHands(flush, straight)).toBeGreaterThan(0);
      expect(compareHands(straight, threeOfAKind)).toBeGreaterThan(0);
      expect(compareHands(threeOfAKind, twoPair)).toBeGreaterThan(0);
      expect(compareHands(twoPair, onePair)).toBeGreaterThan(0);
      expect(compareHands(onePair, highCard)).toBeGreaterThan(0);
    });
  });
});

describe('getBestFiveCardHand', () => {
  it('should throw error if not given 7 cards', () => {
    expect(() => getBestFiveCardHand([c('A', 'spades'), c('K', 'hearts')], [c('Q', 'diamonds')])).toThrow();
  });

  it('should find best hand when both hole cards are used', () => {
    const holeCards = [c('A', 'spades'), c('A', 'hearts')];
    const communityCards = [c('A', 'diamonds'), c('K', 'clubs'), c('K', 'spades'), c('2', 'hearts'), c('3', 'clubs')];
    const result = getBestFiveCardHand(holeCards, communityCards);
    expect(result.rank).toBe(HandRank.FullHouse);
  });

  it('should find best hand when only one hole card is used', () => {
    const holeCards = [c('A', 'spades'), c('2', 'hearts')];
    const communityCards = [c('K', 'spades'), c('Q', 'spades'), c('J', 'spades'), c('10', 'spades'), c('3', 'clubs')];
    const result = getBestFiveCardHand(holeCards, communityCards);
    // A-K-Q-J-10 of spades is a Royal Flush
    expect(result.rank).toBe(HandRank.RoyalFlush);
  });

  it('should find best hand when no hole cards are used (playing the board)', () => {
    const holeCards = [c('2', 'hearts'), c('3', 'clubs')];
    const communityCards = [c('A', 'spades'), c('A', 'hearts'), c('A', 'diamonds'), c('A', 'clubs'), c('K', 'spades')];
    const result = getBestFiveCardHand(holeCards, communityCards);
    expect(result.rank).toBe(HandRank.FourOfAKind);
  });

  it('should correctly evaluate flush over straight when both are possible', () => {
    const holeCards = [c('A', 'hearts'), c('K', 'hearts')];
    const communityCards = [c('Q', 'hearts'), c('J', 'hearts'), c('10', 'hearts'), c('9', 'spades'), c('8', 'clubs')];
    const result = getBestFiveCardHand(holeCards, communityCards);
    // Should find royal flush, not just flush or straight
    expect(result.rank).toBe(HandRank.RoyalFlush);
  });

  it('should find best combination from 7 cards', () => {
    const holeCards = [c('7', 'hearts'), c('6', 'hearts')];
    const communityCards = [c('5', 'hearts'), c('4', 'hearts'), c('3', 'hearts'), c('A', 'spades'), c('K', 'clubs')];
    const result = getBestFiveCardHand(holeCards, communityCards);
    expect(result.rank).toBe(HandRank.StraightFlush);
  });
});

describe('getBestHandFromSix', () => {
  it('should throw error for non-6-card input', () => {
    expect(() => getBestHandFromSix([c('A', 'spades'), c('K', 'hearts')])).toThrow('exactly 6 cards');
    expect(() => getBestHandFromSix([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('10', 'spades')])).toThrow('exactly 6 cards');
    expect(() => getBestHandFromSix([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('10', 'spades'), c('9', 'hearts'), c('8', 'clubs')])).toThrow('exactly 6 cards');
  });

  it('should find best 5-card hand from 6 cards', () => {
    // 6 cards where we have three Aces + K, Q, 2
    // Best hand is Aces with K and Q kickers
    const cards = [
      c('A', 'spades'), c('A', 'hearts'), c('A', 'diamonds'),
      c('K', 'clubs'), c('Q', 'spades'), c('2', 'hearts')
    ];
    const result = getBestHandFromSix(cards);

    expect(result.rank).toBe(HandRank.ThreeOfAKind);
    expect(result.description).toContain('As');
  });

  it('should correctly drop the weakest card', () => {
    // Flush draw: 5 hearts + 1 spade
    // Best hand drops the spade and makes flush
    const cards = [
      c('A', 'hearts'), c('K', 'hearts'), c('Q', 'hearts'),
      c('J', 'hearts'), c('9', 'hearts'), c('2', 'spades')
    ];
    const result = getBestHandFromSix(cards);

    expect(result.rank).toBe(HandRank.Flush);
    expect(result.description).toContain('A-high');
  });

  it('should find best hand when one specific card must be dropped', () => {
    // Cards: A♠ K♠ Q♠ J♠ 10♠ 9♦
    // Best hand is Royal Flush (drops the 9♦)
    const cards = [
      c('A', 'spades'), c('K', 'spades'), c('Q', 'spades'),
      c('J', 'spades'), c('10', 'spades'), c('9', 'diamonds')
    ];
    const result = getBestHandFromSix(cards);

    expect(result.rank).toBe(HandRank.RoyalFlush);
  });

  it('should find straight when dropping one card breaks a pair', () => {
    // Cards: 9♥ 8♣ 7♦ 6♠ 5♥ 5♣
    // Best hand is straight 9-high (drops one 5)
    const cards = [
      c('9', 'hearts'), c('8', 'clubs'), c('7', 'diamonds'),
      c('6', 'spades'), c('5', 'hearts'), c('5', 'clubs')
    ];
    const result = getBestHandFromSix(cards);

    expect(result.rank).toBe(HandRank.Straight);
    expect(result.description).toContain('9-high');
  });

  it('should find two pair when three pairs are available', () => {
    // Cards: A♠ A♥ K♦ K♣ Q♠ Q♥
    // Best hand is Aces and Kings (drops Queens)
    const cards = [
      c('A', 'spades'), c('A', 'hearts'),
      c('K', 'diamonds'), c('K', 'clubs'),
      c('Q', 'spades'), c('Q', 'hearts')
    ];
    const result = getBestHandFromSix(cards);

    expect(result.rank).toBe(HandRank.TwoPair);
    expect(result.description).toContain('As and Ks');
  });

  it('should prefer full house over two pair', () => {
    // Cards: A♠ A♥ A♦ K♣ K♠ Q♥
    // Best hand is Full House Aces over Kings (drops Q)
    const cards = [
      c('A', 'spades'), c('A', 'hearts'), c('A', 'diamonds'),
      c('K', 'clubs'), c('K', 'spades'), c('Q', 'hearts')
    ];
    const result = getBestHandFromSix(cards);

    expect(result.rank).toBe(HandRank.FullHouse);
    expect(result.description).toContain('As over Ks');
  });

  it('should handle ace-low straight from 6 cards', () => {
    // Cards: A♠ 5♥ 4♦ 3♣ 2♠ K♥
    // Best hand is wheel (A-2-3-4-5), drops K
    const cards = [
      c('A', 'spades'), c('5', 'hearts'), c('4', 'diamonds'),
      c('3', 'clubs'), c('2', 'spades'), c('K', 'hearts')
    ];
    const result = getBestHandFromSix(cards);

    expect(result.rank).toBe(HandRank.Straight);
    expect(result.description).toContain('5-high');
  });

  it('should maximize kickers when hand rank is the same', () => {
    // Cards: A♠ A♥ K♦ Q♣ J♠ 2♥
    // Best hand is pair of Aces with K, Q, J (drops 2)
    const cards = [
      c('A', 'spades'), c('A', 'hearts'),
      c('K', 'diamonds'), c('Q', 'clubs'),
      c('J', 'spades'), c('2', 'hearts')
    ];
    const result = getBestHandFromSix(cards);

    expect(result.rank).toBe(HandRank.Pair);
    // Should include K, Q, J as kickers (not 2)
    expect(result.values[0]).toBe(14); // Ace pair
    expect(result.values[1]).toBe(13); // King kicker
    expect(result.values[2]).toBe(12); // Queen kicker
    expect(result.values[3]).toBe(11); // Jack kicker
  });
});

describe('determineWinners', () => {
  it('should return empty array for no hands', () => {
    expect(determineWinners([])).toEqual([]);
  });

  it('should return single winner', () => {
    const hand1 = evaluateHand([c('A', 'spades'), c('A', 'hearts'), c('K', 'diamonds'), c('Q', 'clubs'), c('J', 'spades')]);
    const hand2 = evaluateHand([c('K', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('10', 'spades')]);
    const hand3 = evaluateHand([c('Q', 'spades'), c('Q', 'hearts'), c('J', 'diamonds'), c('10', 'clubs'), c('9', 'spades')]);
    const winners = determineWinners([hand1, hand2, hand3]);
    expect(winners).toEqual([0]);
  });

  it('should return multiple winners in case of tie', () => {
    const hand1 = evaluateHand([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('9', 'spades')]);
    const hand2 = evaluateHand([c('A', 'hearts'), c('K', 'spades'), c('Q', 'clubs'), c('J', 'diamonds'), c('9', 'hearts')]);
    const hand3 = evaluateHand([c('A', 'diamonds'), c('K', 'clubs'), c('Q', 'spades'), c('J', 'hearts'), c('8', 'clubs')]);
    const winners = determineWinners([hand1, hand2, hand3]);
    expect(winners).toEqual([0, 1]);
  });

  it('should handle all players with same hand', () => {
    const hand = evaluateHand([c('A', 'spades'), c('K', 'hearts'), c('Q', 'diamonds'), c('J', 'clubs'), c('10', 'spades')]);
    const winners = determineWinners([hand, hand, hand, hand]);
    expect(winners).toEqual([0, 1, 2, 3]);
  });
});
