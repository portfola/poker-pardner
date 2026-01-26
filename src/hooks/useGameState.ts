/**
 * Custom React hook for managing poker game state.
 * Uses useReducer for complex state management with well-defined actions.
 */

import { useReducer, useCallback } from 'react';
import { GameState, Player, BettingAction, NarratorEvent, ActionHistoryEntry } from '../types/game';
import { createShuffledDeck, dealCards } from '../utils/cards';
import { getBestFiveCardHand, determineWinners } from '../utils/handEvaluator';

// Action types for the reducer
type GameAction =
  | { type: 'START_NEW_HAND' }
  | { type: 'PLAYER_ACTION'; playerId: string; action: BettingAction; amount?: number }
  | { type: 'START_PHASE_ADVANCE' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'DETERMINE_WINNER' }
  | { type: 'RESET_FOR_NEXT_HAND' }
  | { type: 'ELIMINATE_PLAYER'; playerId: string }
  | { type: 'SET_PENDING_EVENT'; event: NarratorEvent | null }
  | { type: 'CLEAR_PENDING_EVENT' }
  | { type: 'ADD_ACTION_HISTORY'; entry: Omit<ActionHistoryEntry, 'id' | 'timestamp'> }
  | { type: 'SET_WAITING_FOR_NEXT'; waiting: boolean };

/**
 * Creates the initial game state with 4 players.
 */
function createInitialState(): GameState {
  const players: Player[] = [
    {
      id: 'user',
      name: 'You',
      chips: 100,
      holeCards: [],
      isFolded: false,
      isUser: true,
      position: 0,
      currentBet: 0,
      totalBet: 0,
      hasActed: false,
      isAllIn: false,
    },
    {
      id: 'ai1',
      name: 'Doc',
      chips: 100,
      holeCards: [],
      isFolded: false,
      isUser: false,
      position: 1,
      currentBet: 0,
      totalBet: 0,
      hasActed: false,
      isAllIn: false,
    },
    {
      id: 'ai2',
      name: 'Slim',
      chips: 100,
      holeCards: [],
      isFolded: false,
      isUser: false,
      position: 2,
      currentBet: 0,
      totalBet: 0,
      hasActed: false,
      isAllIn: false,
    },
    {
      id: 'ai3',
      name: 'Annie',
      chips: 100,
      holeCards: [],
      isFolded: false,
      isUser: false,
      position: 3,
      currentBet: 0,
      totalBet: 0,
      hasActed: false,
      isAllIn: false,
    },
  ];

  return {
    players,
    pot: 0,
    communityCards: [],
    currentPhase: 'pre-flop',
    dealerPosition: 0,
    currentPlayerIndex: 0,
    currentBet: 0,
    minRaise: 10,
    smallBlind: 5,
    bigBlind: 10,
    deck: [],
    mode: 'tutorial',
    isHandComplete: false,
    winners: [],
    winningHands: [],
    isAdvancingPhase: false,
    isWaitingForContinue: false,
    pendingEvent: null,
    actionHistory: [],
    isWaitingForNextAction: false,
  };
}

/**
 * Posts blinds for the small blind and big blind positions.
 */
function postBlinds(state: GameState): GameState {
  const newState = { ...state };
  const activePlayers = newState.players.filter(p => p.chips > 0);

  if (activePlayers.length < 2) {
    throw new Error(`Not enough players to post blinds: ${activePlayers.length}`);
  }

  const smallBlindPos = (newState.dealerPosition + 1) % newState.players.length;
  const bigBlindPos = (newState.dealerPosition + 2) % newState.players.length;

  // Post small blind
  const sbPlayer = newState.players[smallBlindPos];
  const sbAmount = Math.min(sbPlayer.chips, newState.smallBlind);
  sbPlayer.chips -= sbAmount;
  sbPlayer.currentBet = sbAmount;
  sbPlayer.totalBet = sbAmount;
  newState.pot += sbAmount;

  if (sbPlayer.chips === 0) {
    sbPlayer.isAllIn = true;
  }

  // Post big blind
  const bbPlayer = newState.players[bigBlindPos];
  const bbAmount = Math.min(bbPlayer.chips, newState.bigBlind);
  bbPlayer.chips -= bbAmount;
  bbPlayer.currentBet = bbAmount;
  bbPlayer.totalBet = bbAmount;
  newState.pot += bbAmount;
  newState.currentBet = bbAmount;

  if (bbPlayer.chips === 0) {
    bbPlayer.isAllIn = true;
  }

  // Set minimum raise to current bet + big blind
  newState.minRaise = newState.currentBet + newState.bigBlind;

  // First to act is player after big blind (pre-flop)
  newState.currentPlayerIndex = (bigBlindPos + 1) % newState.players.length;

  return newState;
}

