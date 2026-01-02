/**
 * Displays the 5 community cards in the center of the table.
 * Shows placeholders for unrevealed cards.
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
    <div className="flex gap-2 justify-center">
      {cardSlots.map((_, index) => {
        const card = cards[index];

        return (
          <Card
            key={index}
            card={card}
            faceUp={true}
            size="medium"
            animate={card ? 'flip' : 'none'}
            animationDelay={index * 150}
          />
        );
      })}
    </div>
  );
}
