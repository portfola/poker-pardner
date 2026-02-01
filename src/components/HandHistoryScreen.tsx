/**
 * Hand History Screen component.
 * Displays the last 10 completed hands with full details.
 * Matches the Old West saloon aesthetic.
 */

import { useState } from 'react';
import { HandHistoryRecord } from '../types/handHistory';
import { getHandHistory } from '../utils/handHistory';
import { SUIT_SYMBOLS } from '../constants/cards';
import { Card as CardType, GamePhase } from '../types/game';

interface HandHistoryScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

const phaseLabels: Record<GamePhase, string> = {
  'pre-flop': 'Pre-Flop',
  'flop': 'Flop',
  'turn': 'Turn',
  'river': 'River',
  'showdown': 'Showdown',
};

function formatCard(card: CardType): string {
  const symbol = SUIT_SYMBOLS[card.suit];
  return `${card.rank}${symbol}`;
}

function formatChipChange(change: number): string {
  if (change > 0) return `+$${change}`;
  if (change < 0) return `-$${Math.abs(change)}`;
  return '$0';
}

function HandDetailView({ hand, onBack }: { hand: HandHistoryRecord; onBack: () => void }) {
  const userPlayer = hand.players.find(p => p.isUser);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-amber-800/30 bg-gradient-to-r from-amber-100 to-yellow-100">
        <button
          onClick={onBack}
          className="text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2"
          aria-label="Back to list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold" style={{ fontFamily: "'Crimson Text', serif" }}>Back</span>
        </button>
        <h2
          className="text-stone-800 font-black text-lg"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Hand #{hand.handNumber}
        </h2>
        <div className="w-16"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Result Summary */}
        <div className={`rounded-lg p-4 border-2 ${
          hand.userWon
            ? 'bg-emerald-100/60 border-emerald-400'
            : hand.userFolded
            ? 'bg-gray-100/60 border-gray-300'
            : 'bg-rose-100/60 border-rose-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-lg font-bold text-stone-800"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {hand.userWon ? '🏆 You Won!' : hand.userFolded ? '📋 You Folded' : '❌ You Lost'}
            </span>
            <span
              className={`text-xl font-black ${
                hand.userChipChange > 0 ? 'text-emerald-700' :
                hand.userChipChange < 0 ? 'text-rose-700' :
                'text-stone-600'
              }`}
              style={{ fontFamily: "'Crimson Text', serif" }}
            >
              {formatChipChange(hand.userChipChange)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span style={{ fontFamily: "'Crimson Text', serif" }}>Pot: ${hand.potSize}</span>
            <span style={{ fontFamily: "'Crimson Text', serif" }}>Reached: {phaseLabels[hand.finalPhase]}</span>
          </div>
        </div>

        {/* Community Cards */}
        {hand.communityCards.length > 0 && (
          <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
            <h3
              className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Community Cards
            </h3>
            <div className="flex gap-2 flex-wrap">
              {hand.communityCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded border-2 border-stone-300 px-2 py-1 font-mono text-sm shadow-sm"
                >
                  {formatCard(card)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Hand */}
        {userPlayer && (
          <div className="bg-emerald-50/60 rounded-lg p-4 border border-emerald-300">
            <h3
              className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Your Hand
            </h3>
            <div className="flex gap-2 mb-2">
              {userPlayer.holeCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded border-2 border-emerald-400 px-2 py-1 font-mono text-sm shadow-sm"
                >
                  {formatCard(card)}
                </div>
              ))}
            </div>
            {userPlayer.handEvaluation && !userPlayer.folded && (
              <p className="text-xs text-emerald-800" style={{ fontFamily: "'Crimson Text', serif" }}>
                {userPlayer.handEvaluation.description}
              </p>
            )}
          </div>
        )}

        {/* Winners */}
        <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
          <h3
            className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {hand.winnerNames.length > 1 ? 'Winners' : 'Winner'}
          </h3>
          {hand.winnerNames.map((name, idx) => (
            <div key={idx} className="mb-2 last:mb-0">
              <p className="font-semibold text-stone-800" style={{ fontFamily: "'Crimson Text', serif" }}>
                {name}
              </p>
              {hand.winningHands[idx] && (
                <p className="text-xs text-stone-600" style={{ fontFamily: "'Crimson Text', serif" }}>
                  {hand.winningHands[idx].description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* All Players */}
        <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
          <h3
            className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            All Players
          </h3>
          <div className="space-y-2">
            {hand.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between py-2 px-3 rounded ${
                  player.isUser ? 'bg-emerald-50/80' : 'bg-gray-50/80'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${player.isUser ? 'text-emerald-800' : 'text-stone-700'}`} style={{ fontFamily: "'Crimson Text', serif" }}>
                    {player.name} {player.isUser && '(You)'}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {player.holeCards.map((card, idx) => (
                      <span key={idx} className="text-xs font-mono text-stone-600">
                        {formatCard(card)}
                      </span>
                    ))}
                  </div>
                  {player.folded && (
                    <p className="text-xs text-stone-500 italic mt-1">Folded</p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${
                    player.chipChange > 0 ? 'text-emerald-700' :
                    player.chipChange < 0 ? 'text-rose-700' :
                    'text-stone-600'
                  }`}>
                    {formatChipChange(player.chipChange)}
                  </p>
                  <p className="text-xs text-stone-500">${player.finalChips}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action History */}
        {hand.actions.length > 0 && (
          <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
            <h3
              className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Action History
            </h3>
            <div className="space-y-2 text-xs" style={{ fontFamily: "'Crimson Text', serif" }}>
              {hand.actions.map((action, idx) => (
                <div
                  key={idx}
                  className={`py-1 px-2 rounded ${
                    action.isUser ? 'bg-emerald-50/60' : 'bg-gray-50/60'
                  }`}
                >
                  <span className="font-semibold">{action.playerName}:</span>{' '}
                  {action.action}
                  {action.amount && ` $${action.amount}`}
                  <span className="text-stone-500 ml-2">({phaseLabels[action.phase]})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function HandHistoryScreen({ isOpen, onClose }: HandHistoryScreenProps) {
  const [selectedHand, setSelectedHand] = useState<HandHistoryRecord | null>(null);
  const [history, setHistory] = useState<HandHistoryRecord[]>([]);

  // Load history when opened
  if (isOpen && history.length === 0 && !selectedHand) {
    setHistory(getHandHistory());
  }

  // Reset when closed
  if (!isOpen && (history.length > 0 || selectedHand)) {
    setHistory([]);
    setSelectedHand(null);
  }

  if (!isOpen) return null;

  // Detail view
  if (selectedHand) {
    return (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedHand(null);
          }
        }}
      >
        <div
          className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden border-4 border-amber-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <HandDetailView hand={selectedHand} onBack={() => setSelectedHand(null)} />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden border-4 border-amber-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-amber-800/30 bg-gradient-to-r from-amber-100 to-yellow-100">
          <h2
            className="text-stone-800 font-black text-xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            📜 Hand History
          </h2>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 p-1 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎴</div>
              <p className="text-stone-600 text-lg" style={{ fontFamily: "'Crimson Text', serif" }}>
                No hands played yet.
              </p>
              <p className="text-stone-500 text-sm mt-2" style={{ fontFamily: "'Crimson Text', serif" }}>
                Your last 10 hands will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((hand) => {
                const userPlayer = hand.players.find(p => p.isUser);

                return (
                  <button
                    key={hand.id}
                    onClick={() => setSelectedHand(hand)}
                    className={`w-full text-left rounded-lg p-4 border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${
                      hand.userWon
                        ? 'bg-emerald-100/60 border-emerald-300 hover:border-emerald-400'
                        : hand.userFolded
                        ? 'bg-gray-100/60 border-gray-300 hover:border-gray-400'
                        : 'bg-rose-100/60 border-rose-300 hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3
                          className="font-bold text-stone-800"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          Hand #{hand.handNumber}
                        </h3>
                        <p className="text-xs text-stone-500" style={{ fontFamily: "'Crimson Text', serif" }}>
                          {new Date(hand.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-black ${
                            hand.userChipChange > 0 ? 'text-emerald-700' :
                            hand.userChipChange < 0 ? 'text-rose-700' :
                            'text-stone-600'
                          }`}
                          style={{ fontFamily: "'Crimson Text', serif" }}
                        >
                          {formatChipChange(hand.userChipChange)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-3">
                        <span className="text-stone-600" style={{ fontFamily: "'Crimson Text', serif" }}>
                          Pot: ${hand.potSize}
                        </span>
                        <span className="text-stone-600" style={{ fontFamily: "'Crimson Text', serif" }}>
                          {phaseLabels[hand.finalPhase]}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 uppercase tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {hand.userWon ? 'Won' : hand.userFolded ? 'Folded' : 'Lost'}
                      </span>
                    </div>

                    {/* Quick preview of cards */}
                    {userPlayer && userPlayer.holeCards.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {userPlayer.holeCards.map((card, idx) => (
                          <span key={idx} className="text-xs font-mono text-stone-600 bg-white/60 px-2 py-1 rounded border border-stone-300">
                            {formatCard(card)}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
