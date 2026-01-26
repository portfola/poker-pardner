/**
 * Type definitions for player statistics and progress tracking.
 * Statistics are persisted to localStorage for continuity across sessions.
 */

import { DifficultyLevel, GameMode } from './game';

/**
 * Statistics for a single game mode and difficulty combination.
 */
export interface GameModeStats {
  /** Total number of hands played */
  handsPlayed: number;
  /** Number of hands won */
  handsWon: number;
  /** Largest pot ever won */
  biggestPot: number;
  /** Current winning streak */
  currentStreak: number;
  /** Best winning streak ever achieved */
  bestStreak: number;
  /** Total amount won across all hands */
  totalWinnings: number;
  /** Total amount lost across all hands */
  totalLosses: number;
  /** Number of times the player went all-in */
  allInsCount: number;
  /** Number of times the player folded */
  foldCount: number;
}

/**
 * Complete statistics for all game modes and difficulties.
 */
export interface PlayerStatistics {
  /** Statistics by mode and difficulty */
  byModeAndDifficulty: {
    [key in GameMode]?: {
      [key in DifficultyLevel]?: GameModeStats;
    };
  };
  /** When statistics were first created */
  createdAt: number;
  /** Last time statistics were updated */
  lastUpdated: number;
  /** Total number of sessions played */
  sessionsPlayed: number;
}

/**
 * Data from a completed hand to update statistics.
 */
export interface HandResult {
  /** Whether the user won this hand */
  won: boolean;
  /** Amount won or lost (positive for win, negative for loss) */
  amount: number;
  /** Whether the user folded */
  folded: boolean;
  /** Whether the user went all-in */
  wentAllIn: boolean;
  /** Current game mode */
  mode: GameMode;
  /** Current difficulty level */
  difficulty: DifficultyLevel;
}
