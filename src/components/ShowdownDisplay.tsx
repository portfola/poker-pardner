/**
 * Showdown display component - shows winner announcement and next hand button.
 * Western saloon theme with wanted poster aesthetic.
 */

import { GameState } from '../types/game';
import { describeHand } from '../utils/handStrength';

interface ShowdownDisplayProps {
  gameState: GameState;
  onNextHand: () => void;
}

export function ShowdownDisplay({ gameState, onNextHand }: ShowdownDisplayProps) {
  const { winners, winningHands, pot, players } = gameState;

  if (!gameState.isHandComplete || winners.length === 0) {
    return null;
  }

  // Check if user won
  const userWon = winners.some(w => w.isUser);
  const isSplit = winners.length > 1;
  const potShare = Math.floor(pot / winners.length);

  // Generate winner message
  let winnerMessage: string;
  if (isSplit) {
    const winnerNames = winners.map(w => w.name).join(', ');
    winnerMessage = `Split Pot! ${winnerNames} tie`;
  } else {
    const winner = winners[0];
    winnerMessage = `${winner.name} wins $${pot}!`;
  }

  // Get hand description
  const handDescription = winningHands.length > 0
    ? describeHand(winningHands[0])
    : '';

  // Check if user is eliminated
  const userPlayer = players.find(p => p.isUser);
  const isUserEliminated = userPlayer && userPlayer.chips === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-announcement"
    >
      {/* Winner Announcement - Wanted Poster Style */}
      <div
        className="bg-sand-100 border-8 border-wood-800 p-8 shadow-2xl max-w-md"
        style={{
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
          background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%)',
        }}
      >
        {/* Decorative stars */}
        <div className="flex justify-center gap-4 mb-4">
          <span className="text-gold-500 text-3xl">★</span>
          <span className="text-gold-600 text-4xl">★</span>
          <span className="text-gold-500 text-3xl">★</span>
        </div>

        {/* Winner announcement */}
        <div className="text-center mb-6">
          <h2
            id="winner-announcement"
            className={`text-4xl font-display font-bold mb-2 ${
              userWon ? 'text-green-700' : 'text-wood-900'
            }`}
            style={{
              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)',
            }}
          >
            {userWon ? 'YOU WIN!' : isSplit ? 'SPLIT POT!' : 'HAND COMPLETE'}
          </h2>

          {/* Winner details */}
          <div className="bg-wood-700/10 rounded-lg p-4 mb-4">
            <p className="text-wood-900 font-body text-lg font-semibold mb-2">
              {winnerMessage}
            </p>
            {handDescription && (
              <p className="text-wood-800 font-body text-base">
                with {handDescription}
              </p>
            )}
            {isSplit && (
              <p className="text-wood-700 font-body text-sm mt-2">
                Each player wins ${potShare}
              </p>
            )}
          </div>

          {/* User eliminated message */}
          {isUserEliminated && (
            <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-900 font-body text-lg font-bold mb-2">
                You're Out of Chips!
              </p>
              <p className="text-red-800 font-body text-sm">
                Start a new game to play again
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="h-1 w-24 bg-wood-700 mx-auto my-4" />

          {/* Chip icon */}
          <div className="text-5xl mb-4">🪙</div>

          {/* Next hand button */}
          <button
            onClick={onNextHand}
            aria-label={isUserEliminated ? "Start a new game" : "Deal the next hand"}
            className="bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-900 font-body font-bold py-4 px-10 rounded-lg text-xl shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-gold-600"
            style={{
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            }}
          >
            {isUserEliminated ? 'New Game' : 'Next Hand'}
          </button>
        </div>

        {/* Decorative horseshoe */}
        <div className="text-center text-2xl mt-4">
          🐴
        </div>
      </div>
    </div>
  );
}
