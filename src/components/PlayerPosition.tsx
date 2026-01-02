/**
 * Displays a player's position at the table.
 * Shows name, chip count, hole cards, dealer button, and folded state.
 */

import { Player } from '../types/game';
import { Card } from './Card';

interface PlayerPositionProps {
  player: Player;
  isDealer: boolean;
  isCurrentTurn: boolean;
  showCards?: boolean; // User's cards are always shown, others only at showdown
}

export function PlayerPosition({
  player,
  isDealer,
  isCurrentTurn,
  showCards = false,
}: PlayerPositionProps) {
  const isFolded = player.isFolded;
  const isAllIn = player.isAllIn;

  return (
    <div className="relative">
      {/* Player Info Container */}
      <div
        className={`
          bg-gray-800 rounded-lg p-3 min-w-[140px] border-2 transition-all
          ${isCurrentTurn ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-gray-600'}
          ${isFolded ? 'opacity-50' : ''}
        `}
      >
        {/* Dealer Button */}
        {isDealer && (
          <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full w-10 h-10 flex items-center justify-center border-3 border-gray-900 shadow-lg z-10">
            <span className="font-bold text-base text-gray-900">D</span>
          </div>
        )}

        {/* Player Name */}
        <div className="text-white font-semibold mb-2 text-center">
          {player.name}
        </div>

        {/* Chip Stack */}
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="text-xl">💰</span>
          <span
            className={`font-bold text-lg ${
              player.chips > 75
                ? 'text-green-400'
                : player.chips > 30
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            ${player.chips}
          </span>
        </div>

        {/* Current Bet */}
        {player.currentBet > 0 && !isFolded && (
          <div className="text-center text-yellow-300 text-sm">
            Bet: ${player.currentBet}
          </div>
        )}

        {/* All-In Indicator */}
        {isAllIn && (
          <div className="text-center text-red-400 text-xs font-bold mt-1">
            ALL IN
          </div>
        )}

        {/* Folded Indicator */}
        {isFolded && (
          <div className="text-center text-gray-400 text-xs font-bold mt-1">
            FOLDED
          </div>
        )}

        {/* Hole Cards */}
        <div className="flex gap-1 justify-center mt-2">
          {player.holeCards.length > 0 ? (
            player.holeCards.map((card, index) => (
              <Card
                key={index}
                card={card}
                faceUp={showCards || player.isUser}
                size="small"
                animate="deal"
                animationDelay={index * 100}
              />
            ))
          ) : (
            // Placeholder when no cards dealt
            <>
              <Card size="small" />
              <Card size="small" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
