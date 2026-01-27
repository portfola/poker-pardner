/**
 * Type definitions for hand history tracking.
 * Stores completed hands for review and learning purposes.
 */

import { Card, GamePhase, HandEvaluation, ActionHistoryEntry } from './game';

/**
 * Player state at showdown.
 */
export interface HandHistoryPlayer {
  /** Player ID */
  id: string;
  /** Player name */
  name: string;
  /** Whether this was the user */
  isUser: boolean;
  /** Player's hole cards */
  holeCards: Card[];
  /** Player's best hand evaluation (if reached showdown and didn't fold) */
  handEvaluation?: HandEvaluation;
  /** Final chip count after hand */
  finalChips: number;
  /** Amount won/lost in this hand */
  chipChange: number;
  /** Whether player folded */
  folded: boolean;
  /** Whether player went all-in */
  wentAllIn: boolean;
}

/**
 * Complete record of a single completed hand.
 */
export interface HandHistoryRecord {
  /** Unique identifier for this hand */
  id: string;
  /** Timestamp when hand was completed */
  timestamp: number;
  /** Hand number in sequence (for display) */
  handNumber: number;
  /** Community cards dealt */
  communityCards: Card[];
  /** Final phase reached before hand ended */
  finalPhase: GamePhase;
  /** Total pot size */
  potSize: number;
  /** All players in the hand */
  players: HandHistoryPlayer[];
  /** IDs of winner(s) */
  winnerIds: string[];
  /** Names of winner(s) */
  winnerNames: string[];
  /** Winning hand evaluation(s) */
  winningHands: HandEvaluation[];
  /** Complete action history for the hand */
  actions: ActionHistoryEntry[];
  /** Whether the hand reached showdown */
  reachedShowdown: boolean;
  /** User's chip count at start of hand */
  userStartingChips: number;
  /** User's chip count at end of hand */
  userEndingChips: number;
  /** User's net chip change */
  userChipChange: number;
  /** Whether user won this hand */
  userWon: boolean;
  /** Whether user folded this hand */
  userFolded: boolean;
}

/**
 * Statistics derived from hand history.
 */
export interface HandHistoryStats {
  /** Total hands played */
  totalHands: number;
  /** Hands won by user */
  handsWon: number;
  /** Hands lost by user */
  handsLost: number;
  /** Hands where user folded */
  handsFolded: number;
  /** Hands that reached showdown */
  showdownHands: number;
  /** Win rate percentage (0-100) */
  winRate: number;
  /** Total chips won */
  totalChipsWon: number;
  /** Total chips lost */
  totalChipsLost: number;
  /** Net profit/loss */
  netProfit: number;
  /** Average pot size */
  averagePot: number;
  /** Fold percentage (0-100) */
  foldRate: number;
  /** Showdown percentage (0-100) */
  showdownRate: number;
}
