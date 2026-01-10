/**
 * Displays the 5 community cards in the center of the table.
 * Shows placeholders for unrevealed cards.
 * Responsive: smaller cards on mobile.
 */

import { Card as CardType } from '../types/game';
import { Card } from './Card';

interface CommunityCardsProps {
  cards: CardType[];
}

export function CommunityCards({ cards }: CommunityCardsProps) {
  // Always show 5 card slots
  const cardSlots = Array(5).fill(null);

  return (
    <div className="flex gap-0.5 sm:gap-1 md:gap-2 justify-center">
      {cardSlots.map((_, index) => {
        const card = cards[index];

        return (
          <div key={index} className="hidden sm:block">
            <Card
              card={card}
              faceUp={true}
              size="medium"
              animate={card ? 'flip' : 'none'}
              animationDelay={index * 150}
            />
          </div>
        );
      })}
      {/* Mobile: Show smaller cards */}
      {cardSlots.map((_, index) => {
        const card = cards[index];

        return (
          <div key={`mobile-${index}`} className="sm:hidden">
            <Card
              card={card}
              faceUp={true}
              size="small"
              animate={card ? 'flip' : 'none'}
              animationDelay={index * 150}
            />
          </div>
        );
      })}
    </div>
  );
}
