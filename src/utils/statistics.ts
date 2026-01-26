/**
 * Utility functions for tracking and persisting player statistics.
 * Statistics are stored in localStorage for continuity across sessions.
 */

import { DifficultyLevel, GameMode } from '../types/game';
import { PlayerStatistics, GameModeStats, HandResult } from '../types/statistics';

const STORAGE_KEY = 'poker-pardner-stats';

/**
 * Creates a new empty statistics object for a specific mode/difficulty.
 */
function createEmptyStats(): GameModeStats {
  return {
    handsPlayed: 0,
    handsWon: 0,
    biggestPot: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalWinnings: 0,
    totalLosses: 0,
    allInsCount: 0,
    foldCount: 0,
  };
}

/**
 * Creates a new empty player statistics object.
 */
function createEmptyPlayerStats(): PlayerStatistics {
  const now = Date.now();
  return {
    byModeAndDifficulty: {},
    createdAt: now,
    lastUpdated: now,
    sessionsPlayed: 0,
  };
}

/**
 * Loads player statistics from localStorage.
 * Returns empty statistics if none exist or if data is corrupted.
 */
export function loadStatistics(): PlayerStatistics {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyPlayerStats();
    }

    const parsed = JSON.parse(stored) as PlayerStatistics;

    // Validate that the stored data has the expected structure
    if (!parsed.byModeAndDifficulty || typeof parsed.createdAt !== 'number') {
      console.warn('Invalid statistics data in localStorage, resetting');
      return createEmptyPlayerStats();
    }

    return parsed;
  } catch (error) {
    console.error('Error loading statistics from localStorage:', error);
    return createEmptyPlayerStats();
  }
}

/**
 * Saves player statistics to localStorage.
 */
export function saveStatistics(stats: PlayerStatistics): void {
  try {
    stats.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving statistics to localStorage:', error);
  }
}

/**
 * Gets or creates statistics for a specific mode and difficulty.
 */
function getOrCreateModeStats(
  stats: PlayerStatistics,
  mode: GameMode,
  difficulty: DifficultyLevel
): GameModeStats {
  if (!stats.byModeAndDifficulty[mode]) {
    stats.byModeAndDifficulty[mode] = {};
  }

  if (!stats.byModeAndDifficulty[mode]![difficulty]) {
    stats.byModeAndDifficulty[mode]![difficulty] = createEmptyStats();
  }

  return stats.byModeAndDifficulty[mode]![difficulty]!;
}

/**
 * Updates statistics based on the result of a completed hand.
 */
export function updateHandStatistics(result: HandResult): void {
  const stats = loadStatistics();
  const modeStats = getOrCreateModeStats(stats, result.mode, result.difficulty);

  // Update hand count
  modeStats.handsPlayed++;

  // Update win/loss tracking
  if (result.won) {
    modeStats.handsWon++;
    modeStats.currentStreak++;
    modeStats.totalWinnings += result.amount;

    // Update best streak if current streak is higher
    if (modeStats.currentStreak > modeStats.bestStreak) {
      modeStats.bestStreak = modeStats.currentStreak;
    }

    // Update biggest pot if this pot is larger
    if (result.amount > modeStats.biggestPot) {
      modeStats.biggestPot = result.amount;
    }
  } else {
    // Reset streak on loss
    modeStats.currentStreak = 0;
    modeStats.totalLosses += Math.abs(result.amount);
  }

  // Update action counts
  if (result.folded) {
    modeStats.foldCount++;
  }

  if (result.wentAllIn) {
    modeStats.allInsCount++;
  }

  saveStatistics(stats);
}

/**
 * Increments the session counter when a new game session starts.
 */
export function incrementSessionCount(): void {
  const stats = loadStatistics();
  stats.sessionsPlayed++;
  saveStatistics(stats);
}

/**
 * Gets statistics for a specific mode and difficulty.
 * Returns empty stats if none exist yet.
 */
export function getStatistics(mode: GameMode, difficulty: DifficultyLevel): GameModeStats {
  const stats = loadStatistics();
  return getOrCreateModeStats(stats, mode, difficulty);
}

/**
 * Gets all statistics for all modes and difficulties.
 */
export function getAllStatistics(): PlayerStatistics {
  return loadStatistics();
}

/**
 * Calculates win rate percentage for a specific mode and difficulty.
 */
export function calculateWinRate(mode: GameMode, difficulty: DifficultyLevel): number {
  const stats = getStatistics(mode, difficulty);
  if (stats.handsPlayed === 0) {
    return 0;
  }
  return (stats.handsWon / stats.handsPlayed) * 100;
}

/**
 * Calculates net profit/loss for a specific mode and difficulty.
 */
export function calculateNetProfit(mode: GameMode, difficulty: DifficultyLevel): number {
  const stats = getStatistics(mode, difficulty);
  return stats.totalWinnings - stats.totalLosses;
}

/**
 * Resets all statistics (useful for testing or starting fresh).
 */
export function resetStatistics(): void {
  const stats = createEmptyPlayerStats();
  saveStatistics(stats);
}

/**
 * Exports statistics as JSON string for backup/sharing.
 */
export function exportStatistics(): string {
  const stats = loadStatistics();
  return JSON.stringify(stats, null, 2);
}

/**
 * Imports statistics from JSON string.
 * Validates the data before importing.
 */
export function importStatistics(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as PlayerStatistics;

    // Validate structure
    if (!parsed.byModeAndDifficulty || typeof parsed.createdAt !== 'number') {
      console.error('Invalid statistics format');
      return false;
    }

    saveStatistics(parsed);
    return true;
  } catch (error) {
    console.error('Error importing statistics:', error);
    return false;
  }
}
