/**
 * Bottom panel combining cowboy narrator with action buttons.
 * Non-blocking UI that lets users see the full table while getting advice.
 * Redesigned with vintage playing card aesthetic.
 */

import { useState } from 'react';
import { GameState, NarratorEvent } from '../types/game';
import { HandRankings } from './HandRankings';
import { ActionHistory } from './ActionHistory';
import { describeHand } from '../utils/handStrength';

interface CowboyPanelProps {
  gameState: GameState;
  narratorEvent: NarratorEvent | null;
  onFold: () => void;
  onCall: () => void;
  onRaise: () => void;
  onNext: () => void;
  onNextHand: () => void;
}

export function CowboyPanel({
  gameState,
  narratorEvent,
  onFold,
  onCall,
  onRaise,
  onNext,
  onNextHand,
}: CowboyPanelProps) {
  const [showHandRankings, setShowHandRankings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { players, currentPlayerIndex, currentBet, minRaise, bigBlind, isHandComplete, actionHistory, isWaitingForNextAction } = gameState;
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

  // End of hand info
  const { winners, winningHands, pot } = gameState;
  const userWon = winners.some(w => w.isUser);
  const isSplitPot = winners.length > 1;
  const handDescription = winningHands.length > 0 ? describeHand(winningHands[0]) : '';
  const isUserEliminated = userPlayer && userPlayer.chips === 0 && isHandComplete;

  // Generate cowboy's end-of-hand message
  const getEndOfHandMessage = () => {
    if (!isHandComplete || winners.length === 0) return '';

    if (userWon) {
      if (isSplitPot) {
        return `Well I'll be! You split the pot, partner! $${Math.floor(pot / winners.length)} comin' your way.`;
      }
      return `Hot diggity! You raked in $${pot}! That's how it's done in the Wild West!`;
    } else {
      const winnerName = winners[0]?.name || 'Someone';
      if (isSplitPot) {
        return `Split pot this round! ${winners.map(w => w.name).join(' and ')} divide $${pot} between 'em.`;
      }
      return `${winnerName} takes the pot - $${pot}. Tip your hat and get ready for the next one, partner.`;
    }
  };

  // Get strength badge color
  const getStrengthBadge = (strength: string | undefined) => {
    if (!strength) return { bg: 'bg-stone-100', border: 'border-stone-300', text: 'text-stone-600' };
    if (strength.includes('strong')) return { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700' };
    if (strength.includes('medium')) return { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700' };
    return { bg: 'bg-rose-50', border: 'border-rose-400', text: 'text-rose-700' };
  };

  const strengthBadge = getStrengthBadge(narratorEvent?.handStrength);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

        .card-texture {
          background:
            linear-gradient(135deg, #f5f1e8 0%, #ebe4d1 100%);
          position: relative;
        }

        .card-texture::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px);
          opacity: 0.5;
          pointer-events: none;
        }

        .ornate-border {
          border: 3px solid;
          border-image: linear-gradient(135deg, #8b6914, #d4af37, #8b6914) 1;
          box-shadow:
            0 0 0 1px rgba(212, 175, 55, 0.3),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5),
            0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .cowboy-portrait {
          border: 4px solid;
          border-image: linear-gradient(145deg, #8b6914, #d4af37, #f4e5a8, #d4af37, #8b6914) 1;
          box-shadow:
            0 0 0 2px rgba(139, 105, 20, 0.4),
            inset 0 2px 8px rgba(255, 255, 255, 0.3),
            0 6px 16px rgba(0, 0, 0, 0.5);
          background: radial-gradient(circle at 30% 30%, #f4e5a8, #d4af37, #8b6914);
        }

        .poker-chip {
          position: relative;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
        }

        .poker-chip::before {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: inherit;
          border: 2px dashed rgba(255, 255, 255, 0.4);
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .status-pulse {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-5xl px-2 sm:px-4 pb-2 sm:pb-3">
          <div className="card-texture rounded-t-2xl sm:rounded-2xl ornate-border overflow-visible">
            <div className="relative p-3 sm:p-4">

              {/* Main Content Grid - Optimized for compactness */}
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-3 items-center">

                {/* Left: Cowboy Portrait + Phase Indicator */}
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <div className="relative">
                    <div
                      className="cowboy-portrait rounded-full w-16 h-16 sm:w-20 sm:h-20 overflow-hidden flex items-center justify-center"
                    >
                      <img
                        src="/img/cowboy_smile.png"
                        alt="Poker Cowboy Advisor"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Decorative corner elements */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-amber-600"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-amber-600"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-amber-600"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-amber-600"></div>
                  </div>

                  {/* Game Phase Indicator */}
                  <div
                    className="px-3 py-1 rounded border-2 border-amber-700/60 shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%)',
                    }}
                  >
                    <span
                      className="text-stone-800 text-[10px] sm:text-xs font-bold tracking-wider uppercase"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {gameState.currentPhase.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Center: Combined Narration & Advice */}
                <div>
                  {/* Main message with reasoning combined */}
                  <div className="relative bg-gradient-to-br from-amber-50/90 via-yellow-50/90 to-amber-100/90 rounded-lg border-2 border-amber-800/30 p-2.5 sm:p-3 shadow-lg">
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                      style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
                    ></div>

                    {isHandComplete && winners.length > 0 ? (
                      <div className="space-y-1.5">
                        {/* Winner announcement */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{userWon ? '🎉' : '🤠'}</span>
                          <p
                            className={`leading-snug text-xs sm:text-sm font-semibold ${userWon ? 'text-emerald-700' : 'text-stone-800'}`}
                            style={{ fontFamily: "'Crimson Text', serif" }}
                          >
                            {getEndOfHandMessage()}
                          </p>
                        </div>

                        {/* Winning hand description */}
                        {handDescription && (
                          <div className="pt-1.5 border-t border-amber-800/20">
                            <p className="text-stone-600 text-[11px] sm:text-xs flex items-start gap-1.5">
                              <span className="text-amber-700 flex-shrink-0">🃏</span>
                              <span>Winning hand: <strong>{handDescription}</strong></span>
                            </p>
                          </div>
                        )}

                        {/* User eliminated warning */}
                        {isUserEliminated && (
                          <div className="pt-1.5 border-t border-amber-800/20">
                            <p className="text-rose-700 text-[11px] sm:text-xs font-semibold flex items-start gap-1.5">
                              <span className="flex-shrink-0">💸</span>
                              <span>You're out of chips! Start a new game to try again.</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : narratorEvent ? (
                      <div className="space-y-1.5">
                        <p
                          className="text-stone-800 leading-snug text-xs sm:text-sm"
                          style={{ fontFamily: "'Crimson Text', serif" }}
                        >
                          {narratorEvent.message}
                        </p>

                        {narratorEvent.reasoning && (
                          <div className="pt-1.5 border-t border-amber-800/20">
                            <p className="text-stone-600 text-[11px] sm:text-xs italic flex items-start gap-1.5">
                              <span className="text-amber-700 flex-shrink-0 text-xs">💭</span>
                              <span>{narratorEvent.reasoning}</span>
                            </p>
                          </div>
                        )}

                        {narratorEvent.advice && (
                          <div className="pt-1.5 border-t border-amber-800/20">
                            <p className="text-stone-700 text-[11px] sm:text-xs font-semibold flex items-start gap-1.5">
                              <span className="text-emerald-700 flex-shrink-0">→</span>
                              <span>{narratorEvent.advice}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p
                        className="text-stone-600 italic text-xs sm:text-sm"
                        style={{ fontFamily: "'Crimson Text', serif" }}
                      >
                        {isUserTurn ? "Your move, partner!" : `Watchin' ${currentPlayer?.name || 'the table'}...`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Hand Strength Badge + Help */}
                <div className="flex lg:flex-col flex-row items-center gap-2 justify-center">
                  {/* Hand Strength Poker Chip */}
                  {narratorEvent?.handStrength && (
                    <div
                      className={`poker-chip rounded-full w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center ${strengthBadge.bg} border-4 ${strengthBadge.border}`}
                    >
                      <div
                        className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider opacity-70"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Hand
                      </div>
                      <div
                        className={`text-[10px] sm:text-xs font-black ${strengthBadge.text} text-center leading-tight px-2 mt-0.5`}
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {narratorEvent.handStrength.split(' ').map((word, i) => (
                          <div key={i}>{word}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Help button */}
                  <button
                    onClick={() => setShowHandRankings(true)}
                    className="poker-chip w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-stone-700 to-stone-900 hover:from-stone-600 hover:to-stone-800 text-amber-300 font-black text-base sm:text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-amber-600/50"
                    aria-label="View hand rankings"
                    title="Hand Rankings"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    ?
                  </button>
                </div>
              </div>

              {/* Action Buttons Row - Reduced spacing */}
              <div className="mt-3 flex gap-2 sm:gap-2.5 justify-center items-center">
                {/* History Button - always visible */}
                <button
                  onClick={() => setShowHistory(true)}
                  aria-label="View action history"
                  title="Action History"
                  className="poker-chip w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-stone-600 to-stone-800 hover:from-stone-500 hover:to-stone-700 text-amber-200 font-bold text-sm sm:text-base flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-amber-600/50"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Show Next Hand button when hand complete, Next button when waiting, otherwise action buttons */}
                {isHandComplete && winners.length > 0 ? (
                  <button
                    onClick={onNextHand}
                    aria-label={isUserEliminated ? "Start a new game" : "Deal the next hand"}
                    className="poker-chip px-8 sm:px-12 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-500 text-amber-950 hover:scale-105 active:scale-95 border-2 border-amber-700"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {isUserEliminated ? 'NEW GAME' : 'NEXT HAND'}
                  </button>
                ) : isWaitingForNextAction ? (
                  <button
                    onClick={onNext}
                    aria-label="Continue to next action"
                    className="poker-chip px-8 sm:px-12 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all bg-gradient-to-b from-sky-500 to-sky-700 hover:from-sky-400 hover:to-sky-600 text-white hover:scale-105 active:scale-95 border-2 border-sky-800 animate-pulse"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    NEXT
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onFold}
                      disabled={buttonsDisabled}
                      aria-label="Fold your hand"
                      className={`
                        poker-chip px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all
                        ${buttonsDisabled
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-50 border-2 border-stone-400'
                          : 'bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 text-white hover:scale-105 active:scale-95 border-2 border-rose-900'
                        }
                      `}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      FOLD
                    </button>

                    <button
                      onClick={onCall}
                      disabled={buttonsDisabled || !canCall}
                      aria-label={isCheck ? "Check" : `Call $${amountToCall}`}
                      className={`
                        poker-chip px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all min-w-[85px] sm:min-w-[110px]
                        ${buttonsDisabled || !canCall
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-50 border-2 border-stone-400'
                          : 'bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white hover:scale-105 active:scale-95 border-2 border-emerald-900'
                        }
                      `}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {callButtonText.toUpperCase()}
                    </button>

                    <button
                      onClick={onRaise}
                      disabled={buttonsDisabled || !canRaise}
                      aria-label={raiseButtonText}
                      className={`
                        poker-chip px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all min-w-[85px] sm:min-w-[110px]
                        ${buttonsDisabled || !canRaise
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-50 border-2 border-stone-400'
                          : 'bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-500 text-amber-950 hover:scale-105 active:scale-95 border-2 border-amber-700'
                        }
                      `}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {raiseButtonText.toUpperCase()}
                    </button>
                  </>
                )}
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
            className="card-texture rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto border-4 border-amber-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-amber-800/30">
              <h2
                className="text-stone-800 font-black text-lg sm:text-xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Hand Rankings
              </h2>
              <button
                onClick={() => setShowHandRankings(false)}
                className="text-stone-600 hover:text-stone-900 p-1 transition-colors"
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

      {/* Action History Modal */}
      <ActionHistory
        history={actionHistory}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
}
