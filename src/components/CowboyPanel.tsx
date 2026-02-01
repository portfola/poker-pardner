/**
 * Bottom panel combining cowboy narrator with action buttons.
 * Non-blocking UI that lets users see the full table while getting advice.
 * Redesigned with vintage playing card aesthetic.
 */

import { useState, useEffect } from 'react';
import { GameState, NarratorEvent } from '../types/game';
import { HandRankings } from './HandRankings';
import { ActionHistory } from './ActionHistory';
import { HandHistoryScreen } from './HandHistoryScreen';
import { describeHand, evaluateHandStrength, describeHoleCards } from '../utils/handStrength';
import { getBestFiveCardHand, getBestHandFromSix, evaluateHand } from '../utils/handEvaluator';
import { textToSpeechService } from '../utils/textToSpeech';

interface CowboyPanelProps {
  gameState: GameState;
  narratorEvent: NarratorEvent | null;
  onFold: () => void;
  onCall: () => void;
  onRaise: (amount?: number) => void;
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
  const [showHandHistory, setShowHandHistory] = useState(false);
  const [bubbleKey, setBubbleKey] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(() => textToSpeechService.isEnabled());

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

  // Calculate minimum and maximum raise amounts
  const minRaiseAmount = Math.min(minRaise, userPlayer.currentBet + userPlayer.chips);
  const maxRaiseAmount = userPlayer.currentBet + userPlayer.chips;
  const hasEnoughForMinRaise = userPlayer.chips >= (minRaise - userPlayer.currentBet);

  const isCheck = amountToCall === 0;
  const callButtonText = isCheck ? 'Check' : `Call $${amountToCall}`;

  // State for custom raise amount - now using discrete options
  const [raiseAmount, setRaiseAmount] = useState(minRaiseAmount);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  // Calculate 5 raise options between min and max
  const getRaiseOptions = (): number[] => {
    if (maxRaiseAmount <= minRaiseAmount) return [minRaiseAmount];

    const range = maxRaiseAmount - minRaiseAmount;
    if (range <= bigBlind * 4) {
      // Small range: just show what's available
      const options: number[] = [];
      for (let amt = minRaiseAmount; amt <= maxRaiseAmount && options.length < 5; amt += bigBlind) {
        options.push(amt);
      }
      return options;
    }

    // Larger range: distribute 5 options evenly
    const step = range / 4;
    return [
      minRaiseAmount,
      Math.round((minRaiseAmount + step) / bigBlind) * bigBlind,
      Math.round((minRaiseAmount + step * 2) / bigBlind) * bigBlind,
      Math.round((minRaiseAmount + step * 3) / bigBlind) * bigBlind,
      maxRaiseAmount,
    ].filter((val, idx, arr) => arr.indexOf(val) === idx); // Remove duplicates
  };

  // Reset raise amount when it's the user's turn or when betting changes
  useEffect(() => {
    if (isUserTurn) {
      setRaiseAmount(minRaiseAmount);
      setShowRaiseSlider(false);
    }
  }, [isUserTurn, minRaiseAmount]);

  // End of hand info - declare before useEffect that depends on it
  const { winners, winningHands, pot } = gameState;

  // Trigger bubble animation when narrator event changes
  useEffect(() => {
    setBubbleKey(prev => prev + 1);
  }, [narratorEvent?.message, isHandComplete, winners.length]);

  // Speak narration when it changes
  useEffect(() => {
    if (textToSpeechService.isEnabled()) {
      if (isHandComplete && winners.length > 0) {
        // Speak end-of-hand message
        const message = getEndOfHandMessage();
        if (message) {
          textToSpeechService.speak(message);
        }
      } else if (narratorEvent?.message) {
        // Speak narrator message and reasoning combined
        const fullMessage = narratorEvent.reasoning
          ? `${narratorEvent.message} ${narratorEvent.reasoning}`
          : narratorEvent.message;
        textToSpeechService.speak(fullMessage);
      }
    }
  }, [narratorEvent?.message, narratorEvent?.reasoning, isHandComplete, winners.length]);

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

  // Button states - only enabled when it's user's turn and hand is active
  const buttonsDisabled = !isUserTurn || isHandComplete;

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

