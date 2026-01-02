/**
 * Displays dynamic narration of what's happening in the game.
 * Provides context-aware descriptions of the current situation.
 */

import { GameState } from '../types/game';

interface ActionNarrationProps {
  gameState: GameState;
  lastAction?: string; // Optional: last action taken (from App state)
}

export function ActionNarration({ gameState, lastAction }: ActionNarrationProps) {
  const { players, currentPlayerIndex, currentPhase, currentBet, communityCards } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const userPlayer = players.find(p => p.isUser);

  // Generate narration based on game state
  const getNarration = (): string => {
    // If there's a recent action, show it
    if (lastAction) {
      return lastAction;
    }

    // Showdown phase
    if (currentPhase === 'showdown') {
      return 'All cards revealed. Determining the winner...';
    }

    // Check if hand just started
    if (currentPhase === 'pre-flop' && communityCards.length === 0) {
      if (!currentPlayer) {
        return 'Posting blinds and dealing cards...';
      }

      // First action of the hand
      if (currentPlayer.hasActed === false && currentBet === gameState.bigBlind) {
        if (currentPlayer.isUser) {
          return `Blinds posted. You're first to act. The big blind is $${gameState.bigBlind}.`;
        } else {
          return `Blinds posted. ${currentPlayer.name} is deciding whether to call, raise, or fold.`;
        }
      }
    }

    // Community cards just dealt
    if (currentPhase === 'flop' && !currentPlayer?.hasActed) {
      return `The flop has been dealt. ${currentPlayer?.isUser ? 'Your turn to act.' : `${currentPlayer?.name} is first to act.`}`;
    }

    if (currentPhase === 'turn' && !currentPlayer?.hasActed && communityCards.length === 4) {
      return `The turn card is revealed. ${currentPlayer?.isUser ? 'Your turn to act.' : `${currentPlayer?.name} is first to act.`}`;
    }

    if (currentPhase === 'river' && !currentPlayer?.hasActed && communityCards.length === 5) {
      return `The river card is revealed. ${currentPlayer?.isUser ? 'Your turn to act.' : `${currentPlayer?.name} is first to act.`}`;
    }

    // Regular betting action
    if (currentPlayer) {
      if (currentPlayer.isUser) {
        if (currentBet === 0 || (userPlayer && currentBet === userPlayer.currentBet)) {
          return 'Your turn to act. You can check or bet.';
        } else {
          const amountToCall = currentBet - (userPlayer?.currentBet || 0);
          return `Your turn to act. It costs $${amountToCall} to call.`;
        }
      } else {
        // AI player's turn
        if (currentBet === 0 || currentBet === currentPlayer.currentBet) {
          return `${currentPlayer.name} is deciding whether to check or bet.`;
        } else {
          const amountToCall = currentBet - currentPlayer.currentBet;
          return `${currentPlayer.name} needs $${amountToCall} to call. Deciding whether to call, raise, or fold.`;
        }
      }
    }

    // Default
    return 'Waiting for next action...';
  };

  const narration = getNarration();

  return (
    <div className="space-y-2">
      <div className="text-white text-sm leading-relaxed">
        {narration}
      </div>

      {/* Additional context if there's a bet */}
      {currentBet > 0 && currentPlayer && !currentPlayer.isUser && (
        <div className="text-gray-400 text-xs italic mt-2">
          Current bet: ${currentBet}
        </div>
      )}
    </div>
  );
}
