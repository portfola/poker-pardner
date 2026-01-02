/**
 * Western saloon style player position display.
 * Shows name, chip count, hole cards, dealer button, and status.
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
      {/* Player Info Container - Leather wallet style */}
      <div
        className={`
          relative bg-gradient-to-br from-leather-800 to-leather-900 rounded-lg p-3 min-w-[140px] border-2 transition-all
          ${isCurrentTurn ? 'border-gold-500 shadow-lg shadow-gold-500/50' : 'border-wood-700'}
          ${isFolded ? 'opacity-50' : ''}
        `}
        style={{
          boxShadow: isCurrentTurn
            ? '0 0 20px rgba(218, 165, 32, 0.5), inset 0 1px 2px rgba(139, 69, 19, 0.3)'
            : '0 4px 8px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(139, 69, 19, 0.3)',
        }}
      >
        {/* Leather texture */}
        <div
          className="absolute inset-0 rounded-lg opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
          }}
        />

        {/* Dealer Button - Sheriff star */}
        {isDealer && (
          <div
            className="absolute -top-3 -right-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full w-10 h-10 flex items-center justify-center border-2 border-wood-900 shadow-lg z-10"
            style={{
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
            }}
          >
            <span className="font-body font-bold text-base text-wood-900">D</span>
          </div>
        )}

        {/* Player Name */}
        <div className="text-sand-100 font-body font-semibold mb-2 text-center">
          {player.name}
        </div>

        {/* Chip Stack - Gold coin icon */}
        <div className="flex items-center justify-center gap-1 mb-2">
          <span className="text-xl">🪙</span>
          <span
            className={`font-body font-bold text-lg ${
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
          <div className="text-center text-yellow-300 text-sm mb-1">
            Bet: ${player.currentBet}
          </div>
        )}

        {/* All-In Indicator */}
        {isAllIn && (
          <div className="text-center mb-1">
            <div className="inline-block bg-red-900/40 border border-red-700 rounded px-2 py-0.5">
              <span className="text-red-400 text-xs font-body font-bold tracking-wider">
                ALL IN
              </span>
            </div>
          </div>
        )}

        {/* Folded Indicator */}
        {isFolded && (
          <div className="text-center mb-1">
            <div className="inline-block bg-gray-800/40 border border-gray-600 rounded px-2 py-0.5">
              <span className="text-gray-400 text-xs font-body font-bold tracking-wider">
                FOLDED
              </span>
            </div>
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
