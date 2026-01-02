/**
 * Unit tests for card utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  createDeck,
  shuffleDeck,
  dealCards,
  cardToString,
  cardsToString,
  cardsEqual,
  createShuffledDeck,
} from './cards';
import { Card } from '../types/game';

describe('createDeck', () => {
  it('should create a deck with 52 cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
  });

  it('should contain all 13 ranks for each suit', () => {
    const deck = createDeck();
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

    suits.forEach(suit => {
      ranks.forEach(rank => {
        const cardExists = deck.some(card => card.rank === rank && card.suit === suit);
        expect(cardExists).toBe(true);
      });
    });
  });

  it('should not contain duplicate cards', () => {
    const deck = createDeck();
    const cardStrings = deck.map(card => `${card.rank}-${card.suit}`);
    const uniqueCards = new Set(cardStrings);
    expect(uniqueCards.size).toBe(52);
  });
});

describe('shuffleDeck', () => {
  it('should maintain deck size after shuffling', () => {
    const deck = createDeck();
    const originalLength = deck.length;
    shuffleDeck(deck);
    expect(deck).toHaveLength(originalLength);
  });

  it('should contain the same cards after shuffling', () => {
    const deck = createDeck();
    const originalCards = deck.map(card => `${card.rank}-${card.suit}`).sort();
    shuffleDeck(deck);
    const shuffledCards = deck.map(card => `${card.rank}-${card.suit}`).sort();
    expect(shuffledCards).toEqual(originalCards);
  });

  it('should likely produce a different order (statistical test)', () => {
    // This test could rarely fail due to randomness, but probability is extremely low
    const deck1 = createDeck();
    const deck2 = [...deck1]; // Copy
    shuffleDeck(deck1);

    // Check if at least some cards are in different positions
    let differentPositions = 0;
    for (let i = 0; i < deck1.length; i++) {
      if (!cardsEqual(deck1[i], deck2[i])) {
        differentPositions++;
      }
    }

    // Expect at least 40 out of 52 cards to be in different positions
    expect(differentPositions).toBeGreaterThan(40);
  });
});

describe('dealCards', () => {
  it('should deal the requested number of cards', () => {
    const deck = createDeck();
    const dealtCards = dealCards(deck, 5);
    expect(dealtCards).toHaveLength(5);
  });

  it('should remove dealt cards from the deck', () => {
    const deck = createDeck();
    const originalLength = deck.length;
    dealCards(deck, 5);
    expect(deck).toHaveLength(originalLength - 5);
  });

  it('should deal cards from the end of the deck', () => {
    const deck = createDeck();
    const lastCard = deck[deck.length - 1];
    const dealtCards = dealCards(deck, 1);
    expect(cardsEqual(dealtCards[0], lastCard)).toBe(true);
  });

  it('should throw error when trying to deal more cards than available', () => {
    const deck = createDeck();
    expect(() => dealCards(deck, 53)).toThrow();
  });

  it('should handle dealing all remaining cards', () => {
    const deck = createDeck();
    const allCards = dealCards(deck, 52);
    expect(allCards).toHaveLength(52);
    expect(deck).toHaveLength(0);
  });
});

describe('cardToString', () => {
  it('should convert card to readable string format', () => {
    const card: Card = { rank: 'A', suit: 'spades' };
    expect(cardToString(card)).toBe('A♠');
  });

  it('should handle all suits correctly', () => {
    expect(cardToString({ rank: 'K', suit: 'hearts' })).toBe('K♥');
    expect(cardToString({ rank: 'Q', suit: 'diamonds' })).toBe('Q♦');
    expect(cardToString({ rank: 'J', suit: 'clubs' })).toBe('J♣');
    expect(cardToString({ rank: '10', suit: 'spades' })).toBe('10♠');
  });

  it('should handle numeric ranks', () => {
    expect(cardToString({ rank: '2', suit: 'hearts' })).toBe('2♥');
    expect(cardToString({ rank: '10', suit: 'diamonds' })).toBe('10♦');
  });
});

describe('cardsToString', () => {
  it('should convert multiple cards to space-separated string', () => {
    const cards: Card[] = [
      { rank: 'A', suit: 'spades' },
      { rank: 'K', suit: 'hearts' },
      { rank: 'Q', suit: 'diamonds' },
    ];
    expect(cardsToString(cards)).toBe('A♠ K♥ Q♦');
  });

  it('should handle empty array', () => {
    expect(cardsToString([])).toBe('');
  });

  it('should handle single card', () => {
    const cards: Card[] = [{ rank: 'A', suit: 'spades' }];
    expect(cardsToString(cards)).toBe('A♠');
  });
});

describe('cardsEqual', () => {
  it('should return true for identical cards', () => {
    const card1: Card = { rank: 'A', suit: 'spades' };
    const card2: Card = { rank: 'A', suit: 'spades' };
    expect(cardsEqual(card1, card2)).toBe(true);
  });

  it('should return false for different ranks', () => {
    const card1: Card = { rank: 'A', suit: 'spades' };
    const card2: Card = { rank: 'K', suit: 'spades' };
    expect(cardsEqual(card1, card2)).toBe(false);
  });

  it('should return false for different suits', () => {
    const card1: Card = { rank: 'A', suit: 'spades' };
    const card2: Card = { rank: 'A', suit: 'hearts' };
    expect(cardsEqual(card1, card2)).toBe(false);
  });

  it('should return false for completely different cards', () => {
    const card1: Card = { rank: 'A', suit: 'spades' };
    const card2: Card = { rank: 'K', suit: 'hearts' };
    expect(cardsEqual(card1, card2)).toBe(false);
  });
});

describe('createShuffledDeck', () => {
  it('should create a deck with 52 cards', () => {
    const deck = createShuffledDeck();
    expect(deck).toHaveLength(52);
  });

  it('should contain all unique cards', () => {
    const deck = createShuffledDeck();
    const cardStrings = deck.map(card => `${card.rank}-${card.suit}`);
    const uniqueCards = new Set(cardStrings);
    expect(uniqueCards.size).toBe(52);
  });

  it('should produce different orders on multiple calls', () => {
    const deck1 = createShuffledDeck();
    const deck2 = createShuffledDeck();

    // It's statistically impossible for two shuffled decks to be identical
    let differentPositions = 0;
    for (let i = 0; i < deck1.length; i++) {
      if (!cardsEqual(deck1[i], deck2[i])) {
        differentPositions++;
      }
    }

    expect(differentPositions).toBeGreaterThan(40);
  });
});
