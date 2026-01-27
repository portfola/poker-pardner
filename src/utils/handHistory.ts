/**
 * Hand history tracking and storage utility.
 * Manages recording completed hands and calculating statistics.
 */

import { GameState, Player, HandEvaluation } from '../types/game';
import { HandHistoryRecord, HandHistoryPlayer, HandHistoryStats } from '../types/handHistory';
import { logger } from './logger';

/** Maximum number of hands to store */
const MAX_STORED_HANDS = 10;

/** LocalStorage key for hand history */
const STORAGE_KEY = 'poker_hand_history';

/** Global hand counter (persisted across sessions) */
let handCounter = 0;

/**
 * Initialize the hand counter from localStorage.
 */
function initHandCounter(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const history: HandHistoryRecord[] = JSON.parse(stored);
      if (history.length > 0) {
        // Set counter to highest hand number + 1
        handCounter = Math.max(...history.map(h => h.handNumber)) + 1;
      }
    }
  } catch (error) {
    logger.error('Failed to initialize hand counter:', error);
  }
}

// Initialize on module load
initHandCounter();

/**
 * Convert a GameState player to a HandHistoryPlayer.
 */
function createHandHistoryPlayer(
  player: Player,
  chipsBefore: number,
  handEvaluation?: HandEvaluation
): HandHistoryPlayer {
  return {
    id: player.id,
    name: player.name,
    isUser: player.isUser,
    holeCards: [...player.holeCards],
    handEvaluation,
    finalChips: player.chips,
    chipChange: player.chips - chipsBefore,
    folded: player.isFolded,
    wentAllIn: player.isAllIn,
  };
}

/**
 * Record a completed hand to history.
 * Called at the end of each hand after showdown/winner determination.
 *
 * @param gameState - The final game state at hand completion
 * @param playersStartChips - Map of player IDs to their chip counts at hand start
 * @param winningHands - Array of winning hand evaluations
 * @returns The created hand history record
 */
