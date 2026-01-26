/**
 * Bottom panel combining cowboy narrator with action buttons.
 * Non-blocking UI that lets users see the full table while getting advice.
 */

import { useState } from 'react';
import { GameState, NarratorEvent } from '../types/game';
import { HandRankings } from './HandRankings';

interface CowboyPanelProps {
  gameState: GameState;
  narratorEvent: NarratorEvent | null;
  onFold: () => void;
  onCall: () => void;
  onRaise: () => void;
}

export function CowboyPanel({
  gameState,
  narratorEvent,
  onFold,
  onCall,
  onRaise,
}: CowboyPanelProps) {
  const [showHandRankings, setShowHandRankings] = useState(false);

  const { players, currentPlayerIndex, currentBet, minRaise, bigBlind, isHandComplete } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const userPlayer = players.find(p => p.isUser);

  if (!userPlayer) return null;

  // Check if it's the user's turn to act
  const isUserTurn = currentPlayer?.isUser && !currentPlayer?.isFolded && !currentPlayer?.isAllIn;

  // Calculate action button states
  const amountToCall = currentBet - userPlayer.currentBet;
  const canCall = userPlayer.chips >= amountToCall;
  const canRaise = userPlayer.chips > amountToCall;
  const hasEnoughForMinRaise = userPlayer.chips >= minRaise;
  const isCheck = amountToCall === 0;
  const callButtonText = isCheck ? 'Check' : `Call $${amountToCall}`;

  let raiseButtonText = 'Raise';
  if (!canRaise) {
    raiseButtonText = 'All-In';
  } else if (hasEnoughForMinRaise) {
    raiseButtonText = `Raise to $${currentBet + bigBlind}`;
  } else {
    raiseButtonText = 'All-In';
  }

  // Button states - only enabled when it's user's turn and hand is active
  const buttonsDisabled = !isUserTurn || isHandComplete;

  // Get strength color
  const getStrengthColor = (strength: string | undefined) => {
    if (!strength) return 'text-gray-300';
    if (strength.includes('strong')) return 'text-green-400';
    if (strength.includes('medium')) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-20">
        {/* Main panel */}
        <div
          className="mx-auto max-w-4xl px-2 sm:px-4 pb-2 sm:pb-4"
        >
          <div
            className="rounded-t-xl sm:rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(to bottom, #5D4037, #4E342E, #3E2723)',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Wood grain texture */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(62, 39, 35, 0.3) 3px, rgba(62, 39, 35, 0.3) 6px)',
              }}
            />

            <div className="relative p-3 sm:p-4">
              {/* Top row: Cowboy + Narration + Help button */}
              <div className="flex items-start gap-3 mb-3">
                {/* Cowboy avatar */}
                <div
                  className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-3 border-wood-600"
                  style={{
                    background: 'linear-gradient(145deg, #8D6E63 0%, #6D4C41 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  <span role="img" aria-label="Cowboy">🤠</span>
                </div>

                {/* Speech bubble / narration area */}
                <div className="flex-1 min-w-0">
                  <div
                    className="rounded-lg p-2 sm:p-3 text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
                    }}
                  >
                    {narratorEvent ? (
                      <p className="text-wood-900 font-body leading-snug">
                        {narratorEvent.message}
                      </p>
                    ) : (
                      <p className="text-wood-700 font-body italic">
                        {isUserTurn ? "Your move, partner!" : `Watchin' ${currentPlayer?.name || 'the table'}...`}
                      </p>
                    )}
                  </div>

                  {/* AI Reasoning (compact) */}
                  {narratorEvent?.reasoning && (
                    <div className="mt-1 px-2 py-1 rounded bg-wood-900/30 text-xs text-sand-200 italic">
                      💭 {narratorEvent.reasoning}
                    </div>
                  )}
                </div>

                {/* Help button */}
                <button
                  onClick={() => setShowHandRankings(true)}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-wood-600 hover:bg-wood-500 text-sand-100 font-bold text-sm flex items-center justify-center transition-colors"
                  aria-label="View hand rankings"
                  title="Hand Rankings"
                >
                  ?
                </button>
              </div>

              {/* Middle row: Hand strength & advice (when user's turn) */}
              {narratorEvent?.type === 'user_turn' && (narratorEvent.handStrength || narratorEvent.advice) && (
                <div className="mb-3 flex flex-wrap gap-2 text-xs sm:text-sm">
                  {narratorEvent.handStrength && (
                    <div className="bg-black/30 rounded px-2 py-1">
                      <span className="text-sand-300">Hand: </span>
                      <span className={`font-bold ${getStrengthColor(narratorEvent.handStrength)}`}>
                        {narratorEvent.handStrength}
                      </span>
                    </div>
                  )}
                  {narratorEvent.advice && (
                    <div className="flex-1 bg-black/30 rounded px-2 py-1 text-sand-200">
                      <span className="text-sand-400">Advice: </span>
                      {narratorEvent.advice}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom row: Action buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={onFold}
                  disabled={buttonsDisabled}
                  aria-label="Fold your hand"
                  className={`
                    flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-body font-bold text-sm sm:text-base transition-all
                    ${buttonsDisabled
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-red-700 hover:bg-red-600 text-white hover:scale-105 active:scale-95 border-2 border-red-800'
                    }
                  `}
                  style={!buttonsDisabled ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)' } : {}}
                >
                  Fold
                </button>

                <button
                  onClick={onCall}
                  disabled={buttonsDisabled || !canCall}
                  aria-label={isCheck ? "Check" : `Call $${amountToCall}`}
                  className={`
                    flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-body font-bold text-sm sm:text-base transition-all min-w-[90px] sm:min-w-[120px]
                    ${buttonsDisabled || !canCall
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-green-700 hover:bg-green-600 text-white hover:scale-105 active:scale-95 border-2 border-green-800'
                    }
                  `}
                  style={!(buttonsDisabled || !canCall) ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)' } : {}}
                >
                  {callButtonText}
                </button>

                <button
                  onClick={onRaise}
                  disabled={buttonsDisabled || !canRaise}
                  aria-label={raiseButtonText}
                  className={`
                    flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-body font-bold text-sm sm:text-base transition-all min-w-[90px] sm:min-w-[120px]
                    ${buttonsDisabled || !canRaise
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-900 hover:scale-105 active:scale-95 border-2 border-gold-600'
                    }
                  `}
                  style={!(buttonsDisabled || !canRaise) ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3)' } : {}}
                >
                  {raiseButtonText}
                </button>
              </div>

              {/* Status indicator */}
              <div className="mt-2 text-center text-xs sm:text-sm font-body">
                {isUserTurn ? (
                  <span className="text-yellow-300 animate-pulse">Your turn to act</span>
                ) : !isHandComplete && currentPlayer ? (
                  <span className="text-sand-300/70">Waiting for {currentPlayer.name}...</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hand Rankings Modal */}
      {showHandRankings && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHandRankings(false)}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg">Hand Rankings</h2>
              <button
                onClick={() => setShowHandRankings(false)}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <HandRankings />
          </div>
        </div>
      )}
    </>
  );
}
