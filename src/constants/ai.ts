/**
 * AI decision-making thresholds and configuration.
 */

/** Hand strength thresholds for AI decisions (0-10 scale based on HandRank) */
export const AI_THRESHOLDS = {
  /** Below this strength, AI will fold when facing a bet */
  FOLD: 2,
  /** At or above this strength, AI will call */
  CALL: 4,
  /** At or above this strength, AI will raise */
  RAISE: 6,
} as const;

/** Random variance applied to AI decisions for unpredictability */
export const AI_VARIANCE = {
  /** Minimum multiplier (0.8 = 80% of calculated strength) */
  MIN: 0.8,
  /** Range to add (0.4 means final range is 0.8 to 1.2) */
  RANGE: 0.4,
} as const;

/** Pot odds threshold - call with weak hands if pot odds < this value */
export const POT_ODDS_CALL_THRESHOLD = 0.3;
