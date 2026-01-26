/**
 * Analytics utility for tracking user events with PostHog
 *
 * This module provides a centralized interface for tracking user interactions
 * and game events. It includes privacy-first defaults and graceful degradation
 * when analytics are disabled or PostHog is not configured.
 */

import posthog from 'posthog-js'
import type { GamePhase } from '../types/game'

// Flag to track if PostHog has been initialized
let isInitialized = false

/**
 * Initialize PostHog analytics
 *
 * This should be called once at application startup.
 * Requires VITE_POSTHOG_KEY and VITE_POSTHOG_HOST environment variables.
 *
 * Privacy settings:
 * - Respects Do Not Track browser settings
 * - Disabled in development by default (unless VITE_POSTHOG_DEV_MODE is set)
 * - No IP address capture
 * - No session recording by default
 */
export function initializeAnalytics(): void {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

  // Don't initialize if already done
  if (isInitialized) {
    return
  }

  // Don't initialize in development unless explicitly enabled
  const isDev = import.meta.env.DEV
  const devModeEnabled = import.meta.env.VITE_POSTHOG_DEV_MODE === 'true'

  if (isDev && !devModeEnabled) {
    console.log('[Analytics] PostHog disabled in development mode')
    return
  }

  // Don't initialize if no API key provided
  if (!apiKey) {
    console.warn('[Analytics] PostHog API key not found. Analytics disabled.')
    return
  }

  try {
    posthog.init(apiKey, {
      api_host: host,

      // Privacy settings
      respect_dnt: true, // Respect Do Not Track
      ip: false, // Don't capture IP addresses

      // Performance settings
      loaded: (posthog) => {
        if (isDev) {
          posthog.debug() // Enable debug mode in development
        }
      },

      // Autocapture settings - disable for manual tracking only
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: true,

      // Session recording - disabled by default
      disable_session_recording: true,
    })

    isInitialized = true
    console.log('[Analytics] PostHog initialized successfully')
  } catch (error) {
    console.error('[Analytics] Failed to initialize PostHog:', error)
  }
}

/**
 * Track a custom event
 *
 * @param eventName - Name of the event to track
 * @param properties - Optional properties to attach to the event
 */
function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (!isInitialized) {
    return
  }

  try {
    posthog.capture(eventName, properties)
  } catch (error) {
    console.error('[Analytics] Failed to track event:', eventName, error)
  }
}

// Game Events

/**
 * Track when a user selects a game mode
 */
export function trackModeSelection(mode: 'tutorial' | 'training'): void {
  trackEvent('mode_selected', { mode })
}

/**
 * Track when a new hand starts
 */
export function trackHandStart(handNumber?: number): void {
  trackEvent('hand_started', { hand_number: handNumber })
}

/**
 * Track when a hand completes
 */
export function trackHandComplete(
  winner: string,
  winningHandRank: number,
  potSize: number,
  handNumber?: number
): void {
  trackEvent('hand_completed', {
    winner,
    winning_hand_rank: winningHandRank,
    pot_size: potSize,
    hand_number: handNumber,
  })
}

/**
 * Track user actions during gameplay
 */
export function trackUserAction(
  action: 'fold' | 'call' | 'check' | 'raise',
  phase: GamePhase,
  amount?: number
): void {
  trackEvent('user_action', {
    action,
    phase,
    amount,
  })
}

/**
 * Track when a player is eliminated
 */
export function trackPlayerElimination(playerName: string, isUser: boolean): void {
  trackEvent('player_eliminated', {
    player_name: playerName,
    is_user: isUser,
  })
}

/**
 * Track game completion (user wins or loses)
 */
export function trackGameComplete(userWon: boolean, handsPlayed: number): void {
  trackEvent('game_completed', {
    user_won: userWon,
    hands_played: handsPlayed,
  })
}

/**
 * Track when user views hand rankings reference
 */
export function trackHandRankingsViewed(): void {
  trackEvent('hand_rankings_viewed')
}

/**
 * Track when user views action history
 */
export function trackActionHistoryViewed(): void {
  trackEvent('action_history_viewed')
}

/**
 * Track music player interactions
 */
export function trackMusicToggle(isPlaying: boolean): void {
  trackEvent('music_toggled', { is_playing: isPlaying })
}

/**
 * Track when user confirms a risky fold
 */
export function trackFoldConfirmation(confirmed: boolean, handStrength: string): void {
  trackEvent('fold_confirmation', {
    confirmed,
    hand_strength: handStrength,
  })
}

// Session Events

/**
 * Track when a user starts a new session
 */
export function trackSessionStart(): void {
  trackEvent('session_started')
}

/**
 * Identify a user (optional - for future use if user accounts are added)
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!isInitialized) {
    return
  }

  try {
    posthog.identify(userId, properties)
  } catch (error) {
    console.error('[Analytics] Failed to identify user:', error)
  }
}

/**
 * Reset user identity (optional - for future use)
 */
export function resetUser(): void {
  if (!isInitialized) {
    return
  }

  try {
    posthog.reset()
  } catch (error) {
    console.error('[Analytics] Failed to reset user:', error)
  }
}

/**
 * Shutdown analytics (cleanup on app unmount)
 */
export function shutdownAnalytics(): void {
  if (!isInitialized) {
    return
  }

  try {
    // Flush any pending events
    posthog.capture('session_ended')
    isInitialized = false
  } catch (error) {
    console.error('[Analytics] Failed to shutdown analytics:', error)
  }
}
