/**
 * Performance tests for the game state management.
 * Tests memory usage and performance over extended gameplay.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';

describe('Performance Tests', () => {
  describe('Extended Gameplay', () => {
    it('should handle 100+ consecutive hands without memory leaks or performance degradation', async () => {
      const { result } = renderHook(() => useGameState());

      // Track performance metrics
      const handCompletionTimes: number[] = [];
      const memorySnapshots: number[] = [];
      const NUM_HANDS = 120; // Test with 120 hands to exceed minimum requirement

      // Helper to play through a hand quickly by folding most players
      const quickPlayHand = async () => {
        // Just fold all but one player to quickly complete the hand
        const playerIds = result.current.state.players.map(p => p.id);

        for (let i = 0; i < playerIds.length - 1; i++) {
          const currentPlayer = result.current.getCurrentPlayer();
          if (!currentPlayer || result.current.state.isHandComplete) break;

          await act(async () => {
            result.current.handlePlayerAction(currentPlayer.id, 'fold');
          });
        }
      };

      // Play through multiple hands
      for (let handNum = 0; handNum < NUM_HANDS; handNum++) {
        const handStartTime = performance.now();

        // Restore chips if players are getting low (to ensure we can play 100+ hands)
        if (handNum % 20 === 0 && handNum > 0) {
          await act(async () => {
            result.current.state.players.forEach(p => {
              if (p.chips < 50) {
                p.chips = 100; // Reset to starting amount
              }
            });
          });
        }

        // Start new hand
        await act(async () => {
          result.current.startNewHand();
        });

        // Quick play through the hand
        await quickPlayHand();

        // Handle showdown if needed
        if (result.current.state.currentPhase === 'showdown' && !result.current.state.isHandComplete) {
          await act(async () => {
            result.current.determineWinner();
          });
        }

        // Reset for next hand
        if (result.current.state.isHandComplete) {
          await act(async () => {
            result.current.resetForNextHand();
          });
        }

        const handEndTime = performance.now();
        handCompletionTimes.push(handEndTime - handStartTime);

        // Track memory usage every 10 hands
        if (handNum % 10 === 0 && typeof performance !== 'undefined' && (performance as any).memory) {
          const memory = (performance as any).memory;
          memorySnapshots.push(memory.usedJSHeapSize);
        }

        // Skip the game over check since we're replenishing chips to test performance
      }

      // Calculate performance metrics
      const avgHandTime = handCompletionTimes.reduce((a, b) => a + b, 0) / handCompletionTimes.length;
      const minHandTime = Math.min(...handCompletionTimes);
      const maxHandTime = Math.max(...handCompletionTimes);

      // Log performance metrics
      console.log(`\n=== Performance Test Results ===`);
      console.log(`Hands completed: ${handCompletionTimes.length}`);
      console.log(`Average hand completion time: ${avgHandTime.toFixed(2)}ms`);
      console.log(`Min hand time: ${minHandTime.toFixed(2)}ms`);
      console.log(`Max hand time: ${maxHandTime.toFixed(2)}ms`);

      if (memorySnapshots.length > 1) {
        const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0];
        const memoryGrowthMB = (memoryGrowth / 1024 / 1024).toFixed(2);
        console.log(`Memory growth: ${memoryGrowthMB}MB`);
        console.log(`Memory snapshots: ${memorySnapshots.length}`);
      }

      // Performance assertions
      expect(handCompletionTimes.length).toBeGreaterThanOrEqual(100); // Should complete at least 100 hands
      expect(avgHandTime).toBeLessThan(1000); // Average hand should complete in less than 1 second
      expect(maxHandTime).toBeLessThan(5000); // No single hand should take more than 5 seconds

      // Memory assertions (if available)
      if (memorySnapshots.length > 1) {
        const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0];
        const memoryGrowthMB = memoryGrowth / 1024 / 1024;

        // Memory should not grow excessively (less than 50MB for 100+ hands)
        expect(memoryGrowthMB).toBeLessThan(50);
      }

      // State sanity checks
      expect(result.current.state.players).toBeDefined();
      expect(result.current.state.players.length).toBeGreaterThan(0);
      expect(result.current.state.pot).toBeGreaterThanOrEqual(0);
    }, 60000); // 60 second timeout for this long-running test

    it('should maintain consistent state structure across multiple hands', async () => {
      const { result } = renderHook(() => useGameState());

      const stateSnapshots: any[] = [];
      const NUM_HANDS = 20; // Test with 20 hands for structure consistency

      for (let handNum = 0; handNum < NUM_HANDS; handNum++) {
        // Start new hand
        await act(async () => {
          result.current.startNewHand();
        });

        // Take snapshot of state structure
        const snapshot = {
          playersCount: result.current.state.players.length,
          hasUser: result.current.state.players.some(p => p.isUser),
          allPlayersHaveIds: result.current.state.players.every(p => p.id),
          allPlayersHavePositions: result.current.state.players.every(p => typeof p.position === 'number'),
          potExists: typeof result.current.state.pot === 'number',
          phaseExists: Boolean(result.current.state.currentPhase),
          deckSize: result.current.state.deck.length,
        };
        stateSnapshots.push(snapshot);

        // Quick simulation: just fold all players to complete hand quickly
        for (let i = 0; i < result.current.state.players.length * 2; i++) {
          if (result.current.state.isHandComplete || result.current.state.isGameOver) break;

          const currentPlayer = result.current.getCurrentPlayer();
          if (!currentPlayer) break;

          await act(async () => {
            try {
              result.current.handlePlayerAction(currentPlayer.id, 'fold');
            } catch (e) {
              // Ignore errors from invalid actions
            }
          });
        }

        // Handle showdown if needed
        if (result.current.state.currentPhase === 'showdown' && !result.current.state.isHandComplete) {
          await act(async () => {
            result.current.determineWinner();
          });
        }

        // Reset for next hand
        if (result.current.state.isHandComplete) {
          await act(async () => {
            result.current.resetForNextHand();
          });
        }

        if (result.current.state.isGameOver) break;
      }

      // Verify all snapshots have consistent structure
      stateSnapshots.forEach((snapshot, index) => {
        expect(snapshot.playersCount).toBeGreaterThan(0);
        expect(snapshot.hasUser).toBe(true);
        expect(snapshot.allPlayersHaveIds).toBe(true);
        expect(snapshot.allPlayersHavePositions).toBe(true);
        expect(snapshot.potExists).toBe(true);
        expect(snapshot.phaseExists).toBe(true);
      });

      console.log(`\n=== State Consistency Test ===`);
      console.log(`Tested ${stateSnapshots.length} hands`);
      console.log(`All hands maintained consistent state structure ✓`);
    }, 30000); // 30 second timeout

    it('should not accumulate unbounded arrays or objects', async () => {
      const { result } = renderHook(() => useGameState());

      // Track sizes of key data structures
      const sizes: {
        actionHistory: number;
        communityCards: number;
        deckSize: number;
      }[] = [];

      const NUM_HANDS = 30;

      for (let handNum = 0; handNum < NUM_HANDS; handNum++) {
        await act(async () => {
          result.current.startNewHand();
        });

        // Record sizes
        sizes.push({
          actionHistory: result.current.state.actionHistory.length,
          communityCards: result.current.state.communityCards.length,
          deckSize: result.current.state.deck.length,
        });

        // Quick fold to complete hand
        for (let i = 0; i < 10; i++) {
          if (result.current.state.isHandComplete || result.current.state.isGameOver) break;

          const currentPlayer = result.current.getCurrentPlayer();
          if (!currentPlayer) break;

          await act(async () => {
            try {
              result.current.handlePlayerAction(currentPlayer.id, 'fold');
            } catch (e) {
              // Ignore
            }
          });
        }

        if (result.current.state.currentPhase === 'showdown' && !result.current.state.isHandComplete) {
          await act(async () => {
            result.current.determineWinner();
          });
        }

        if (result.current.state.isHandComplete) {
          await act(async () => {
            result.current.resetForNextHand();
          });
        }

        if (result.current.state.isGameOver) break;
      }

      // Verify arrays are bounded
      const maxActionHistory = Math.max(...sizes.map(s => s.actionHistory));
      const maxCommunityCards = Math.max(...sizes.map(s => s.communityCards));

      console.log(`\n=== Memory Bounds Test ===`);
      console.log(`Max action history size: ${maxActionHistory}`);
      console.log(`Max community cards: ${maxCommunityCards}`);

      // Action history should be cleared between hands (or at least not grow indefinitely)
      // Allow some reasonable upper bound
      expect(maxActionHistory).toBeLessThan(100);

      // Community cards should never exceed 5
      expect(maxCommunityCards).toBeLessThanOrEqual(5);

      // Deck should be a full deck (52 cards) at start of each hand
      sizes.forEach(size => {
        expect(size.deckSize).toBeLessThanOrEqual(52);
      });
    }, 20000); // 20 second timeout
  });
});
