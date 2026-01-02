/**
 * Utility functions for card and deck management.
 * Handles creating, shuffling, dealing, and displaying cards.
 */

import { Card } from '../types/game';
import { RANKS, SUITS, SUIT_SYMBOLS } from '../constants/cards';

/**
 * Creates a standard 52-card deck.
 * @returns An array of 52 cards (unshuffled)
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }

  return deck;
}

/**
 * Shuffles a deck using the Fisher-Yates algorithm.
 * This is an in-place shuffle that modifies the original array.
 * @param deck - The deck to shuffle
 * @returns The shuffled deck (same reference as input)
 */
export function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    // Generate random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at i and j
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Deals cards from the deck.
 * This removes cards from the deck and returns them.
 * @param deck - The deck to deal from (will be modified)
 * @param count - Number of cards to deal
 * @returns Array of dealt cards
 * @throws Error if trying to deal more cards than available
 */
export function dealCards(deck: Card[], count: number): Card[] {
  if (count > deck.length) {
    throw new Error(`Cannot deal ${count} cards from deck with only ${deck.length} cards remaining`);
  }

  // Remove and return cards from the end of the deck
  return deck.splice(-count, count);
}

/**
 * Converts a card to a human-readable string.
 * @param card - The card to convert
 * @returns String representation (e.g., "A♠", "K♥", "10♦")
 */
export function cardToString(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

/**
 * Converts an array of cards to a readable string.
 * @param cards - Array of cards
 * @returns String representation (e.g., "A♠ K♥ Q♦")
 */
export function cardsToString(cards: Card[]): string {
  return cards.map(cardToString).join(' ');
}

/**
 * Compares two cards for equality.
 * @param card1 - First card
 * @param card2 - Second card
 * @returns True if cards have the same rank and suit
 */
export function cardsEqual(card1: Card, card2: Card): boolean {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

/**
 * Creates a new shuffled deck ready for play.
 * Convenience function that combines createDeck and shuffleDeck.
 * @returns A shuffled 52-card deck
 */
export function createShuffledDeck(): Card[] {
  const deck = createDeck();
  return shuffleDeck(deck);
}
