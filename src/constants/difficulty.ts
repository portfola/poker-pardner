/**
 * AI difficulty levels and their associated decision thresholds.
 *
 * Easy: More passive play, folds more often, raises less aggressively
 * Medium: Balanced play, moderate aggression
 * Hard: Aggressive play, calls and raises more frequently
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/** Hand strength thresholds for AI decisions at different difficulty levels */
interface DifficultyThresholds {
  /** Below this strength, AI will fold when facing a bet */
  FOLD: number;
  /** At or above this strength, AI will call */
  CALL: number;
  /** At or above this strength, AI will raise */
  RAISE: number;
}

/** Configuration for each difficulty level */
interface DifficultyConfig {
  /** Decision thresholds for this difficulty */
  thresholds: DifficultyThresholds;
  /** Random variance applied to AI decisions */
  variance: {
    /** Minimum multiplier (e.g., 0.8 = 80% of calculated strength) */
    MIN: number;
    /** Range to add (e.g., 0.4 means final range is MIN to MIN+RANGE) */
    RANGE: number;
  };
  /** Pot odds threshold - call with weak hands if pot odds < this value */
  potOddsCallThreshold: number;
}

/**
 * Difficulty configurations for AI opponents.
 *
 * The thresholds are on a 0-10 scale based on HandRank:
 * - 0-2: Very weak hands (high card, low pair)
 * - 3-5: Moderate hands (decent pair, two pair)
 * - 6-8: Strong hands (trips, straight, flush)
 * - 9-10: Premium hands (full house, quads, straight flush)
 */
export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfig> = {
  /**
   * Easy difficulty - Passive, predictable play
   * - Folds frequently with weak hands
   * - Only raises with strong hands
   * - More variance makes them less predictable
   */
  easy: {
    thresholds: {
      FOLD: 3,    // Folds below 3 (only plays pairs and better)
      CALL: 5,    // Calls at 5+ (decent pairs, two pair)
      RAISE: 7,   // Raises at 7+ (trips or better)
    },
    variance: {
      MIN: 0.7,   // More variance (70%-110% of strength)
      RANGE: 0.4,
    },
    potOddsCallThreshold: 0.25, // Less likely to chase pot odds
  },

  /**
   * Medium difficulty - Balanced, standard play
   * - Moderate aggression
   * - Reasonable hand selection
   * - Standard variance
   */
  medium: {
    thresholds: {
      FOLD: 2,    // Folds below 2 (plays most pairs)
      CALL: 4,    // Calls at 4+ (any pair, decent kicker)
      RAISE: 6,   // Raises at 6+ (two pair or better)
    },
    variance: {
      MIN: 0.8,   // Standard variance (80%-120% of strength)
      RANGE: 0.4,
    },
    potOddsCallThreshold: 0.3, // Standard pot odds consideration
  },

  /**
   * Hard difficulty - Aggressive, skilled play
   * - More aggressive betting
   * - Willing to play weaker hands
   * - Less variance makes them more consistent
   */
  hard: {
    thresholds: {
      FOLD: 1,    // Rarely folds (plays most hands)
      CALL: 3,    // Calls at 3+ (any pair)
      RAISE: 5,   // Raises at 5+ (pair with good kicker, two pair)
    },
    variance: {
      MIN: 0.85,  // Less variance (85%-125% of strength)
      RANGE: 0.4,
    },
    potOddsCallThreshold: 0.35, // More likely to chase pot odds
  },
} as const;

/**
 * Default difficulty level for new games.
 */
export const DEFAULT_DIFFICULTY: DifficultyLevel = 'medium';

/**
 * Gets the configuration for a specific difficulty level.
 *
 * @param difficulty - The difficulty level to get config for
 * @returns The difficulty configuration
 */
export function getDifficultyConfig(difficulty: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIG[difficulty];
}

/**
 * Display names for difficulty levels (for UI).
 */
export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
} as const;

/**
 * Descriptions for difficulty levels (for UI tooltips/help text).
 */
export const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  easy: 'AI opponents play cautiously and fold often. Good for learning the basics.',
  medium: 'AI opponents play with balanced strategy. Recommended for most players.',
  hard: 'AI opponents play aggressively and bluff more. A real challenge!',
} as const;
