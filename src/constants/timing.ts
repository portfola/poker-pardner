/**
 * Timing constants for game animations and delays (in milliseconds).
 * All delays are in milliseconds.
 */
export const TIMING = {
  /** Base delay before AI acts */
  AI_TURN_BASE_DELAY: 1000,
  /** Random additional delay for AI (0 to this value) */
  AI_TURN_RANDOM_DELAY: 1000,
  /** Delay before showing "Betting round complete" message */
  BETTING_COMPLETE_DELAY: 500,
  /** Delay between "Betting round complete" and advancing phase */
  PHASE_ADVANCE_DELAY: 1000,
  /** Delay showing cards before determining winner at showdown */
  SHOWDOWN_REVEAL_DELAY: 1500,
  /** Delay before starting new hand after reset */
  NEW_HAND_DELAY: 500,
} as const;