/**
 * Deals hole cards to all players.
 */
function dealHoleCards(state: GameState): GameState {
  const newState = { ...state };

  // Deal 2 cards to each player who is still in the hand
  // This includes players who went all-in on blinds (chips === 0 but isAllIn === true)
  for (const player of newState.players) {
    if (player.chips > 0 || player.isAllIn) {
      player.holeCards = dealCards(newState.deck, 2);
    }
  }

  return newState;
}

/**
 * Gets the next player index who can act (not folded, not all-in, has chips).
 */
function getNextPlayerIndex(state: GameState, currentIndex: number): number {
  let nextIndex = (currentIndex + 1) % state.players.length;
  let attempts = 0;

  while (attempts < state.players.length) {
    const player = state.players[nextIndex];
    if (!player.isFolded && !player.isAllIn && player.chips > 0) {
      return nextIndex;
    }
    nextIndex = (nextIndex + 1) % state.players.length;
    attempts++;
  }

  return -1; // No valid player found
}

/**
 * Checks if the betting round is complete.
 * Round is complete when all active players have acted and matched the current bet.
 */
function isBettingRoundComplete(state: GameState): boolean {
  const activePlayers = state.players.filter(p => !p.isFolded && p.chips > 0);

  // If only one player remains, round is complete
  if (activePlayers.filter(p => !p.isAllIn).length <= 1) {
    return true;
  }

  // All active players must have acted and matched the current bet
  for (const player of activePlayers) {
    if (player.isAllIn) continue; // All-in players don't need to act
    if (!player.hasActed || player.currentBet < state.currentBet) {
      return false;
    }
  }

  return true;
}

