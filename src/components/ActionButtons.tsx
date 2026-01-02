/**
 * Action buttons for player decisions.
 * Displays Fold, Call/Check, and Raise buttons with dynamic text and state.
 */

import { GameState } from '../types/game';

interface ActionButtonsProps {
  gameState: GameState;
  onFold: () => void;
  onCall: () => void;
  onRaise: () => void;
}

export function ActionButtons({ gameState, onFold, onCall, onRaise }: ActionButtonsProps) {
  const { players, currentPlayerIndex, currentBet, minRaise, bigBlind } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Check if it's the user's turn
  const isUserTurn = currentPlayer?.isUser ?? false;
  const userPlayer = players.find(p => p.isUser);

  if (!userPlayer) {
    return null;
  }

  // Calculate amounts
  const amountToCall = currentBet - userPlayer.currentBet;
  const canCall = userPlayer.chips >= amountToCall;
  const canRaise = userPlayer.chips > amountToCall;
  const hasEnoughForMinRaise = userPlayer.chips >= minRaise;

  // Determine button text and states
  const isCheck = amountToCall === 0;
  const callButtonText = isCheck ? 'Check' : `Call $${amountToCall}`;

  // Determine raise button text
  let raiseButtonText = 'Raise';
  if (!canRaise) {
    raiseButtonText = 'All-In';
  } else if (hasEnoughForMinRaise) {
    const raiseAmount = currentBet + bigBlind;
    raiseButtonText = `Raise to $${raiseAmount}`;
  } else {
    raiseButtonText = 'All-In';
  }

  // Button disabled states
  const foldDisabled = !isUserTurn;
  const callDisabled = !isUserTurn || !canCall;
  const raiseDisabled = !isUserTurn || !canRaise;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-gray-800/95 rounded-lg shadow-2xl p-4 border-2 border-gray-700">
        <div className="flex gap-3">
          {/* Fold Button */}
          <button
            onClick={onFold}
            disabled={foldDisabled}
            className={`
              px-8 py-4 rounded-lg font-bold text-lg transition-all
              ${
                foldDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-600/50 hover:scale-105 active:scale-95'
              }
            `}
          >
            Fold
          </button>

          {/* Call/Check Button */}
          <button
            onClick={onCall}
            disabled={callDisabled}
            className={`
              px-8 py-4 rounded-lg font-bold text-lg transition-all min-w-[140px]
              ${
                callDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-600/50 hover:scale-105 active:scale-95'
              }
            `}
          >
            {callButtonText}
          </button>

          {/* Raise Button */}
          <button
            onClick={onRaise}
            disabled={raiseDisabled}
            className={`
              px-8 py-4 rounded-lg font-bold text-lg transition-all min-w-[140px]
              ${
                raiseDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/50 hover:scale-105 active:scale-95'
              }
            `}
          >
            {raiseButtonText}
          </button>
        </div>

        {/* Hint Text */}
        {isUserTurn && (
          <div className="mt-3 text-center text-yellow-300 text-sm font-medium animate-pulse">
            Your turn to act
          </div>
        )}

        {!isUserTurn && currentPlayer && (
          <div className="mt-3 text-center text-gray-400 text-sm">
            Waiting for {currentPlayer.name}...
          </div>
        )}
      </div>
    </div>
  );
}
