/**
 * Displays current game state information.
 * Shows pot, betting round, and whose turn it is.
 */

import { GameState } from '../types/game';

interface GameStateDisplayProps {
  gameState: GameState;
}

export function GameStateDisplay({ gameState }: GameStateDisplayProps) {
  const { pot, currentPhase, players, currentPlayerIndex } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Format phase name
  const phaseNames: Record<string, string> = {
    'pre-flop': 'Pre-Flop',
    'flop': 'Flop',
    'turn': 'Turn',
    'river': 'River',
    'showdown': 'Showdown',
  };

  const phaseName = phaseNames[currentPhase] || currentPhase;

  // Determine whose turn it is
  const turnText = currentPlayer?.isUser
    ? 'Your turn'
    : currentPlayer
    ? `${currentPlayer.name} is acting...`
    : 'Waiting...';

  return (
    <div className="space-y-3">
      {/* Pot */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm font-medium">Pot:</span>
        <span className="text-green-400 text-lg font-bold">${pot}</span>
      </div>

      {/* Betting Round */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm font-medium">Round:</span>
        <span className="text-white text-sm font-semibold">{phaseName}</span>
      </div>

      {/* Current Player */}
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm font-medium">Action:</span>
        <span
          className={`text-sm font-semibold ${
            currentPlayer?.isUser ? 'text-yellow-400' : 'text-blue-400'
          }`}
        >
          {turnText}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 pt-3">
        <div className="text-xs text-gray-500 text-center">
          {players.filter(p => !p.isFolded).length} players active
        </div>
      </div>
    </div>
  );
}
