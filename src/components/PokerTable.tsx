/**
 * Saloon-style poker table with green felt and wooden border.
 * Classic Wild West casino aesthetic.
 */

import { GameState } from '../types/game';
import { PlayerPosition } from './PlayerPosition';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';

interface PokerTableProps {
  gameState: GameState;
}

export function PokerTable({ gameState }: PokerTableProps) {
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
    <div
      className="min-h-screen flex items-center justify-center p-2 sm:p-4 pb-56 sm:pb-64 md:pb-72 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #3E2723 100%)',
      }}
    >
      {/* Wood grain texture */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(93, 64, 55, 0.3) 2px, rgba(93, 64, 55, 0.3) 4px),
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(93, 64, 55, 0.2) 80px, rgba(93, 64, 55, 0.2) 160px)
          `,
        }}
      />

      {/* Warm ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(218, 165, 32, 0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative w-full max-w-4xl">
        {/* Wooden Table Border */}
        <div
          className="relative rounded-[50%] p-4 shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #6D4C41 0%, #5D4037 50%, #4E342E 100%)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.1)',
          }}
        >
          {/* Wood grain on border */}
          <div
            className="absolute inset-0 rounded-[50%] opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(62, 39, 35, 0.4) 3px, rgba(62, 39, 35, 0.4) 6px)',
            }}
          />

          {/* Green Felt Table */}
          <div
            className="
              relative
              bg-gradient-to-br from-felt-800 to-felt-900
              rounded-[50%]
              shadow-inner
              aspect-[16/9]
              p-2 sm:p-4 md:p-6
            "
            style={{
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.4), inset 0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            {/* Felt texture overlay */}
            <div
              className="absolute inset-0 rounded-[50%] opacity-20 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
              }}
            />

            {/* Subtle table center marking */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-felt-700/40 pointer-events-none"
            />

            {/* Players positioned around the table */}

            {/* Top Player (Position 2) */}
            {topPlayer && (
              <div className="absolute top-1 sm:top-2 md:top-4 left-1/2 -translate-x-1/2">
                <PlayerPosition
                  player={topPlayer}
                  isDealer={dealerPosition === 2}
                  isCurrentTurn={currentPlayerIndex === 2}
                  showCards={showAllCards}
                  compact={true}
                />
              </div>
            )}

            {/* Left Player (Position 1) */}
            {leftPlayer && (
              <div className="absolute top-1/2 left-1 sm:left-2 md:left-4 -translate-y-1/2">
                <PlayerPosition
                  player={leftPlayer}
                  isDealer={dealerPosition === 1}
                  isCurrentTurn={currentPlayerIndex === 1}
                  showCards={showAllCards}
                  compact={true}
                />
              </div>
            )}

            {/* Right Player (Position 3) */}
            {rightPlayer && (
              <div className="absolute top-1/2 right-1 sm:right-2 md:right-4 -translate-y-1/2">
                <PlayerPosition
                  player={rightPlayer}
                  isDealer={dealerPosition === 3}
                  isCurrentTurn={currentPlayerIndex === 3}
                  showCards={showAllCards}
                  compact={true}
                />
              </div>
            )}

            {/* Bottom Player - User (Position 0) - Positioned lower with higher z-index to stay visible */}
            {bottomPlayer && (
              <div className="absolute bottom-[-12px] sm:bottom-[-8px] md:bottom-0 left-1/2 -translate-x-1/2 z-20">
                <PlayerPosition
                  player={bottomPlayer}
                  isDealer={dealerPosition === 0}
                  isCurrentTurn={currentPlayerIndex === 0}
                  showCards={true}
                />
              </div>
            )}

            {/* Center Area - Community Cards and Pot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10">
              {/* Pot Display */}
              <PotDisplay amount={pot} isAwarding={currentPhase === 'showdown' && gameState.isHandComplete} />

              {/* Community Cards */}
              {communityCards.length > 0 && (
                <div className="mt-2">
                  <CommunityCards cards={communityCards} />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
