/**
 * Western saloon-style action buttons.
 * Rustic wood and leather aesthetic for poker decisions.
 */

import { useState, useEffect } from 'react';
import { GameState } from '../types/game';

interface ActionButtonsProps {
  gameState: GameState;
  onFold: () => void;
  onCall: () => void;
  onRaise: (amount?: number) => void;
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

  // Calculate minimum and maximum raise amounts
  const minRaiseAmount = Math.min(minRaise, userPlayer.currentBet + userPlayer.chips);
  const maxRaiseAmount = userPlayer.currentBet + userPlayer.chips;
  const hasEnoughForMinRaise = userPlayer.chips >= (minRaise - userPlayer.currentBet);

  // State for custom raise amount
  const [raiseAmount, setRaiseAmount] = useState(minRaiseAmount);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  // Reset raise amount when it's the user's turn or when betting changes
  useEffect(() => {
    if (isUserTurn) {
      setRaiseAmount(minRaiseAmount);
      setShowRaiseSlider(false);
    }
  }, [isUserTurn, minRaiseAmount]);

  // Determine button text and states
  const isCheck = amountToCall === 0;
  const callButtonText = isCheck ? 'Check' : `Call $${amountToCall}`;

  // Determine raise button text
  let raiseButtonText = 'Raise';
  if (!canRaise) {
    raiseButtonText = 'All-In';
  } else if (hasEnoughForMinRaise) {
    if (showRaiseSlider) {
      raiseButtonText = `Raise to $${raiseAmount}`;
    } else {
      raiseButtonText = 'Raise';
    }
  } else {
    raiseButtonText = 'All-In';
  }

  // Button disabled states
  const foldDisabled = !isUserTurn;
  const callDisabled = !isUserTurn || !canCall;
  const raiseDisabled = !isUserTurn || !canRaise;

  // Handle raise button click
  const handleRaiseClick = () => {
    if (!hasEnoughForMinRaise || maxRaiseAmount === minRaiseAmount) {
      // Go all-in immediately if can't meet min raise or no range to choose from
      onRaise(maxRaiseAmount);
    } else if (showRaiseSlider) {
      // Confirm the raise with the selected amount
      onRaise(raiseAmount);
      setShowRaiseSlider(false);
    } else {
      // Show the slider
      setShowRaiseSlider(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 xl:-translate-x-[calc(50%+90px)] z-10 w-[calc(100%-2rem)] sm:w-auto max-w-lg">
      <div
        className="bg-gradient-to-b from-wood-700 via-wood-800 to-wood-900 rounded-lg shadow-2xl p-2 sm:p-4 border-2 border-sand-200/30"
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

        {/* Raise amount slider */}
        {showRaiseSlider && isUserTurn && hasEnoughForMinRaise && (
          <div className="mb-3 relative z-10 px-2">
            <div className="bg-wood-800/50 rounded-lg p-3 border border-sand-200/20">
              <label htmlFor="raise-slider" className="block text-sand-200 text-sm font-body mb-2">
                Select raise amount: ${raiseAmount}
              </label>
              <input
                id="raise-slider"
                type="range"
                min={minRaiseAmount}
                max={maxRaiseAmount}
                step={bigBlind}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="w-full h-2 bg-wood-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                style={{
                  background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${((raiseAmount - minRaiseAmount) / (maxRaiseAmount - minRaiseAmount)) * 100}%, #4a3f35 ${((raiseAmount - minRaiseAmount) / (maxRaiseAmount - minRaiseAmount)) * 100}%, #4a3f35 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-sand-200/70 mt-1">
                <span>Min: ${minRaiseAmount}</span>
                <span>Max: ${maxRaiseAmount}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 relative z-10">
          {/* Fold Button */}
          <button
            onClick={onFold}
            disabled={foldDisabled}
            aria-label="Fold your hand and forfeit this round"
            aria-disabled={foldDisabled}
            className={`
              flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-body font-bold text-base sm:text-lg transition-all min-h-[48px]
              ${
                foldDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-red-700 hover:bg-red-600 text-white shadow-lg hover:shadow-red-700/50 hover:scale-105 active:scale-95 border-2 border-red-800 ripple-effect'
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
              flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-body font-bold text-base sm:text-lg transition-all min-w-[80px] sm:min-w-[140px] min-h-[48px]
              ${
                callDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-green-700 hover:bg-green-600 text-white shadow-lg hover:shadow-green-700/50 hover:scale-105 active:scale-95 border-2 border-green-800 ripple-effect'
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
            onClick={handleRaiseClick}
            disabled={raiseDisabled}
            aria-label={
              !canRaise
                ? "Go all-in with remaining chips"
                : hasEnoughForMinRaise
                ? showRaiseSlider
                  ? `Confirm raise to $${raiseAmount}`
                  : "Open raise amount selector"
                : "Go all-in with remaining chips"
            }
            aria-disabled={raiseDisabled}
            className={`
              flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-body font-bold text-base sm:text-lg transition-all min-w-[80px] sm:min-w-[140px] min-h-[48px]
              ${
                raiseDisabled
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-900 shadow-lg hover:shadow-gold-500/50 hover:scale-105 active:scale-95 border-2 border-gold-600 ripple-effect'
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
          <div className="mt-2 sm:mt-3 text-center text-yellow-300 text-xs sm:text-sm font-body font-medium animate-pulse">
            Your turn to act
          </div>
        )}

        {!isUserTurn && currentPlayer && (
          <div className="mt-2 sm:mt-3 text-center text-sand-200/70 text-xs sm:text-sm font-body">
            Waiting for {currentPlayer.name}...
          </div>
        )}
      </div>
    </div>
  );
}
