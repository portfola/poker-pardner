/**
 * Collapsible hand rankings reference guide.
 * Educational component showing all poker hand rankings from best to worst.
 */

import { useState } from 'react';

export function HandRankings() {
  const [isExpanded, setIsExpanded] = useState(false);

  const rankings = [
    {
      name: 'Royal Flush',
      description: 'A-K-Q-J-10, all same suit',
      example: '🂮 🂭 🂫 🂪 🂩',
      emoji: '👑',
    },
    {
      name: 'Straight Flush',
      description: '5 cards in sequence, all same suit',
      example: '🂹 🂸 🂷 🂶 🂵',
      emoji: '⚡',
    },
    {
      name: 'Four of a Kind',
      description: '4 cards of same rank',
      example: '🂮 🃎 🃞 🂾',
      emoji: '4️⃣',
    },
    {
      name: 'Full House',
      description: '3 of a kind + a pair',
      example: '🂮 🃎 🃞 🂻 🃛',
      emoji: '🏠',
    },
    {
      name: 'Flush',
      description: 'Any 5 cards of same suit',
      example: '🂮 🂫 🂸 🂵 🂲',
      emoji: '💧',
    },
    {
      name: 'Straight',
      description: '5 cards in sequence, mixed suits',
      example: '🂮 🃍 🃛 🂻 🂩',
      emoji: '📏',
    },
    {
      name: 'Three of a Kind',
      description: '3 cards of same rank',
      example: '🂮 🃎 🃞',
      emoji: '3️⃣',
    },
    {
      name: 'Two Pair',
      description: 'Two different pairs',
      example: '🂮 🃎 🂻 🃛',
      emoji: '2️⃣',
    },
    {
      name: 'One Pair',
      description: '2 cards of same rank',
      example: '🂮 🃎',
      emoji: '1️⃣',
    },
    {
      name: 'High Card',
      description: 'No matching cards',
      example: 'Highest card wins',
      emoji: '🎴',
    },
  ];

  return (
    <div className="border-t border-gray-700">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors group"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse hand rankings reference' : 'Expand hand rankings reference'}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wide">
            Hand Rankings
          </h3>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-purple-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content - Collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 animate-slideDown">
          <p className="text-gray-400 text-xs mb-3">
            From best to worst:
          </p>
          {rankings.map((rank, index) => (
            <div
              key={rank.name}
              className="bg-gray-700/30 rounded-lg p-2 border border-gray-600/50 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{rank.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">
                      {index + 1}. {rank.name}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mb-1">
                    {rank.description}
                  </p>
                  <p className="text-gray-400 text-xs font-mono">
                    {rank.example}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-3 pt-3 border-t border-gray-600">
            <p className="text-yellow-300 text-xs">
              💡 <strong>Tip:</strong> When hands tie, the highest cards (kickers) determine the winner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
