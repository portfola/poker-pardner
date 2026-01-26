/**
 * Timing constants for game animations and delays (in milliseconds).
 * All delays are in milliseconds.
 */
export const TIMING = {
  /** Base delay before AI acts (early rounds) */
  AI_TURN_BASE_DELAY: 3000,
  /** Random additional delay for AI (0 to this value, early rounds) */
  AI_TURN_RANDOM_DELAY: 3000,
  /** Additional base delay for later rounds (turn/river) */
  AI_TURN_LATE_DELAY: 2000,
  /** Delay after user action before AI can act (allows reading cowboy message) */
  USER_ACTION_DELAY: 2500,
  /** Delay before showing "Betting round complete" message */
  BETTING_COMPLETE_DELAY: 500,
  /** Delay between "Betting round complete" and advancing phase */
  PHASE_ADVANCE_DELAY: 1000,
  /** Delay showing cards before determining winner at showdown */
  SHOWDOWN_REVEAL_DELAY: 1500,
  /** Delay before starting new hand after reset */
  NEW_HAND_DELAY: 500,
} as const;
