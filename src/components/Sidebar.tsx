/**
 * Main sidebar panel that combines all guidance sections.
 * Fixed panel on the right side with game state, narration, and strategic advice.
 */

import { GameState } from '../types/game';
import { GameStateDisplay } from './GameStateDisplay';
import { ActionNarration } from './ActionNarration';
import { StrategicAdvice } from './StrategicAdvice';

interface SidebarProps {
  gameState: GameState;
  lastAction?: string; // Optional: most recent action narration
}

export function Sidebar({ gameState, lastAction }: SidebarProps) {
  return (
    <div className="fixed top-4 right-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto z-50">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-2xl border-2 border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg">
          <h2 className="text-white font-bold text-lg">Poker Guide</h2>
        </div>

        {/* Section 1: Game State */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-blue-400 font-semibold text-sm uppercase tracking-wide mb-3">
            Game State
          </h3>
          <GameStateDisplay gameState={gameState} />
        </div>

        {/* Section 2: Current Action */}
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-wide mb-3">
            What's Happening
          </h3>
          <ActionNarration gameState={gameState} lastAction={lastAction} />
        </div>

        {/* Section 3: Strategic Advice */}
        <div className="p-4">
          <h3 className="text-green-400 font-semibold text-sm uppercase tracking-wide mb-3">
            Your Hand
          </h3>
          <StrategicAdvice gameState={gameState} />
        </div>
      </div>
    </div>
  );
}
