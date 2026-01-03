/**
 * Classic Western poker card component.
 * Traditional playing card design for saloon poker games.
 */

import { Card as CardType } from '../types/game';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants/cards';

interface CardProps {
  card?: CardType;
  faceUp?: boolean;
  size?: 'small' | 'medium' | 'large';
  animate?: 'deal' | 'flip' | 'none';
  animationDelay?: number;
}

export function Card({
  card,
  faceUp = false,
  size = 'medium',
  animate = 'none',
  animationDelay = 0,
}: CardProps) {
  // Size classes
  const sizeClasses = {
    small: 'w-12 h-16 text-sm',
    medium: 'w-16 h-24 text-base',
    large: 'w-20 h-28 text-lg',
  };

  const sizeClass = sizeClasses[size];

  // Animation classes
  const animationClass = animate === 'deal' ? 'animate-deal' : animate === 'flip' ? 'animate-flip' : '';

  if (!card) {
    // Placeholder card (empty slot)
    return (
      <div
        className={`${sizeClass} bg-felt-900/20 rounded border-2 border-dashed border-sand-200/20 flex items-center justify-center`}
      >
        <div className="text-sand-200/30 text-xs">?</div>
      </div>
    );
  }

  if (!faceUp) {
    // Card back - Western pattern with rope border
    return (
      <div
        className={`${sizeClass} ${animationClass} relative transition-all duration-200`}
        style={{ perspective: '1000px', animationDelay: `${animationDelay}ms` }}
      >
        <div
          className="w-full h-full bg-gradient-to-br from-whiskey-700 via-whiskey-800 to-whiskey-700 rounded shadow-lg border-2 border-sand-200 relative overflow-hidden transition-all duration-300"
          style={{
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.6)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Rope-style border pattern */}
          <div
            className="absolute inset-1 border-2 border-sand-100/40 rounded"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(232, 213, 183, 0.1) 4px, rgba(232, 213, 183, 0.1) 8px)',
            }}
          />

          {/* Western star pattern */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gold-400 text-3xl opacity-40" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              ★
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-1.5 left-1.5 text-gold-400/30 text-xs">✦</div>
          <div className="absolute top-1.5 right-1.5 text-gold-400/30 text-xs">✦</div>
          <div className="absolute bottom-1.5 left-1.5 text-gold-400/30 text-xs">✦</div>
          <div className="absolute bottom-1.5 right-1.5 text-gold-400/30 text-xs">✦</div>
        </div>
      </div>
    );
  }

  // Face-up card - Classic white playing card
  const color = SUIT_COLORS[card.suit];
  const textColor = color === 'red' ? 'text-red-600' : 'text-gray-900';
  const suitSymbol = SUIT_SYMBOLS[card.suit];

  // Determine rank display size based on card size
  const rankSizeClass = size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-xl';
  const suitSizeClass = size === 'small' ? 'text-2xl' : size === 'medium' ? 'text-4xl' : 'text-5xl';

  return (
    <div
      className={`${sizeClass} ${animationClass} relative transition-all duration-200`}
      style={{ perspective: '1000px', animationDelay: `${animationDelay}ms` }}
    >
      <div
        className="w-full h-full bg-white rounded shadow-lg border-2 border-gray-200 p-1 relative overflow-hidden transition-all duration-300"
        style={{
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.4)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Top-left rank and suit */}
        <div className={`absolute top-1 left-1.5 ${textColor} font-bold leading-none ${rankSizeClass}`}>
          <div>{card.rank}</div>
          <div className="-mt-0.5">{suitSymbol}</div>
        </div>

        {/* Bottom-right rank and suit (upside down) */}
        <div
          className={`absolute bottom-1 right-1.5 ${textColor} font-bold leading-none ${rankSizeClass} rotate-180`}
        >
          <div>{card.rank}</div>
          <div className="-mt-0.5">{suitSymbol}</div>
        </div>

        {/* Center suit symbol */}
        <div className={`absolute inset-0 flex items-center justify-center ${textColor} ${suitSizeClass}`}>
          {suitSymbol}
        </div>
      </div>
    </div>
  );
}
