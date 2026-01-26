/**
 * Core type definitions for the poker tutorial application.
 * These types define the structure of all game entities and state.
 */

/**
 * Card suits in a standard deck.
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/**
 * Card ranks in a standard deck.
 * Numeric ranks are represented as strings for consistency.
 */
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

/**
 * Represents a single playing card.
 */
export interface Card {
  /** The rank of the card (2-10, J, Q, K, A) */
  rank: Rank;
  /** The suit of the card (hearts, diamonds, clubs, spades) */
  suit: Suit;
}

/**
 * The phases of a poker hand.
 * Each phase represents a distinct stage in the game flow.
 */
export type GamePhase = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

/**
 * Available betting actions a player can take.
 */
export type BettingAction = 'fold' | 'call' | 'raise' | 'check';

/**
 * Rankings of poker hands from weakest to strongest.
 */
export enum HandRank {
  HighCard = 0,
  Pair = 1,
  TwoPair = 2,
  ThreeOfAKind = 3,
  Straight = 4,
  Flush = 5,
  FullHouse = 6,
  FourOfAKind = 7,
  StraightFlush = 8,
  RoyalFlush = 9,
}

/**
 * Evaluation result of a poker hand.
 * Contains the rank, the specific cards that make up the hand,
 * and a human-readable description.
 */
export interface HandEvaluation {
  /** The rank of the hand (e.g., Pair, Flush, etc.) */
  rank: HandRank;
  /** The five cards that make up the best hand */
  cards: Card[];
  /** Human-readable description (e.g., "Pair of Jacks", "Ace-high Straight") */
  description: string;
  /** The high card values used for comparison (e.g., for pair, includes pair rank and kickers) */
  values: number[];
}

/**
 * Represents a player in the game.
 */
export interface Player {
  /** Unique identifier for the player */
  id: string;
  /** Display name of the player */
  name: string;
  /** Current chip count */
  chips: number;
  /** The player's two hole cards (hidden from other players until showdown) */
  holeCards: Card[];
  /** Whether the player has folded in the current hand */
  isFolded: boolean;
  /** Whether this is the human user (vs AI) */
  isUser: boolean;
  /** Player's position at the table (0-3) */
  position: number;
  /** Amount the player has bet in the current betting round */
  currentBet: number;
  /** Total amount the player has contributed to the pot this hand */
  totalBet: number;
  /** Whether the player has acted in the current betting round */
  hasActed: boolean;
  /** Whether the player is all-in */
  isAllIn: boolean;
}

/**
 * Mode of gameplay.
 */
export type GameMode = 'tutorial' | 'training';

/**
 * Complete state of the poker game.
 * This is the single source of truth for the entire game.
 */
export interface GameState {
  /** All players in the game */
  players: Player[];
  /** Current pot amount */
  pot: number;
  /** The five community cards (revealed progressively) */
  communityCards: Card[];
  /** Current phase of the hand */
  currentPhase: GamePhase;
  /** Position of the dealer button (index in players array) */
  dealerPosition: number;
  /** Index of the player whose turn it is */
  currentPlayerIndex: number;
  /** The current bet amount that players must match to stay in */
  currentBet: number;
  /** Minimum raise amount (currentBet + bigBlind) */
  minRaise: number;
  /** Small blind amount */
  smallBlind: number;
  /** Big blind amount */
  bigBlind: number;
  /** The deck of remaining cards */
  deck: Card[];
  /** Current game mode */
  mode: GameMode;
  /** For tutorial mode: which hand (1-3) */
  tutorialHandNumber?: number;
  /** Whether the hand is complete and showing results */
  isHandComplete: boolean;
  /** Winner(s) of the current hand */
  winners: Player[];
  /** Winning hand evaluation(s) */
  winningHands: HandEvaluation[];
  /** Whether the game is currently transitioning between phases */
  isAdvancingPhase: boolean;
  /** Whether the game is paused waiting for user to click continue */
  isWaitingForContinue: boolean;
  /** Current narrator event to display (null if no modal showing) */
  pendingEvent: NarratorEvent | null;
  /** History of all actions taken in the current hand */
  actionHistory: ActionHistoryEntry[];
  /** Whether waiting for user to click Next to advance AI action */
  isWaitingForNextAction: boolean;
}

/**
 * Action payload for game state updates.
 */
export interface PlayerAction {
  /** The player taking the action */
  playerId: string;
  /** The action type */
  action: BettingAction;
  /** Amount for raise actions (optional) */
  amount?: number;
}


/**
 * Strength classification for a hand.
 */
export type HandStrength = 'weak' | 'medium' | 'strong';

/**
 * Types of narrator events that trigger the cowboy modal.
 */
export type NarratorEventType =
  | 'hand_start'      // Blinds posted, cards dealt
  | 'ai_action'       // AI player acted
  | 'user_action'     // User just acted (explain result)
  | 'phase_advance'   // Flop/turn/river dealt
  | 'showdown'        // Reveal hands
  | 'user_turn';      // Prompt user with advice

/**
 * Narrator event data for the cowboy modal.
 */
export interface NarratorEvent {
  /** Type of event being narrated */
  type: NarratorEventType;
  /** Cowboy's narration text */
  message: string;
  /** Who acted (for action events) */
  playerName?: string;
  /** What they did (for action events) */
  action?: string;
  /** Why they did it (for AI actions) */
  reasoning?: string;
  /** User's current hand strength (for user_turn events) */
  handStrength?: string;
  /** Strategic advice (for user_turn events) */
  advice?: string;
  /** Pre-calculated AI decision to execute on continue */
  pendingAction?: {
    playerId: string;
    action: BettingAction;
    amount?: number;
  };
}

/**
 * An entry in the action history log.
 */
export interface ActionHistoryEntry {
  /** Unique ID for the entry */
  id: number;
  /** The player who took the action */
  playerName: string;
  /** The player ID */
  playerId: string;
  /** The action taken */
  action: BettingAction;
  /** Amount for raises/calls */
  amount?: number;
  /** The game phase when action was taken */
  phase: GamePhase;
  /** Pot size after this action */
  potAfter: number;
  /** Timestamp when action occurred */
  timestamp: number;
  /** Whether this is a user action */
  isUser: boolean;
}
