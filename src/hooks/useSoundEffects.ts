/**
 * Custom React hook for playing sound effects based on game state changes.
 * Watches game state and triggers appropriate sounds for game events.
 */

import { useEffect, useRef } from 'react';
import { GameState, BettingAction } from '../types/game';
import { audioService } from '../utils/audio';
import { logger } from '../utils/logger';

/**
 * Hook to play sound effects in response to game state changes
 * @param gameState - Current game state
 */
export function useSoundEffects(gameState: GameState) {
  // Track previous state to detect changes
  const prevPhaseRef = useRef<string | null>(null);
  const prevCommunityCardsLengthRef = useRef<number>(0);
  const prevHandCompleteRef = useRef<boolean>(false);
  const prevActionHistoryLengthRef = useRef<number>(0);

  // Play deal sound when cards are dealt
  useEffect(() => {
    const currentPhase = gameState.currentPhase;
    const currentCommunityCardsLength = gameState.communityCards.length;

    // Initial deal (hole cards) - detect when we start a new hand
    if (prevPhaseRef.current === null && currentPhase === 'pre-flop' && gameState.players.some(p => p.holeCards.length > 0)) {
      logger.debug('[Sound] Playing deal sound for hole cards');
      audioService.play('deal');
    }

    // Community cards dealt - detect when community cards are added
    if (prevCommunityCardsLengthRef.current < currentCommunityCardsLength) {
      logger.debug('[Sound] Playing deal sound for community cards');
      audioService.play('deal');
    }

    prevPhaseRef.current = currentPhase;
    prevCommunityCardsLengthRef.current = currentCommunityCardsLength;
  }, [gameState.currentPhase, gameState.communityCards.length, gameState.players]);

  // Play sound for player actions (bet, fold)
  useEffect(() => {
    const currentActionHistoryLength = gameState.actionHistory.length;

    // Check if a new action was added
    if (currentActionHistoryLength > prevActionHistoryLengthRef.current) {
      const latestAction = gameState.actionHistory[currentActionHistoryLength - 1];

      // Skip blind actions (they're automatic)
      if (latestAction.action === 'smallBlind' || latestAction.action === 'bigBlind') {
        prevActionHistoryLengthRef.current = currentActionHistoryLength;
        return;
      }

      const action = latestAction.action as BettingAction;

      switch (action) {
        case 'fold':
          logger.debug('[Sound] Playing fold sound');
          audioService.play('fold');
          break;
        case 'call':
        case 'raise':
          logger.debug('[Sound] Playing bet sound');
          audioService.play('bet');
          break;
        case 'check':
          // No sound for check
          break;
      }
    }

    prevActionHistoryLengthRef.current = currentActionHistoryLength;
  }, [gameState.actionHistory]);

  // Play win sound when hand is complete
  useEffect(() => {
    if (!prevHandCompleteRef.current && gameState.isHandComplete) {
      logger.debug('[Sound] Playing win sound');
      audioService.play('win');
    }

    prevHandCompleteRef.current = gameState.isHandComplete;
  }, [gameState.isHandComplete]);

  // Start ambiance when component mounts
  useEffect(() => {
    logger.debug('[Sound] Starting ambiance');
    audioService.play('ambiance');

    // Cleanup when component unmounts
    return () => {
      logger.debug('[Sound] Stopping all sounds');
      audioService.stopAll();
    };
  }, []);
}
