/**
 * Displays strategic advice for the user.
 * Shows hand strength and provides beginner-friendly guidance.
 */

import { GameState } from '../types/game';
import { describeHand, evaluateHandStrength, getStrategicAdvice, describeHoleCards } from '../utils/handStrength';
import { getBestFiveCardHand, getBestHandFromSix, evaluateHand } from '../utils/handEvaluator';
import { cardToString } from '../utils/cards';

interface StrategicAdviceProps {
  gameState: GameState;
}

export function StrategicAdvice({ gameState }: StrategicAdviceProps) {
  const userPlayer = gameState.players.find(p => p.isUser);

  if (!userPlayer) {
    return (
      <div className="text-gray-400 text-sm italic">
        Player not found
      </div>
    );
  }

  // If no cards yet, show waiting message
  if (userPlayer.holeCards.length === 0) {
    return (
      <div className="text-gray-400 text-sm italic">
        Waiting for cards to be dealt...
      </div>
    );
  }

  // Evaluate current hand based on what cards are available
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

  const advice = getStrategicAdvice(userPlayer, gameState);

  // Color coding for strength
  const strengthColors: Record<string, string> = {
    weak: 'text-red-400',
    medium: 'text-yellow-400',
    strong: 'text-green-400',
  };

  const strengthLabels: Record<string, string> = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  return (
    <div className="space-y-4">
      {/* Your Hole Cards */}
      <div>
        <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
          Your Cards
        </h4>
        <div className="flex gap-2 mb-2">
          {userPlayer.holeCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white text-gray-900 px-3 py-2 rounded text-sm font-bold shadow"
            >
              {cardToString(card)}
            </div>
          ))}
        </div>
        {gameState.currentPhase === 'pre-flop' && (
          <div className="text-gray-300 text-xs">
            {describeHoleCards(userPlayer.holeCards)}
          </div>
        )}
      </div>

      {/* Current Hand Strength */}
      <div>
        <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
          Current Hand
        </h4>
        <div className="bg-gray-700/50 rounded p-3">
          <div className="text-white font-semibold mb-1">
            {handDescription}
          </div>
          <div className={`text-sm font-bold ${strengthColors[strength]}`}>
            {strengthLabels[strength]} Strength
          </div>
        </div>
      </div>

      {/* Strategic Advice */}
      <div>
        <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
          Advice
        </h4>
        <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">
          {advice}
        </div>
      </div>

      {/* Chips Remaining */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Your Chips:</span>
          <span className="text-white text-sm font-bold">${userPlayer.chips}</span>
        </div>
      </div>
    </div>
  );
}