export function recordHand(
  gameState: GameState,
  playersStartChips: Map<string, number>,
  winningHands: HandEvaluation[]
): HandHistoryRecord {
  const user = gameState.players.find(p => p.isUser);
  if (!user) {
    throw new Error('User player not found in game state');
  }

  const userStartChips = playersStartChips.get(user.id) ?? user.chips;
  const userEndChips = user.chips;
  const userChipChange = userEndChips - userStartChips;

  // Create hand history players with chip change information
  const historyPlayers: HandHistoryPlayer[] = gameState.players.map(player => {
    const startChips = playersStartChips.get(player.id) ?? player.chips;
    const handEvaluation = gameState.winningHands.find((_, idx) =>
      gameState.winners[idx]?.id === player.id
    );
    return createHandHistoryPlayer(player, startChips, handEvaluation);
  });

  const record: HandHistoryRecord = {
    id: `hand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    handNumber: handCounter++,
    communityCards: [...gameState.communityCards],
    finalPhase: gameState.currentPhase,
    potSize: gameState.pot,
    players: historyPlayers,
    winnerIds: gameState.winners.map(w => w.id),
    winnerNames: gameState.winners.map(w => w.name),
    winningHands: winningHands.map(hand => ({
      ...hand,
      cards: [...hand.cards],
      values: [...hand.values],
    })),
    actions: gameState.actionHistory.map(action => ({ ...action })),
    reachedShowdown: gameState.currentPhase === 'showdown',
    userStartingChips: userStartChips,
    userEndingChips: userEndChips,
    userChipChange,
    userWon: gameState.winners.some(w => w.id === user.id),
    userFolded: user.isFolded,
  };

  // Store the record
  storeHandRecord(record);

  logger.log('Hand recorded:', {
    handNumber: record.handNumber,
    pot: record.potSize,
    winners: record.winnerNames,
    userChange: userChipChange,
  });

  return record;
}

/**
 * Store a hand record to localStorage.
 * Maintains a maximum of MAX_STORED_HANDS records (FIFO).
 */
function storeHandRecord(record: HandHistoryRecord): void {
  try {
    const history = getHandHistory();
    history.push(record);

    // Keep only the last MAX_STORED_HANDS hands
    if (history.length > MAX_STORED_HANDS) {
      history.shift(); // Remove oldest
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    logger.error('Failed to store hand record:', error);
  }
}

/**
 * Retrieve all stored hand history records.
 * Returns most recent hands first.
 *
 * @returns Array of hand history records (newest first)
 */
export function getHandHistory(): HandHistoryRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const history: HandHistoryRecord[] = JSON.parse(stored);

    // Return in reverse chronological order (newest first)
    return history.reverse();
  } catch (error) {
    logger.error('Failed to retrieve hand history:', error);
    return [];
  }
}

/**
 * Get a specific hand record by ID.
 *
 * @param handId - The unique hand ID
 * @returns The hand record, or undefined if not found
 */
export function getHandById(handId: string): HandHistoryRecord | undefined {
  const history = getHandHistory();
  return history.find(h => h.id === handId);
}

/**
 * Clear all hand history from storage.
 */
export function clearHandHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    handCounter = 0;
    logger.log('Hand history cleared');
  } catch (error) {
    logger.error('Failed to clear hand history:', error);
  }
}

/**
 * Calculate statistics from hand history.
 *
 * @param hands - Array of hand records to analyze (defaults to all stored hands)
 * @returns Statistics object
 */
export function calculateStats(hands?: HandHistoryRecord[]): HandHistoryStats {
  const history = hands ?? getHandHistory();

  if (history.length === 0) {
    return {
      totalHands: 0,
      handsWon: 0,
      handsLost: 0,
      handsFolded: 0,
      showdownHands: 0,
      winRate: 0,
      totalChipsWon: 0,
      totalChipsLost: 0,
      netProfit: 0,
      averagePot: 0,
      foldRate: 0,
      showdownRate: 0,
    };
  }

  const totalHands = history.length;
  const handsWon = history.filter(h => h.userWon).length;
  const handsFolded = history.filter(h => h.userFolded).length;
  const showdownHands = history.filter(h => h.reachedShowdown).length;
  const handsLost = totalHands - handsWon - handsFolded;

  const totalChipsWon = history
    .filter(h => h.userChipChange > 0)
    .reduce((sum, h) => sum + h.userChipChange, 0);

  const totalChipsLost = Math.abs(
    history
      .filter(h => h.userChipChange < 0)
      .reduce((sum, h) => sum + h.userChipChange, 0)
  );

  const netProfit = history.reduce((sum, h) => sum + h.userChipChange, 0);
  const averagePot = history.reduce((sum, h) => sum + h.potSize, 0) / totalHands;

  const winRate = (handsWon / totalHands) * 100;
  const foldRate = (handsFolded / totalHands) * 100;
  const showdownRate = (showdownHands / totalHands) * 100;

  return {
    totalHands,
    handsWon,
    handsLost,
    handsFolded,
    showdownHands,
    winRate: Math.round(winRate * 10) / 10,
    totalChipsWon,
    totalChipsLost,
    netProfit,
    averagePot: Math.round(averagePot * 10) / 10,
    foldRate: Math.round(foldRate * 10) / 10,
    showdownRate: Math.round(showdownRate * 10) / 10,
  };
}

/**
 * Get the most recent N hands.
 *
 * @param count - Number of recent hands to retrieve
 * @returns Array of hand records (newest first)
 */
export function getRecentHands(count: number): HandHistoryRecord[] {
  const history = getHandHistory();
  return history.slice(0, count);
}

/**
 * Export hand history as JSON string for download/sharing.
 *
 * @returns JSON string of all hand history
 */
export function exportHandHistory(): string {
  const history = getHandHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Import hand history from JSON string.
 * This will replace existing history.
 *
 * @param jsonString - JSON string of hand history records
 * @returns Success boolean
 */
export function importHandHistory(jsonString: string): boolean {
  try {
    const history: HandHistoryRecord[] = JSON.parse(jsonString);

    // Validate structure
    if (!Array.isArray(history)) {
      throw new Error('Invalid history format: not an array');
    }

    // Basic validation of first record if exists
    if (history.length > 0 && !history[0].id) {
      throw new Error('Invalid history format: missing required fields');
    }

    localStorage.setItem(STORAGE_KEY, jsonString);

    // Update hand counter
    if (history.length > 0) {
      handCounter = Math.max(...history.map(h => h.handNumber)) + 1;
    }

    logger.log('Hand history imported:', history.length, 'hands');
    return true;
  } catch (error) {
    logger.error('Failed to import hand history:', error);
    return false;
  }
}
