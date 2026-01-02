/**
 * Main poker table component that arranges all UI elements.
 * Creates a green felt-style table with 4 player positions.
 */

import { GameState } from '../types/game';
import { PlayerPosition } from './PlayerPosition';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';
import { ActionButtons } from './ActionButtons';

interface PokerTableProps {
  gameState: GameState;
  onFold: () => void;
  onCall: () => void;
  onRaise: () => void;
}

export function PokerTable({ gameState, onFold, onCall, onRaise }: PokerTableProps) {
  const { players, pot, communityCards, dealerPosition, currentPlayerIndex, currentPhase } =
    gameState;

  // Determine if cards should be shown (at showdown)
  const showAllCards = currentPhase === 'showdown';

  // Arrange players by position (0=bottom/user, 1=left, 2=top, 3=right)
  const bottomPlayer = players.find(p => p.position === 0);
  const leftPlayer = players.find(p => p.position === 1);
  const topPlayer = players.find(p => p.position === 2);
  const rightPlayer = players.find(p => p.position === 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4 pb-48">
      <div className="relative w-full max-w-5xl">
        {/* Poker Table */}
        <div
          className="
            relative
            bg-gradient-to-br from-green-700 to-green-900
            rounded-[50%]
            border-8 border-amber-900
            shadow-2xl
            aspect-[16/9]
            p-6
          "
          style={{
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Table felt texture overlay */}
          <div className="absolute inset-0 rounded-[50%] opacity-10 pointer-events-none">
            <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.02) 10px, rgba(255,255,255,.02) 20px)' }} />
          </div>

          {/* Players positioned around the table */}

          {/* Top Player (Position 2) */}
          {topPlayer && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <PlayerPosition
                player={topPlayer}
                isDealer={dealerPosition === 2}
                isCurrentTurn={currentPlayerIndex === 2}
                showCards={showAllCards}
              />
            </div>
          )}

          {/* Left Player (Position 1) */}
          {leftPlayer && (
            <div className="absolute top-1/2 left-4 -translate-y-1/2">
              <PlayerPosition
                player={leftPlayer}
                isDealer={dealerPosition === 1}
                isCurrentTurn={currentPlayerIndex === 1}
                showCards={showAllCards}
              />
            </div>
          )}

          {/* Right Player (Position 3) */}
          {rightPlayer && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              <PlayerPosition
                player={rightPlayer}
                isDealer={dealerPosition === 3}
                isCurrentTurn={currentPlayerIndex === 3}
                showCards={showAllCards}
              />
            </div>
          )}

          {/* Bottom Player - User (Position 0) */}
          {bottomPlayer && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <PlayerPosition
                player={bottomPlayer}
                isDealer={dealerPosition === 0}
                isCurrentTurn={currentPlayerIndex === 0}
                showCards={true} // User's cards always visible
              />
            </div>
          )}

          {/* Center Area - Community Cards and Pot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
            {/* Pot Display */}
            <PotDisplay amount={pot} />

            {/* Community Cards */}
            {communityCards.length > 0 && (
              <div className="mt-2">
                <CommunityCards cards={communityCards} />
              </div>
            )}
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-4 text-center text-white">
          <div className="text-sm opacity-75">
            Phase: <span className="font-semibold capitalize">{currentPhase}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons
          gameState={gameState}
          onFold={onFold}
          onCall={onCall}
          onRaise={onRaise}
        />
      </div>
    </div>
  );
}