/**
 * Game state reducer - handles all state transitions.
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_NEW_HAND': {
      const newState = { ...state };

      // Create and shuffle deck
      newState.deck = createShuffledDeck();

      // Reset player states
      newState.players = newState.players.map(p => ({
        ...p,
        holeCards: [],
        isFolded: false,
        currentBet: 0,
        totalBet: 0,
        hasActed: false,
        isAllIn: false,
      }));

      // Reset hand state
      newState.pot = 0;
      newState.communityCards = [];
      newState.currentPhase = 'pre-flop';
      newState.currentBet = 0;
      newState.minRaise = newState.bigBlind;
      newState.isHandComplete = false;
      newState.winners = [];
      newState.winningHands = [];
      newState.isAdvancingPhase = false;
      newState.isWaitingForContinue = false;
      newState.pendingEvent = null;
      newState.actionHistory = [];
      newState.isWaitingForNextAction = false;

      // Post blinds
      const stateWithBlinds = postBlinds(newState);

      // Add blind entries to action history
      const smallBlindPos = (stateWithBlinds.dealerPosition + 1) % stateWithBlinds.players.length;
      const bigBlindPos = (stateWithBlinds.dealerPosition + 2) % stateWithBlinds.players.length;
      const sbPlayer = stateWithBlinds.players[smallBlindPos];
      const bbPlayer = stateWithBlinds.players[bigBlindPos];
      const sbAmount = sbPlayer.currentBet;
      const bbAmount = bbPlayer.currentBet;

      stateWithBlinds.actionHistory = [
        {
          id: 1,
          playerName: sbPlayer.name,
          playerId: sbPlayer.id,
          action: 'smallBlind',
          amount: sbAmount,
          phase: 'pre-flop',
          potAfter: sbAmount,
          timestamp: Date.now(),
          isUser: sbPlayer.isUser,
        },
        {
          id: 2,
          playerName: bbPlayer.name,
          playerId: bbPlayer.id,
          action: 'bigBlind',
          amount: bbAmount,
          phase: 'pre-flop',
          potAfter: sbAmount + bbAmount,
          timestamp: Date.now(),
          isUser: bbPlayer.isUser,
        },
      ];

      // Deal hole cards
      const stateWithCards = dealHoleCards(stateWithBlinds);

      return stateWithCards;
    }

    case 'PLAYER_ACTION': {
      const { playerId, action: playerAction, amount } = action;
      const playerIndex = state.players.findIndex(p => p.id === playerId);

      if (playerIndex === -1) {
        throw new Error(`Player not found: ${playerId}`);
      }

      // Validate it's the player's turn
      if (state.players[state.currentPlayerIndex].id !== playerId) {
        throw new Error(
          `Not player's turn: expected ${state.players[state.currentPlayerIndex].id}, got ${playerId}`
        );
      }

      // Create new state with properly cloned players array
      const newState = {
        ...state,
        players: state.players.map((p, idx) =>
          idx === playerIndex ? { ...p } : p
        )
      };

      const player = newState.players[playerIndex];
      player.hasActed = true;

      switch (playerAction) {
        case 'fold':
          player.isFolded = true;
          break;

        case 'check':
          // Check is only valid if current bet is 0 or player has matched it
          if (newState.currentBet > player.currentBet) {
            throw new Error('Cannot check - must call or fold');
          }
          break;

        case 'call': {
          const amountToCall = newState.currentBet - player.currentBet;
          const actualCall = Math.min(amountToCall, player.chips);

          player.chips -= actualCall;
          player.currentBet += actualCall;
          player.totalBet += actualCall;
          newState.pot += actualCall;

          if (player.chips === 0) {
            player.isAllIn = true;
          }
          break;
        }

        case 'raise': {
          // The 'amount' parameter is the new total bet amount (e.g., 20 if raising from 10 to 20)
          const newTotalBet = amount || newState.minRaise;
          // Calculate how much the player needs to add to reach the new total bet
          const additionalChips = newTotalBet - player.currentBet;
          const actualRaise = Math.min(additionalChips, player.chips);

          player.chips -= actualRaise;
          player.currentBet += actualRaise;
          player.totalBet += actualRaise;
          newState.pot += actualRaise;

          // Update current bet and minimum raise
          newState.currentBet = player.currentBet;
          newState.minRaise = newState.currentBet + newState.bigBlind;

          if (player.chips === 0) {
            player.isAllIn = true;
          }

          // Reset hasActed for other players (they must respond to raise)
          newState.players.forEach(p => {
            if (p.id !== playerId && !p.isFolded && !p.isAllIn) {
              p.hasActed = false;
            }
          });
          break;
        }
      }

      // Check if betting round is complete
      if (isBettingRoundComplete(newState)) {
        // Move to next phase will be handled by separate action
      } else {
        // Move to next player
        const nextPlayer = getNextPlayerIndex(newState, newState.currentPlayerIndex);
        if (nextPlayer !== -1) {
          newState.currentPlayerIndex = nextPlayer;
        }
      }

      return newState;
    }

    case 'START_PHASE_ADVANCE': {
      // Mark that we're starting to advance phase (prevents re-triggering)
      return { ...state, isAdvancingPhase: true };
    }

    case 'ADVANCE_PHASE': {
      const newState = { ...state };

      // Reset betting round state
      newState.currentBet = 0;
      newState.players.forEach(p => {
        p.currentBet = 0;
        p.hasActed = false;
      });

      // Mark that phase advancement is complete
      newState.isAdvancingPhase = false;

      // Advance to next phase
      switch (newState.currentPhase) {
        case 'pre-flop':
          // Deal flop (3 cards)
          newState.communityCards = dealCards(newState.deck, 3);
          newState.currentPhase = 'flop';
          break;

        case 'flop':
          // Deal turn (1 card) - create new array to avoid mutation
          newState.communityCards = [...newState.communityCards, ...dealCards(newState.deck, 1)];
          newState.currentPhase = 'turn';
          break;

        case 'turn':
          // Deal river (1 card) - create new array to avoid mutation
          newState.communityCards = [...newState.communityCards, ...dealCards(newState.deck, 1)];
          newState.currentPhase = 'river';
          break;

        case 'river':
          // Move to showdown
          newState.currentPhase = 'showdown';
          newState.isAdvancingPhase = false;
          return newState;

        default:
          return newState;
      }

      // Set first player to act (first active player after dealer)
      let firstToAct = (newState.dealerPosition + 1) % newState.players.length;
      while (newState.players[firstToAct].isFolded ||
             newState.players[firstToAct].isAllIn ||
             newState.players[firstToAct].chips === 0) {
        firstToAct = (firstToAct + 1) % newState.players.length;
      }
      newState.currentPlayerIndex = firstToAct;

      return newState;
    }

    case 'DETERMINE_WINNER': {
      const newState = { ...state };
      const activePlayers = newState.players.filter(p => !p.isFolded);

      if (activePlayers.length === 0) {
        throw new Error('Cannot determine winner - no active players');
      }

      // If only one player remains, they win
      if (activePlayers.length === 1) {
        const winner = activePlayers[0];
        winner.chips += newState.pot;
        newState.winners = [winner];
        newState.winningHands = [];
        newState.isHandComplete = true;
        return newState;
      }

      // Evaluate all active players' hands
      // Only use getBestFiveCardHand if we have exactly 5 community cards
      const handEvaluations = activePlayers.map(player => {
        if (player.holeCards.length !== 2) {
          throw new Error(
            `Player ${player.id} has ${player.holeCards.length} hole cards (expected 2). ` +
            `Phase: ${newState.currentPhase}, Community cards: ${newState.communityCards.length}`
          );
        }

        if (newState.communityCards.length !== 5) {
          throw new Error(
            `Cannot evaluate hands at showdown - expected 5 community cards but got ${newState.communityCards.length}. ` +
            `Phase: ${newState.currentPhase}, Active players: ${activePlayers.length}, ` +
            `Total players: ${newState.players.length}`
          );
        }

        return getBestFiveCardHand(player.holeCards, newState.communityCards);
      });

      // Determine winner(s)
      const winnerIndices = determineWinners(handEvaluations);
      const winners = winnerIndices.map(i => activePlayers[i]);
      const winningHands = winnerIndices.map(i => handEvaluations[i]);

      // Award pot (split if multiple winners)
      const potShare = Math.floor(newState.pot / winners.length);
      winners.forEach(winner => {
        winner.chips += potShare;
      });

      newState.winners = winners;
      newState.winningHands = winningHands;
      newState.isHandComplete = true;

      return newState;
    }

    case 'RESET_FOR_NEXT_HAND': {
      const newState = { ...state };

      // Eliminate players with no chips first
      newState.players = newState.players.filter(p => p.chips > 0);

      // Re-assign positions
      newState.players.forEach((p, index) => {
        p.position = index;
      });

      // Rotate dealer button after eliminations (so it's within valid range)
      newState.dealerPosition = (newState.dealerPosition + 1) % newState.players.length;

      return newState;
    }

    case 'ELIMINATE_PLAYER': {
      const newState = { ...state };
      newState.players = newState.players.filter(p => p.id !== action.playerId);

      // Re-assign positions
      newState.players.forEach((p, index) => {
        p.position = index;
      });

      return newState;
    }

    case 'SET_PENDING_EVENT': {
      return {
        ...state,
        pendingEvent: action.event,
        isWaitingForContinue: action.event !== null,
      };
    }

    case 'CLEAR_PENDING_EVENT': {
      return {
        ...state,
        pendingEvent: null,
        isWaitingForContinue: false,
      };
    }

    case 'ADD_ACTION_HISTORY': {
      const newEntry: ActionHistoryEntry = {
        ...action.entry,
        id: state.actionHistory.length + 1,
        timestamp: Date.now(),
      };
      return {
        ...state,
        actionHistory: [...state.actionHistory, newEntry],
      };
    }

    case 'SET_WAITING_FOR_NEXT': {
      return {
        ...state,
        isWaitingForNextAction: action.waiting,
      };
    }

    default:
      return state;
  }
}

/**
 * Custom hook for managing game state.
 * Returns state and action functions.
 */
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const startNewHand = useCallback(() => {
    dispatch({ type: 'START_NEW_HAND' });
  }, []);

  const handlePlayerAction = useCallback((playerId: string, action: BettingAction, amount?: number) => {
    dispatch({ type: 'PLAYER_ACTION', playerId, action, amount });
  }, []);

  const startPhaseAdvance = useCallback(() => {
    dispatch({ type: 'START_PHASE_ADVANCE' });
  }, []);

  const advancePhase = useCallback(() => {
    dispatch({ type: 'ADVANCE_PHASE' });
  }, []);

  const determineWinner = useCallback(() => {
    dispatch({ type: 'DETERMINE_WINNER' });
  }, []);

  const resetForNextHand = useCallback(() => {
    dispatch({ type: 'RESET_FOR_NEXT_HAND' });
  }, []);

  const eliminatePlayer = useCallback((playerId: string) => {
    dispatch({ type: 'ELIMINATE_PLAYER', playerId });
  }, []);

  const setPendingEvent = useCallback((event: NarratorEvent | null) => {
    dispatch({ type: 'SET_PENDING_EVENT', event });
  }, []);

  const clearPendingEvent = useCallback(() => {
    dispatch({ type: 'CLEAR_PENDING_EVENT' });
  }, []);

  const addActionHistory = useCallback((entry: Omit<ActionHistoryEntry, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_ACTION_HISTORY', entry });
  }, []);

  const setWaitingForNext = useCallback((waiting: boolean) => {
    dispatch({ type: 'SET_WAITING_FOR_NEXT', waiting });
  }, []);

  // Helper to check if betting round is complete
  const isBettingComplete = useCallback(() => {
    return isBettingRoundComplete(state);
  }, [state]);

  // Get amount to call for a player
  const getAmountToCall = useCallback((playerId: string) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return 0;
    return state.currentBet - player.currentBet;
  }, [state]);

  // Get current player
  const getCurrentPlayer = useCallback(() => {
    return state.players[state.currentPlayerIndex];
  }, [state]);

  return {
    state,
    startNewHand,
    handlePlayerAction,
    startPhaseAdvance,
    advancePhase,
    determineWinner,
    resetForNextHand,
    eliminatePlayer,
    isBettingComplete,
    getAmountToCall,
    getCurrentPlayer,
    setPendingEvent,
    clearPendingEvent,
    addActionHistory,
    setWaitingForNext,
  };
}
