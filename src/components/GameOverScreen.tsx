/**
 * GameOverScreen component
 * Displays when the game ends (only 1 player with chips remaining)
 */

interface GameOverScreenProps {
  /** The winner of the game */
  winner: {
    name: string;
    chips: number;
    isUser: boolean;
  };
  /** Callback when user clicks to play again */
  onPlayAgain: () => void;
}

export function GameOverScreen({ winner, onPlayAgain }: GameOverScreenProps) {
  const isUserWinner = winner.isUser;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      style={{
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="relative max-w-2xl mx-4 p-8 rounded-xl text-center"
        style={{
          background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #3E2723 100%)',
          border: '4px solid',
          borderColor: isUserWinner ? '#DAA520' : '#8B4513',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Decorative stars */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-gold-400/50 text-4xl">★</div>
          <div className="text-gold-500/60 text-5xl">★</div>
          <div className="text-gold-400/50 text-4xl">★</div>
        </div>

        {/* Game Over Title */}
        <h1
          className="text-5xl font-display font-bold mb-6"
          style={{
            color: isUserWinner ? '#DAA520' : '#CD853F',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          Game Over
        </h1>

        {/* Winner announcement */}
        <div className="mb-8">
          {isUserWinner ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-3xl font-display font-bold text-gold-400 mb-4">
                Congratulations!
              </p>
              <p className="text-xl text-gold-200 font-body">
                You've won the game with{' '}
                <span className="font-bold text-gold-300">${winner.chips}</span>!
              </p>
              <p className="text-lg text-gold-300/80 mt-4 font-body italic">
                "Well I'll be! You done cleaned 'em all out, partner! That's some mighty fine poker playin'!"
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🐴</div>
              <p className="text-3xl font-display font-bold text-gold-300 mb-4">
                {winner.name} Wins!
              </p>
              <p className="text-xl text-gold-200 font-body">
                {winner.name} has won the game with{' '}
                <span className="font-bold text-gold-300">${winner.chips}</span>.
              </p>
              <p className="text-lg text-gold-300/80 mt-4 font-body italic">
                "Don't hang your head, partner. Even the best gunslingers have tough days. Saddle up and try again!"
              </p>
            </>
          )}
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-900 font-body font-bold py-4 px-10 rounded-lg text-xl shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-gold-600"
          style={{
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
          }}
        >
          Play Again
        </button>

        {/* Decorative bottom element */}
        <div className="mt-8 flex justify-center gap-3 text-gold-400/40 text-2xl">
          ♠ ♥ ♣ ♦
        </div>
      </div>
    </div>
  );
}