  // Handle voice toggle
  const handleVoiceToggle = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    textToSpeechService.setEnabled(newState);
  };
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

  // Calculate current hand strength for the user
  const getCurrentHandStrength = (): { strength: 'weak' | 'medium' | 'strong'; description: string } | null => {
    if (!userPlayer || userPlayer.holeCards.length === 0) return null;

    let strength: 'weak' | 'medium' | 'strong';
    let handDescription: string;

    if (userPlayer.holeCards.length === 2 && gameState.communityCards.length === 5) {
      // Full board (river) - evaluate best 5-card hand from all 7 cards
      const evaluation = getBestFiveCardHand(userPlayer.holeCards, gameState.communityCards);
      strength = evaluateHandStrength(evaluation);
      handDescription = describeHand(evaluation);
    } else if (userPlayer.holeCards.length === 2 && gameState.communityCards.length === 3) {
      // Flop (exactly 5 cards) - evaluate as-is
      const allCards = [...userPlayer.holeCards, ...gameState.communityCards];
      const evaluation = evaluateHand(allCards);
      strength = evaluateHandStrength(evaluation);
      handDescription = describeHand(evaluation);
    } else if (userPlayer.holeCards.length === 2 && gameState.communityCards.length === 4) {
      // Turn (6 cards) - find best 5-card combination
      const allCards = [...userPlayer.holeCards, ...gameState.communityCards];
      const evaluation = getBestHandFromSix(allCards);
      strength = evaluateHandStrength(evaluation);
      handDescription = describeHand(evaluation);
    } else {
      // Pre-flop or unusual state - just evaluate starting hand strength
      handDescription = describeHoleCards(userPlayer.holeCards);

      // Simple pre-flop strength evaluation
      const card1 = userPlayer.holeCards[0];
      const card2 = userPlayer.holeCards[1];

      if (card1.rank === card2.rank) {
        // Pocket pair
        const highRanks = ['A', 'K', 'Q', 'J', '10'];
        strength = highRanks.includes(card1.rank) ? 'strong' : 'medium';
      } else {
        // Unpaired cards
        const highRanks = ['A', 'K', 'Q'];
        const hasHighCard = highRanks.includes(card1.rank) || highRanks.includes(card2.rank);
        const suited = card1.suit === card2.suit;

        if (hasHighCard && suited) {
          strength = 'medium';
        } else if (hasHighCard) {
          strength = 'weak';
        } else {
          strength = 'weak';
        }
      }
    }

    return { strength, description: handDescription };
  };

  const currentHandInfo = getCurrentHandStrength();

  // Get strength badge color
  const getStrengthBadge = (strength: 'weak' | 'medium' | 'strong' | undefined) => {
    if (!strength) return { bg: 'bg-stone-100', border: 'border-stone-300', text: 'text-stone-600' };
    if (strength === 'strong') return { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700' };
    if (strength === 'medium') return { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700' };
    return { bg: 'bg-rose-50', border: 'border-rose-400', text: 'text-rose-700' };
  };

  const strengthBadge = getStrengthBadge(currentHandInfo?.strength);

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
          border: 2px solid #d4af37;
          box-shadow:
            0 0 12px rgba(212, 175, 55, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .cowboy-portrait {
          border: 3px solid #d4af37;
          box-shadow:
            0 0 8px rgba(212, 175, 55, 0.5),
            inset 0 1px 3px rgba(255, 255, 255, 0.4),
            0 4px 12px rgba(0, 0, 0, 0.4);
          background: radial-gradient(circle at 30% 30%, #f4e5a8, #d4af37, #8b6914);
        }

        .poker-chip {
          position: relative;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 3px rgba(255, 255, 255, 0.2),
            inset 0 -1px 3px rgba(0, 0, 0, 0.1);
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

        @keyframes bubble-inflate {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          60% {
            transform: scale(1.05) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes bubble-deflate {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.9) translateY(5px);
          }
        }

        .speech-bubble {
          position: relative;
          animation: bubble-inflate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .speech-bubble.exiting {
          animation: bubble-deflate 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
        }

        .speech-bubble::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 30px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 15px 15px 15px 0;
          border-color: transparent #d4af37 transparent transparent;
          filter: drop-shadow(-2px 0px 1px rgba(0, 0, 0, 0.1));
        }

        .speech-bubble::after {
          content: '';
          position: absolute;
          left: -8px;
          top: 32px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 13px 13px 13px 0;
          border-color: transparent #fef9e7 transparent transparent;
        }
      `}</style>

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-5xl px-2 sm:px-4 pb-1 sm:pb-2">
          <div className="card-texture rounded-t-2xl sm:rounded-2xl ornate-border overflow-visible">
            <div className="relative p-2 sm:p-3">

              {/* Main Content Grid - Improved spacing and layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_120px] gap-2 sm:gap-3 items-start">

                {/* Left: Cowboy Portrait */}
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <div className="relative">
                    <div
                      className="cowboy-portrait rounded-2xl w-20 h-20 sm:w-24 sm:h-24 overflow-hidden flex items-center justify-center"
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

                  {/* Voice narration toggle - only show if available */}
                  {textToSpeechService.isAvailable() && (
                    <button
                      onClick={handleVoiceToggle}
                      className={`poker-chip w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 ${
                        voiceEnabled
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 text-white'
                          : 'bg-gradient-to-br from-stone-400 to-stone-600 border-stone-500 text-stone-200'
                      }`}
                      aria-label={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
                      title={voiceEnabled ? 'Voice On' : 'Voice Off'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {voiceEnabled ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        )}
                      </svg>
                    </button>
                  )}
                </div>

                {/* Center: Combined Narration & Advice */}
                <div>
                  {/* Main message with reasoning combined */}
                  <div key={bubbleKey} className="speech-bubble relative bg-gradient-to-br from-amber-50/90 via-yellow-50/90 to-amber-100/90 rounded-xl border-2 border-amber-800/30 p-2 sm:p-3 shadow-lg">
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
                      style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }}
                    ></div>

                    {isHandComplete && winners.length > 0 ? (
                      <p
                        className={`leading-relaxed text-sm sm:text-base ${userWon ? 'text-emerald-700 font-semibold' : 'text-stone-800'}`}
                        style={{ fontFamily: "'Crimson Text', serif" }}
                      >
                        <span className="text-2xl mr-2">{userWon ? '🎉' : '🤠'}</span>
                        {getEndOfHandMessage()}
                        {handDescription && (
                          <>
                            {' '}
                            <span className="text-amber-700">🃏</span>
                            {' '}
                            <span className="text-stone-600">Winning hand: <strong>{handDescription}</strong>.</span>
                          </>
                        )}
                        {isUserEliminated && (
                          <>
                            {' '}
                            <span className="text-rose-700 font-semibold">
                              💸 You're out of chips! Start a new game to try again.
                            </span>
                          </>
                        )}
                      </p>
                    ) : narratorEvent ? (
                      <p
                        className="text-stone-800 leading-relaxed text-sm sm:text-base"
                        style={{ fontFamily: "'Crimson Text', serif" }}
                      >
                        {narratorEvent.message}
                        {narratorEvent.reasoning && (
                          <span className="text-stone-600 italic">
                            {' '}{narratorEvent.reasoning}
                          </span>
                        )}
                        {narratorEvent.advice && gameState.mode === 'tutorial' && (
                          <>
                            {' '}
                            <span className="text-emerald-700 font-semibold">
                              → {narratorEvent.advice}
                            </span>
                          </>
                        )}
                      </p>
                    ) : (
                      <p
                        className="text-stone-600 italic text-sm sm:text-base"
                        style={{ fontFamily: "'Crimson Text', serif" }}
                      >
                        {isUserTurn ? "Your move, partner!" : `Watchin' ${currentPlayer?.name || 'the table'}...`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Game Status, Hand Strength Badge + Help (hidden in training mode) */}
                {gameState.mode === 'tutorial' && (
                  <div className="flex lg:flex-col flex-row items-center gap-2 justify-center lg:justify-start">
                    {/* Game Phase Indicator - at top */}
                    <div
                      className="px-3 py-2 rounded-lg border-2 border-amber-700/60 shadow-sm w-full text-center"
                      style={{
                        background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%)',
                      }}
                    >
                      <span
                        className="text-stone-800 text-xs sm:text-sm font-bold tracking-wider uppercase block"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {gameState.currentPhase.replace('-', ' ')}
                      </span>
                    </div>

                    {/* Hand Strength Badge - always visible when user has cards */}
                    {currentHandInfo && (
                      <div
                        className={`poker-chip rounded-lg lg:rounded-xl w-20 h-20 lg:w-24 lg:h-24 flex flex-col items-center justify-center ${strengthBadge.bg} border-4 ${strengthBadge.border}`}
                      >
                        <div
                          className="text-[8px] lg:text-[9px] font-bold uppercase tracking-wider opacity-70"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          Hand
                        </div>
                        <div
                          className={`text-[9px] lg:text-xs font-black ${strengthBadge.text} text-center leading-tight px-1 mt-0.5 lg:mt-1 uppercase`}
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {currentHandInfo.strength}
                        </div>
                      </div>
                    )}

                    {/* Help button - Hand Rankings icon at bottom */}
                    <button
                      onClick={() => setShowHandRankings(true)}
                      className="poker-chip w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-stone-700 to-stone-900 hover:from-stone-600 hover:to-stone-800 text-amber-300 font-black text-base lg:text-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-amber-600/50"
                      aria-label="View hand rankings"
                      title="Hand Rankings"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      ?
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons Row - Improved spacing and size */}
              <div className="mt-2 sm:mt-3 flex gap-2 sm:gap-3 justify-center items-center flex-wrap">
                {/* Action History Button - always visible */}
                <button
                  onClick={() => setShowHistory(true)}
                  aria-label="View action history"
                  title="Action History (Current Hand)"
                  className="poker-chip w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-stone-600 to-stone-800 hover:from-stone-500 hover:to-stone-700 text-amber-200 font-bold flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-amber-600/50"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Hand History Button - always visible */}
                <button
                  onClick={() => setShowHandHistory(true)}
                  aria-label="View hand history"
                  title="Hand History (Last 10 Hands)"
                  className="poker-chip w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-yellow-100 font-bold flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-amber-700/50"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>

                {/* Show Next Hand button when hand complete, Next button when waiting, otherwise action buttons */}
                {isHandComplete && winners.length > 0 ? (
                  <button
                    onClick={onNextHand}
                    aria-label={isUserEliminated ? "Start a new game" : "Deal the next hand"}
                    className="poker-chip px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-500 text-amber-950 hover:scale-105 active:scale-95 border-2 border-amber-700"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {isUserEliminated ? 'NEW GAME' : 'NEXT HAND'}
                  </button>
                ) : isWaitingForNextAction ? (
                  <button
                    onClick={onNext}
                    aria-label="Continue to next action"
                    className="poker-chip px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all bg-gradient-to-b from-sky-500 to-sky-700 hover:from-sky-400 hover:to-sky-600 text-white hover:scale-105 active:scale-95 border-2 border-sky-800 animate-pulse"
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
                        poker-chip px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all
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
                        poker-chip px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all min-w-[100px] sm:min-w-[130px]
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
                      onClick={handleRaiseClick}
                      disabled={buttonsDisabled || !canRaise}
                      aria-label={showRaiseSlider ? `Confirm raise to $${raiseAmount}` : raiseButtonText}
                      className={`
                        poker-chip px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all min-w-[100px] sm:min-w-[130px]
                        ${buttonsDisabled || !canRaise
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-50 border-2 border-stone-400'
                          : 'bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-500 text-amber-950 hover:scale-105 active:scale-95 border-2 border-amber-700'
                        }
                      `}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {raiseButtonText.toUpperCase()}
                    </button>

                    {/* Raise amount selector - to the right of action buttons */}
                    {showRaiseSlider && isUserTurn && hasEnoughForMinRaise && !isHandComplete && (
                      <div className="flex flex-row gap-1.5 ml-2">
                        {getRaiseOptions().map((option) => (
                          <button
                            key={option}
                            onClick={() => setRaiseAmount(option)}
                            className={`
                              poker-chip px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2
                              ${option === raiseAmount
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 border-amber-700 scale-105'
                                : 'bg-gradient-to-br from-stone-200 to-stone-300 text-stone-700 border-stone-400 hover:from-stone-300 hover:to-stone-400 hover:scale-105'
                              }
                            `}
                            style={{ fontFamily: "'Playfair Display', serif" }}
                            aria-label={`Raise to $${option}`}
                          >
                            ${option}
                          </button>
                        ))}
                      </div>
                    )}
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

      {/* Hand History Modal */}
      <HandHistoryScreen
        isOpen={showHandHistory}
        onClose={() => setShowHandHistory(false)}
      />
    </>
  );
}
