/**
 * Western saloon-style action buttons.
 * Rustic wood and leather aesthetic for poker decisions.
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
    <div className="fixed bottom-4 left-1/2 -translate-x-[calc(50%+90px)] z-10">
      <div
        className="bg-gradient-to-b from-wood-700 via-wood-800 to-wood-900 rounded-lg shadow-2xl p-4 border-2 border-sand-200/30"
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), inset 0 1px 2px rgba(139, 69, 19, 0.3)',
        }}
      >
        {/* Wood grain texture */}
        <div
          className="absolute inset-0 rounded-lg opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(62, 39, 35, 0.3) 3px, rgba(62, 39, 35, 0.3) 6px)',
          }}
        />

        <div className="flex gap-3 relative z-10">
          {/* Fold Button */}
          <button
            onClick={onFold}
            disabled={foldDisabled}
            aria-label="Fold your hand and forfeit this round"
            aria-disabled={foldDisabled}
            className={`
              px-8 py-4 rounded-lg font-body font-bold text-lg transition-all
              ${
                foldDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-red-700 hover:bg-red-600 text-white shadow-lg hover:shadow-red-700/50 hover:scale-105 active:scale-95 border-2 border-red-800'
              }
            `}
            style={
              !foldDisabled
                ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)' }
                : {}
            }
          >
            Fold
          </button>

          {/* Call/Check Button */}
          <button
            onClick={onCall}
            disabled={callDisabled}
            aria-label={isCheck ? "Check - pass without betting" : `Call the current bet of $${amountToCall}`}
            aria-disabled={callDisabled}
            className={`
              px-8 py-4 rounded-lg font-body font-bold text-lg transition-all min-w-[140px]
              ${
                callDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-green-700 hover:bg-green-600 text-white shadow-lg hover:shadow-green-700/50 hover:scale-105 active:scale-95 border-2 border-green-800'
              }
            `}
            style={
              !callDisabled
                ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)' }
                : {}
            }
          >
            {callButtonText}
          </button>

          {/* Raise Button */}
          <button
            onClick={onRaise}
            disabled={raiseDisabled}
            aria-label={
              !canRaise
                ? "Go all-in with remaining chips"
                : hasEnoughForMinRaise
                ? `Raise the bet to $${currentBet + bigBlind}`
                : "Go all-in with remaining chips"
            }
            aria-disabled={raiseDisabled}
            className={`
              px-8 py-4 rounded-lg font-body font-bold text-lg transition-all min-w-[140px]
              ${
                raiseDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-900 shadow-lg hover:shadow-gold-500/50 hover:scale-105 active:scale-95 border-2 border-gold-600'
              }
            `}
            style={
              !raiseDisabled
                ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3)' }
                : {}
            }
          >
            {raiseButtonText}
          </button>
        </div>

        {/* Hint Text */}
        {isUserTurn && (
          <div className="mt-3 text-center text-yellow-300 text-sm font-body font-medium animate-pulse">
            Your turn to act
          </div>
        )}

        {!isUserTurn && currentPlayer && (
          <div className="mt-3 text-center text-sand-200/70 text-sm font-body">
            Waiting for {currentPlayer.name}...
          </div>
        )}
      </div>
    </div>
  );
}
