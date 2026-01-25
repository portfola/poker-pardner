/**
 * Western saloon style player position display.
 * Shows name, chip count, hole cards, dealer button, and status.
 * Responsive: compact mode for AI players on smaller screens.
 */

import { Player } from '../types/game';
import { Card } from './Card';

interface PlayerPositionProps {
  player: Player;
  isDealer: boolean;
  isCurrentTurn: boolean;
  showCards?: boolean;
  compact?: boolean; // Use compact layout for AI players
}

export function PlayerPosition({
  player,
  isDealer,
  isCurrentTurn,
  showCards = false,
  compact = false,
}: PlayerPositionProps) {
  const isFolded = player.isFolded;
  const isAllIn = player.isAllIn;

  // Determine card size based on compact mode and screen size
  // User (non-compact) gets medium cards, AI players (compact) get small cards
  const cardSize = compact ? 'small' : 'small';

  return (
    <div className="relative">
      {/* Player Info Container - Leather wallet style */}
      <div
        className={`
          relative bg-gradient-to-br from-leather-800 to-leather-900 rounded-lg border-2 transition-all
          ${compact ? 'p-1.5 sm:p-2 md:p-3 min-w-[80px] sm:min-w-[100px] md:min-w-[140px]' : 'p-2 sm:p-3 min-w-[100px] sm:min-w-[140px]'}
          ${isCurrentTurn ? 'border-gold-500 shadow-lg shadow-gold-500/50 pulse-glow' : 'border-wood-700'}
          ${isFolded ? 'opacity-50' : ''}
        `}
        style={
          !isCurrentTurn
            ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(139, 69, 19, 0.3)' }
            : undefined
        }
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
            className={`
              absolute bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center border-2 border-wood-900 shadow-lg z-10
              ${compact ? '-top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 md:-top-3 md:-right-3 md:w-10 md:h-10' : '-top-3 -right-3 w-8 h-8 sm:w-10 sm:h-10'}
            `}
            style={{
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
            }}
          >
            <span className={`font-body font-bold text-wood-900 ${compact ? 'text-xs sm:text-sm md:text-base' : 'text-sm sm:text-base'}`}>D</span>
          </div>
        )}

        {/* Player Name */}
        <div className={`text-sand-100 font-body font-semibold text-center ${compact ? 'text-xs sm:text-sm mb-1' : 'text-sm sm:text-base mb-2'}`}>
          {player.name}
        </div>

        {/* Chip Stack - Gold coin icon */}
        <div className={`flex items-center justify-center gap-1 ${compact ? 'mb-1' : 'mb-2'}`}>
          <span className={compact ? 'text-sm sm:text-base md:text-xl' : 'text-base sm:text-xl'}>🪙</span>
          <span
            className={`font-body font-bold ${compact ? 'text-xs sm:text-sm md:text-lg' : 'text-sm sm:text-lg'} ${
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
          <div className={`text-center text-yellow-300 mb-1 ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Bet: ${player.currentBet}
          </div>
        )}

        {/* All-In Indicator */}
        {isAllIn && (
          <div className="text-center mb-1">
            <div className="inline-block bg-red-900/40 border border-red-700 rounded px-1.5 sm:px-2 py-0.5">
              <span className={`text-red-400 font-body font-bold tracking-wider ${compact ? 'text-[10px] sm:text-xs' : 'text-xs'}`}>
                ALL IN
              </span>
            </div>
          </div>
        )}

        {/* Folded Indicator */}
        {isFolded && (
          <div className="text-center mb-1">
            <div className="inline-block bg-gray-800/40 border border-gray-600 rounded px-1.5 sm:px-2 py-0.5">
              <span className={`text-gray-400 font-body font-bold tracking-wider ${compact ? 'text-[10px] sm:text-xs' : 'text-xs'}`}>
                FOLDED
              </span>
            </div>
          </div>
        )}

        {/* Hole Cards */}
        <div className={`flex gap-0.5 sm:gap-1 justify-center ${compact ? 'mt-1' : 'mt-2'}`}>
          {player.holeCards.length > 0 ? (
            player.holeCards.map((card, index) => (
              <Card
                key={index}
                card={card}
                faceUp={showCards || player.isUser}
                size={cardSize}
                animate="deal"
                animationDelay={index * 100}
              />
            ))
          ) : (
            // Placeholder when no cards dealt
            <>
              <Card size={cardSize} />
              <Card size={cardSize} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
