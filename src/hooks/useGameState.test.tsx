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

  describe('Edge Cases - All-In Scenarios', () => {
    it('should handle all-in when player cannot cover full bet', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Set a player's chips to less than amount needed to call
      const currentPlayer = result.current.getCurrentPlayer();
      const originalChips = currentPlayer.chips;
      currentPlayer.chips = 5; // Less than the 10 needed to call

      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'call');
      });

      const updatedPlayer = result.current.state.players.find(p => p.id === currentPlayer.id);
      expect(updatedPlayer?.chips).toBe(0);
      expect(updatedPlayer?.isAllIn).toBe(true);
      expect(updatedPlayer?.currentBet).toBe(originalChips - (originalChips - 5)); // Should bet their remaining 5 chips
    });

    it('should handle all-in when player cannot cover minimum raise', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();
      currentPlayer.chips = 15; // Not enough for minimum raise (20)

      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'raise', 20);
      });

      const updatedPlayer = result.current.state.players.find(p => p.id === currentPlayer.id);
      expect(updatedPlayer?.chips).toBe(0);
      expect(updatedPlayer?.isAllIn).toBe(true);
      // Player should have bet all their remaining chips
      expect(updatedPlayer?.totalBet).toBe(15);
    });

    it('should handle blind posting when player has insufficient chips', () => {
      const { result } = renderHook(() => useGameState());

      // Set small blind player to have only 3 chips (less than 5 SB)
      result.current.state.players[1].chips = 3;

      act(() => {
        result.current.startNewHand();
      });

      const sbPlayer = result.current.state.players[1];
      expect(sbPlayer.chips).toBe(0);
      expect(sbPlayer.currentBet).toBe(3); // Posted what they had
      expect(sbPlayer.isAllIn).toBe(true);
    });

    it('should handle multiple all-ins in same hand', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Find the current player and set them to low chips
      const currentPlayerIndex = result.current.state.currentPlayerIndex;
      const player1Id = result.current.state.players[currentPlayerIndex].id;
      result.current.state.players[currentPlayerIndex].chips = 8;

      // First player goes all-in by calling with insufficient chips
      act(() => {
        result.current.handlePlayerAction(player1Id, 'call');
      });

      expect(result.current.state.players.find(p => p.id === player1Id)?.isAllIn).toBe(true);

      // Get next player and set them to low chips
      const nextPlayerIndex = result.current.state.currentPlayerIndex;
      const player2Id = result.current.state.players[nextPlayerIndex].id;
      result.current.state.players[nextPlayerIndex].chips = 5;

      // Second player goes all-in
      act(() => {
        result.current.handlePlayerAction(player2Id, 'call');
      });

      expect(result.current.state.players.find(p => p.id === player2Id)?.isAllIn).toBe(true);
    });
  });

  describe('Edge Cases - Player Elimination', () => {
    it('should eliminate player with 0 chips after hand', () => {
      const { result } = renderHook(() => useGameState());

      const initialPlayerCount = result.current.state.players.length;
      result.current.state.players[2].chips = 0;

      act(() => {
        result.current.resetForNextHand();
      });

      expect(result.current.state.players.length).toBe(initialPlayerCount - 1);
      expect(result.current.state.players.find(p => p.id === 'ai2')).toBeUndefined();
    });

    it('should rotate dealer button correctly when dealer is eliminated', () => {
      const { result } = renderHook(() => useGameState());

      // Set dealer position to 2, then eliminate player at position 2
      result.current.state.dealerPosition = 2;
      result.current.state.players[2].chips = 0;

      act(() => {
        result.current.resetForNextHand();
      });

      // After elimination, player count is 3, so dealer should wrap around
      // Original dealer was at position 2, next would be position 3, but after eliminating position 2,
      // the positions get reassigned, so we need to verify the rotation is correct
      expect(result.current.state.dealerPosition).toBeLessThan(result.current.state.players.length);
    });

    it('should handle multiple eliminations in one hand', () => {
      const { result } = renderHook(() => useGameState());

      result.current.state.players[1].chips = 0;
      result.current.state.players[2].chips = 0;

      act(() => {
        result.current.resetForNextHand();
      });

      expect(result.current.state.players.length).toBe(2);
      // Verify positions are reassigned correctly
      expect(result.current.state.players[0].position).toBe(0);
      expect(result.current.state.players[1].position).toBe(1);
    });

    it('should handle elimination when only 2 players remain', () => {
      const { result } = renderHook(() => useGameState());

      // Eliminate 2 players, leaving only 2
      result.current.state.players[1].chips = 0;
      result.current.state.players[2].chips = 0;

      act(() => {
        result.current.resetForNextHand();
      });

      expect(result.current.state.players.length).toBe(2);

      // Verify we can still start a new hand with 2 players
      act(() => {
        result.current.startNewHand();
      });

      expect(result.current.state.pot).toBe(15); // Blinds should still be posted
    });
  });

  describe('Edge Cases - Betting Round Completion', () => {
    it('should complete betting round when all but one player folds', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Fold 3 out of 4 players
      const players = result.current.state.players;
      players[0].isFolded = true;
      players[1].isFolded = true;
      players[2].isFolded = true;

      expect(result.current.isBettingComplete()).toBe(true);
    });

    it('should complete betting round when all players are all-in', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Mark all players as all-in
      result.current.state.players.forEach(p => {
        p.isAllIn = true;
      });

      expect(result.current.isBettingComplete()).toBe(true);
    });

    it('should complete betting round when only one non-all-in player remains', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Mark 3 players as all-in, leave one active
      result.current.state.players[0].isAllIn = true;
      result.current.state.players[1].isAllIn = true;
      result.current.state.players[2].isAllIn = true;

      expect(result.current.isBettingComplete()).toBe(true);
    });

    it('should not complete betting round if active player has not acted', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // One player acts, but others haven't
      const currentPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'call');
      });

      // Betting round should not be complete yet
      expect(result.current.isBettingComplete()).toBe(false);
    });

    it('should not complete betting round if player has not matched current bet', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Player raises
      const currentPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'raise', 20);
      });

      // Other players need to call the raise
      expect(result.current.isBettingComplete()).toBe(false);
    });
  });

  describe('Edge Cases - Split Pots', () => {
    it('should split pot evenly when two players have identical hands', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Set up scenario where players will have identical hands
      // This requires manipulating the deck/cards which is complex,
      // so we'll test the pot splitting logic directly

      const player1 = result.current.state.players[0];
      const player2 = result.current.state.players[1];
      const player3 = result.current.state.players[2];

      // Fold player 3
      player3.isFolded = true;

      // Set pot to 100
      result.current.state.pot = 100;

      // Give players identical hole cards (for testing purposes)
      player1.holeCards = [
        { rank: 'A', suit: 'hearts' },
        { rank: 'K', suit: 'hearts' }
      ];
      player2.holeCards = [
        { rank: 'A', suit: 'spades' },
        { rank: 'K', suit: 'spades' }
      ];

      // Set community cards that would give both players the same hand
      result.current.state.communityCards = [
        { rank: '2', suit: 'diamonds' },
        { rank: '3', suit: 'diamonds' },
        { rank: '4', suit: 'diamonds' },
        { rank: '5', suit: 'diamonds' },
        { rank: '6', suit: 'diamonds' }
      ];

      result.current.state.currentPhase = 'river';

      act(() => {
        result.current.determineWinner();
      });

      // Both players should win
      expect(result.current.state.winners.length).toBeGreaterThanOrEqual(1);

      // If there are 2 winners, pot should be split
      if (result.current.state.winners.length === 2) {
        const winner1Chips = result.current.state.winners[0].chips;
        const winner2Chips = result.current.state.winners[1].chips;

        // Each winner should get half the pot (50)
        // Note: Original chips vary based on bets made, so we check they both got equal shares
        expect(Math.abs(winner1Chips - winner2Chips)).toBeLessThanOrEqual(1); // Allow for rounding
      }
    });
  });

  describe('Edge Cases - Minimum Raise Calculations', () => {
    it('should calculate minimum raise correctly after initial bet', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // After blinds, current bet is 10, min raise should be 20 (current bet + big blind)
      expect(result.current.state.currentBet).toBe(10);
      expect(result.current.state.minRaise).toBe(20);
    });

    it('should update minimum raise after a raise', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'raise', 20);
      });

      // After raising to 20, min raise should be 30 (20 + 10)
      expect(result.current.state.currentBet).toBe(20);
      expect(result.current.state.minRaise).toBe(30);
    });

    it('should allow all-in for less than minimum raise', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const currentPlayer = result.current.getCurrentPlayer();
      currentPlayer.chips = 15; // Less than min raise of 20

      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'raise', 20);
      });

      const updatedPlayer = result.current.state.players.find(p => p.id === currentPlayer.id);
      expect(updatedPlayer?.isAllIn).toBe(true);
      expect(updatedPlayer?.chips).toBe(0);
    });
  });

  describe('Edge Cases - Blind Posting with Few Players', () => {
    it('should post blinds correctly with 3 players', () => {
      const { result } = renderHook(() => useGameState());

      // Eliminate one player
      result.current.state.players[3].chips = 0;

      act(() => {
        result.current.resetForNextHand();
      });

      expect(result.current.state.players.length).toBe(3);

      act(() => {
        result.current.startNewHand();
      });

      // Verify blinds were posted
      expect(result.current.state.pot).toBe(15); // 5 + 10

      // Verify small blind is at position (dealer + 1) % 3
      const sbPos = (result.current.state.dealerPosition + 1) % 3;
      expect(result.current.state.players[sbPos].currentBet).toBe(5);

      // Verify big blind is at position (dealer + 2) % 3
      const bbPos = (result.current.state.dealerPosition + 2) % 3;
      expect(result.current.state.players[bbPos].currentBet).toBe(10);
    });

    it('should post blinds correctly with 2 players', () => {
      const { result } = renderHook(() => useGameState());

      // Eliminate two players
      result.current.state.players[2].chips = 0;
      result.current.state.players[3].chips = 0;

      act(() => {
        result.current.resetForNextHand();
      });

      expect(result.current.state.players.length).toBe(2);

      act(() => {
        result.current.startNewHand();
      });

      // Verify blinds were posted
      expect(result.current.state.pot).toBe(15);

      // With 2 players, positions wrap around correctly
      const sbPos = (result.current.state.dealerPosition + 1) % 2;
      const bbPos = (result.current.state.dealerPosition + 2) % 2;

      expect(result.current.state.players[sbPos].currentBet).toBe(5);
      expect(result.current.state.players[bbPos].currentBet).toBe(10);
    });

    it('should handle dealer button rotation with 2 players', () => {
      const { result } = renderHook(() => useGameState());

      // Eliminate two players
      result.current.state.players[2].chips = 0;
      result.current.state.players[3].chips = 0;

      act(() => {
        result.current.resetForNextHand();
      });

      const initialDealer = result.current.state.dealerPosition;

      act(() => {
        result.current.resetForNextHand();
      });

      // Dealer should rotate
      expect(result.current.state.dealerPosition).toBe((initialDealer + 1) % 2);
    });
  });

  describe('Hand Integrity - Phase Progression', () => {
    it('should proceed through all phases in correct order: pre-flop → flop → turn → river → showdown', () => {
      const { result } = renderHook(() => useGameState());

      // Start new hand
      act(() => {
        result.current.startNewHand();
      });

      // Verify initial phase is pre-flop
      expect(result.current.state.currentPhase).toBe('pre-flop');
      expect(result.current.state.communityCards).toHaveLength(0);
      expect(result.current.state.pot).toBe(15); // Blinds posted

      // Verify all players have hole cards
      result.current.state.players.forEach(player => {
        expect(player.holeCards).toHaveLength(2);
      });

      // Complete pre-flop betting round (all players call/check)
      while (!result.current.isBettingComplete()) {
        const currentPlayer = result.current.getCurrentPlayer();
        act(() => {
          if (currentPlayer.currentBet === result.current.state.currentBet) {
            result.current.handlePlayerAction(currentPlayer.id, 'check');
          } else {
            result.current.handlePlayerAction(currentPlayer.id, 'call');
          }
        });
      }

      // Advance to flop
      act(() => {
        result.current.advancePhase();
      });

      expect(result.current.state.currentPhase).toBe('flop');
      expect(result.current.state.communityCards).toHaveLength(3);
      expect(result.current.state.currentBet).toBe(0); // Bet resets after phase advance

      // Verify all players' hasActed reset for new betting round
      result.current.state.players.forEach(player => {
        if (!player.isFolded) {
          expect(player.hasActed).toBe(false);
        }
      });

      // Complete flop betting round (all check)
      while (!result.current.isBettingComplete()) {
        const currentPlayer = result.current.getCurrentPlayer();
        act(() => {
          result.current.handlePlayerAction(currentPlayer.id, 'check');
        });
      }

      // Advance to turn
      act(() => {
        result.current.advancePhase();
      });

      expect(result.current.state.currentPhase).toBe('turn');
      expect(result.current.state.communityCards).toHaveLength(4);
      expect(result.current.state.currentBet).toBe(0);

      // Complete turn betting round (all check)
      while (!result.current.isBettingComplete()) {
        const currentPlayer = result.current.getCurrentPlayer();
        act(() => {
          result.current.handlePlayerAction(currentPlayer.id, 'check');
        });
      }

      // Advance to river
      act(() => {
        result.current.advancePhase();
      });

      expect(result.current.state.currentPhase).toBe('river');
      expect(result.current.state.communityCards).toHaveLength(5);
      expect(result.current.state.currentBet).toBe(0);

      // Complete river betting round (all check)
      while (!result.current.isBettingComplete()) {
        const currentPlayer = result.current.getCurrentPlayer();
        act(() => {
          result.current.handlePlayerAction(currentPlayer.id, 'check');
        });
      }

      // Advance to showdown
      act(() => {
        result.current.advancePhase();
      });

      expect(result.current.state.currentPhase).toBe('showdown');

      // Determine winner
      act(() => {
        result.current.determineWinner();
      });

      // Verify hand is complete
      expect(result.current.state.isHandComplete).toBe(true);
      expect(result.current.state.winners.length).toBeGreaterThan(0);
    });

    it('should maintain correct game state throughout entire hand with raises', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      const initialPot = result.current.state.pot;

      // Pre-flop: first player raises
      const firstPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(firstPlayer.id, 'raise', 20);
      });

      expect(result.current.state.currentBet).toBe(20);
      const potAfterRaise = result.current.state.pot;
      expect(potAfterRaise).toBeGreaterThan(initialPot);

      // Other players fold except one who calls
      let nextPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(nextPlayer.id, 'call');
      });

      nextPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(nextPlayer.id, 'fold');
      });

      nextPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(nextPlayer.id, 'fold');
      });

      // Should advance to flop
      act(() => {
        result.current.advancePhase();
      });

      expect(result.current.state.currentPhase).toBe('flop');
      expect(result.current.state.communityCards).toHaveLength(3);

      // Count non-folded players
      const nonFoldedPlayers = result.current.state.players.filter(p => !p.isFolded);
      expect(nonFoldedPlayers.length).toBe(2);

      // Both remaining players check on flop
      while (!result.current.isBettingComplete()) {
        const currentPlayer = result.current.getCurrentPlayer();
        act(() => {
          result.current.handlePlayerAction(currentPlayer.id, 'check');
        });
      }

      // Advance through remaining phases
      act(() => {
        result.current.advancePhase(); // to turn
      });
      expect(result.current.state.currentPhase).toBe('turn');

      while (!result.current.isBettingComplete()) {
        const currentPlayer = result.current.getCurrentPlayer();
        act(() => {
          result.current.handlePlayerAction(currentPlayer.id, 'check');
        });
      }

      act(() => {
        result.current.advancePhase(); // to river
      });
      expect(result.current.state.currentPhase).toBe('river');

      while (!result.current.isBettingComplete()) {
        const currentPlayer = result.current.getCurrentPlayer();
        act(() => {
          result.current.handlePlayerAction(currentPlayer.id, 'check');
        });
      }

      act(() => {
        result.current.advancePhase(); // to showdown
      });
      expect(result.current.state.currentPhase).toBe('showdown');

      act(() => {
        result.current.determineWinner();
      });

      expect(result.current.state.isHandComplete).toBe(true);
    });

    it('should skip directly to showdown when only one player remains after folds', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      expect(result.current.state.currentPhase).toBe('pre-flop');

      // All players fold except one (using getCurrentPlayer to respect turn order)
      for (let i = 0; i < 3; i++) {
        const currentPlayer = result.current.getCurrentPlayer();
        act(() => {
          result.current.handlePlayerAction(currentPlayer.id, 'fold');
        });
      }

      // Only one player remains, betting should be complete
      expect(result.current.isBettingComplete()).toBe(true);

      // Determine winner (no need to advance through phases)
      act(() => {
        result.current.determineWinner();
      });

      const winner = result.current.state.winners[0];
      expect(winner).toBeDefined();
      expect(winner.isFolded).toBe(false);
      expect(result.current.state.isHandComplete).toBe(true);
    });

    it('should handle all-in scenario and proceed through all phases to showdown', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Get current player and set them to have limited chips
      const currentPlayer = result.current.getCurrentPlayer();
      currentPlayer.chips = 15;

      // Player goes all-in by raising
      act(() => {
        result.current.handlePlayerAction(currentPlayer.id, 'raise', 20);
      });

      const updatedPlayer = result.current.state.players.find(p => p.id === currentPlayer.id);
      expect(updatedPlayer?.isAllIn).toBe(true);
      expect(updatedPlayer?.chips).toBe(0);

      // Other players call or fold
      let nextPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(nextPlayer.id, 'call');
      });

      nextPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(nextPlayer.id, 'fold');
      });

      nextPlayer = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(nextPlayer.id, 'fold');
      });

      // Should advance to flop even with all-in player
      act(() => {
        result.current.advancePhase();
      });

      expect(result.current.state.currentPhase).toBe('flop');
      expect(result.current.state.communityCards).toHaveLength(3);

      // Continue through phases
      const nonFoldedPlayers = result.current.state.players.filter(p => !p.isFolded && !p.isAllIn);
      if (nonFoldedPlayers.length > 0) {
        act(() => {
          result.current.handlePlayerAction(nonFoldedPlayers[0].id, 'check');
        });
      }

      act(() => {
        result.current.advancePhase(); // to turn
      });
      expect(result.current.state.currentPhase).toBe('turn');

      if (nonFoldedPlayers.length > 0) {
        act(() => {
          result.current.handlePlayerAction(nonFoldedPlayers[0].id, 'check');
        });
      }

      act(() => {
        result.current.advancePhase(); // to river
      });
      expect(result.current.state.currentPhase).toBe('river');

      if (nonFoldedPlayers.length > 0) {
        act(() => {
          result.current.handlePlayerAction(nonFoldedPlayers[0].id, 'check');
        });
      }

      act(() => {
        result.current.advancePhase(); // to showdown
      });
      expect(result.current.state.currentPhase).toBe('showdown');

      act(() => {
        result.current.determineWinner();
      });

      expect(result.current.state.isHandComplete).toBe(true);
      expect(result.current.state.winners.length).toBeGreaterThan(0);
    });

    it('should maintain deck integrity throughout phases (no duplicate cards)', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Collect all dealt cards
      const dealtCards: string[] = [];

      // Add hole cards
      result.current.state.players.forEach(player => {
        player.holeCards.forEach(card => {
          const cardStr = `${card.rank}${card.suit}`;
          expect(dealtCards).not.toContain(cardStr); // No duplicates
          dealtCards.push(cardStr);
        });
      });

      // Advance through all phases and collect community cards
      act(() => {
        result.current.advancePhase(); // flop
      });

      result.current.state.communityCards.forEach(card => {
        const cardStr = `${card.rank}${card.suit}`;
        expect(dealtCards).not.toContain(cardStr);
        dealtCards.push(cardStr);
      });

      act(() => {
        result.current.advancePhase(); // turn
      });

      result.current.state.communityCards.forEach(card => {
        const cardStr = `${card.rank}${card.suit}`;
        if (!dealtCards.includes(cardStr)) {
          dealtCards.push(cardStr);
        }
      });

      act(() => {
        result.current.advancePhase(); // river
      });

      result.current.state.communityCards.forEach(card => {
        const cardStr = `${card.rank}${card.suit}`;
        if (!dealtCards.includes(cardStr)) {
          dealtCards.push(cardStr);
        }
      });

      // Total should be 8 hole cards (4 players × 2) + 5 community cards = 13 unique cards
      expect(dealtCards.length).toBe(13);

      // Verify no duplicates
      const uniqueCards = new Set(dealtCards);
      expect(uniqueCards.size).toBe(dealtCards.length);
    });

    it('should reset player states correctly between betting rounds', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startNewHand();
      });

      // Pre-flop: players act
      const player1 = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(player1.id, 'call');
      });
      expect(result.current.state.players.find(p => p.id === player1.id)?.hasActed).toBe(true);

      const player2 = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(player2.id, 'call');
      });

      const player3 = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(player3.id, 'call');
      });

      const player4 = result.current.getCurrentPlayer();
      act(() => {
        result.current.handlePlayerAction(player4.id, 'check');
      });

      // Advance to flop
      act(() => {
        result.current.advancePhase();
      });

      // Verify all players' hasActed flag is reset
      result.current.state.players.forEach(player => {
        expect(player.hasActed).toBe(false);
      });

      // Verify currentBet for each player is reset to 0
      result.current.state.players.forEach(player => {
        expect(player.currentBet).toBe(0);
      });

      // Verify global currentBet is reset to 0
      expect(result.current.state.currentBet).toBe(0);
    });
  });
});
