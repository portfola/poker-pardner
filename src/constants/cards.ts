/**
 * Constants for card ranks, suits, and symbols.
 * These are used throughout the application for card handling and display.
 */

import { Rank, Suit } from '../types/game';

/**
 * All card ranks in order from lowest to highest.
 */
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * All card suits.
 */
export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * Unicode symbols for each suit.
 */
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

/**
 * Colors for each suit (for styling).
 */
export const SUIT_COLORS: Record<Suit, 'red' | 'black'> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
};

/**
 * Symbol for card back (when card is face down).
 */
export const CARD_BACK_SYMBOL = '🂠';

/**
 * Numeric values for ranks (used in hand evaluation).
 * Ace can be 1 or 14 depending on context (handled in evaluation logic).
 */
export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};
