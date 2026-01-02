/**
 * Tests for useGameState hook.
 * These are integration tests that verify the game state management works correctly.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';

describe('useGameState', () => {
  describe('Initial State', () => {
    it('should initialize with 4 players', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state.players).toHaveLength(4);
    });

    it('should initialize each player with $100', () => {
      const { result } = renderHook(() => useGameState());
      result.current.state.players.forEach(player => {
        expect(player.chips).toBe(100);
      });
    });

    it('should have correct blind amounts', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state.smallBlind).toBe(5);
      expect(result.current.state.bigBlind).toBe(10);
    });

    it('should start with dealer at position 0', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state.dealerPosition).toBe(0);
    });

    it('should have user as first player', () => {
      const { result } = renderHook(() => useGameState());
      const userPlayer = result.current.state.players.find(p => p.isUser);
      expect(userPlayer).toBeDefined();
      expect(userPlayer?.name).toBe('You');
    });
  });

  describe('startNewHand', () => {
    it('should deal hole cards to all players', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      result.current.state.players.forEach(player => {
        expect(player.holeCards).toHaveLength(2);
      });
    });

    it('should post blinds correctly', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Small blind should be posted by player at position 1
      const sbPlayer = result.current.state.players[1];
      expect(sbPlayer.currentBet).toBe(5);
      expect(sbPlayer.chips).toBe(95);

      // Big blind should be posted by player at position 2
      const bbPlayer = result.current.state.players[2];
      expect(bbPlayer.currentBet).toBe(10);
      expect(bbPlayer.chips).toBe(90);
    });

    it('should add blinds to pot', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      expect(result.current.state.pot).toBe(15); // 5 + 10
    });

    it('should set current bet to big blind amount', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      expect(result.current.state.currentBet).toBe(10);
    });

    it('should set phase to pre-flop', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      expect(result.current.state.currentPhase).toBe('pre-flop');
    });

    it('should create a shuffled deck', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // 52 cards - 8 dealt to players = 44 remaining
      expect(result.current.state.deck.length).toBe(44);
    });
  });

  describe('handlePlayerAction - Fold', () => {
    it('should mark player as folded', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();

      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'fold');
      });

      const foldedPlayer = result.current.state.players.find(p => p.id === currentPlayer.id);
      expect(foldedPlayer?.isFolded).toBe(true);
    });
  });

  describe('handlePlayerAction - Call', () => {
    it('should deduct correct amount from player chips', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();
      const initialChips = currentPlayer.chips;
      const amountToCall = result.current.getAmountToCall(currentPlayer.id);

      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'call');
      });

      const updatedPlayer = result.current.state.players.find(p => p.id === currentPlayer.id);
      expect(updatedPlayer?.chips).toBe(initialChips - amountToCall);
    });

    it('should add call amount to pot', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const initialPot = result.current.state.pot;
      const currentPlayer = result.current.getCurrentPlayer();
      const amountToCall = result.current.getAmountToCall(currentPlayer.id);

      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'call');
      });

      expect(result.current.state.pot).toBe(initialPot + amountToCall);
    });
  });

  describe('handlePlayerAction - Raise', () => {
    it('should increase current bet', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();

      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'raise', 20);
      });

      expect(result.current.state.currentBet).toBe(20);
    });

    it('should reset hasActed for other players', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();

      // Mark another player as having acted
      const otherPlayer = result.current.state.players.find(p => p.id !== currentPlayer.id && !p.isFolded);
      if (otherPlayer) {
        otherPlayer.hasActed = true;
      }

      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'raise', 20);
      });

      // Other player should have hasActed reset
      const updatedOtherPlayer = result.current.state.players.find(p => p.id === otherPlayer?.id);
      expect(updatedOtherPlayer?.hasActed).toBe(false);
    });
  });

  describe('advancePhase', () => {
    it('should deal flop after pre-flop', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      act(() => {
        result.current.advancePhase();
      });

      expect(result.current.state.currentPhase).toBe('flop');
      expect(result.current.state.communityCards).toHaveLength(3);
    });

    it('should deal turn after flop', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
        result.current.advancePhase(); // to flop
        result.current.advancePhase(); // to turn
      });

      expect(result.current.state.currentPhase).toBe('turn');
      expect(result.current.state.communityCards).toHaveLength(4);
    });

    it('should deal river after turn', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
        result.current.advancePhase(); // to flop
        result.current.advancePhase(); // to turn
        result.current.advancePhase(); // to river
      });

      expect(result.current.state.currentPhase).toBe('river');
      expect(result.current.state.communityCards).toHaveLength(5);
    });

    it('should reset current bet when advancing', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      expect(result.current.state.currentBet).toBe(10); // Big blind

      act(() => {
        result.current.advancePhase();
      });

      expect(result.current.state.currentBet).toBe(0);
    });
  });

  describe('determineWinner', () => {
    it('should award pot to winner', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Fold all players except one
      const playersToFold = result.current.state.players.slice(0, 3);
      playersToFold.forEach(player => {
        player.isFolded = true;
      });

      act(() => {
        result.current.determineWinner();
      });

      expect(result.current.state.winners).toHaveLength(1);
      const winner = result.current.state.winners[0];
      // Winner should have original 100 chips + pot - their bet
      expect(winner.chips).toBeGreaterThan(100);
    });

    it('should mark hand as complete', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Fold all players except one
      result.current.state.players.slice(0, 3).forEach(player => {
        player.isFolded = true;
      });

      act(() => {
        result.current.determineWinner();
      });

      expect(result.current.state.isHandComplete).toBe(true);
    });
  });

  describe('resetForNextHand', () => {
    it('should rotate dealer button', () => {
      const { result } = renderHook(() => useGameState());

      const initialDealer = result.current.state.dealerPosition;

      act(() => {
        result.current.resetForNextHand();
      });

      expect(result.current.state.dealerPosition).toBe((initialDealer + 1) % 4);
    });

    it('should eliminate players with no chips', () => {
      const { result } = renderHook(() => useGameState());

      // Set a player's chips to 0
      result.current.state.players[1].chips = 0;

      act(() => {
        result.current.resetForNextHand();
      });

      expect(result.current.state.players).toHaveLength(3);
    });
  });

  describe('Helper Functions', () => {
    it('getAmountToCall should return correct amount', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();
      const amountToCall = result.current.getAmountToCall(currentPlayer.id);

      expect(amountToCall).toBe(10 - currentPlayer.currentBet);
    });

    it('getCurrentPlayer should return player at current index', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();
      const expectedPlayer = result.current.state.players[result.current.state.currentPlayerIndex];

      expect(currentPlayer.id).toBe(expectedPlayer.id);
    });
  });
});
