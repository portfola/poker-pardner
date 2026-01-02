/**
 * Card component with animations.
 * Displays poker cards with face-up/face-down states and smooth animations.
 */

import { Card as CardType } from '../types/game';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants/cards';
import './Card.css';

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
    small: 'w-10 h-14 text-sm',
    medium: 'w-16 h-24 text-base',
    large: 'w-20 h-28 text-lg',
  };

  const sizeClass = sizeClasses[size];

  // Animation classes
  const animationClass = animate === 'deal' ? 'card-deal' : animate === 'flip' ? 'card-flip' : '';

  if (!card) {
    // Placeholder card (empty slot)
    return (
      <div
        className={`${sizeClass} bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center`}
      >
        <div className="text-gray-500 text-xs">?</div>
      </div>
    );
  }

  if (!faceUp) {
    // Card back
    return (
      <div
        className={`${sizeClass} ${animationClass} card-container`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="card-back w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg shadow-md border-2 border-blue-800 flex flex-col items-center justify-center p-1">
          {/* Card back pattern */}
          <div className="w-full h-full relative overflow-hidden rounded">
            {/* Diagonal stripes pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)',
              }}
            />
            {/* Center emblem */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-blue-300 opacity-40 text-2xl">♠</div>
            </div>
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 text-blue-400 opacity-30 text-xs p-0.5">♦</div>
            <div className="absolute top-0 right-0 text-blue-400 opacity-30 text-xs p-0.5">♣</div>
            <div className="absolute bottom-0 left-0 text-blue-400 opacity-30 text-xs p-0.5">♥</div>
            <div className="absolute bottom-0 right-0 text-blue-400 opacity-30 text-xs p-0.5">♠</div>
          </div>
        </div>
      </div>
    );
  }

  // Face-up card
  const color = SUIT_COLORS[card.suit];
  const textColor = color === 'red' ? 'text-red-600' : 'text-gray-900';
  const suitSymbol = SUIT_SYMBOLS[card.suit];

  // Determine rank display size based on card size
  const rankSizeClass = size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base';
  const suitSizeClass = size === 'small' ? 'text-lg' : size === 'medium' ? 'text-3xl' : 'text-4xl';

  return (
    <div
      className={`${sizeClass} ${animationClass} card-container`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="card-face w-full h-full bg-white rounded-lg shadow-md border-2 border-gray-300 p-1 relative overflow-hidden hover:shadow-lg transition-shadow">
        {/* Top-left rank and suit */}
        <div className={`absolute top-0.5 left-1 ${textColor} font-bold leading-none ${rankSizeClass}`}>
          <div>{card.rank}</div>
          <div className="-mt-0.5">{suitSymbol}</div>
        </div>

        {/* Bottom-right rank and suit (upside down) */}
        <div
          className={`absolute bottom-0.5 right-1 ${textColor} font-bold leading-none ${rankSizeClass} rotate-180`}
        >
          <div>{card.rank}</div>
          <div className="-mt-0.5">{suitSymbol}</div>
        </div>

        {/* Center suit symbol */}
        <div className={`absolute inset-0 flex items-center justify-center ${textColor} ${suitSizeClass} opacity-90`}>
          {suitSymbol}
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none rounded-lg" />
      </div>
    </div>
  );
}
