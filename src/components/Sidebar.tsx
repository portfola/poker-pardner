/**
 * Main sidebar panel that combines all guidance sections.
 * Responsive: Fixed panel on right (desktop), collapsible drawer (mobile/tablet).
 */

import { useState } from 'react';
import { GameState } from '../types/game';
import { GameStateDisplay } from './GameStateDisplay';
import { ActionNarration } from './ActionNarration';
import { StrategicAdvice } from './StrategicAdvice';

interface SidebarProps {
  gameState: GameState;
  lastAction?: string;
}

export function Sidebar({ gameState, lastAction }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile/Tablet Toggle Button - visible on screens < 1200px */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 xl:hidden bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg shadow-lg transition-all active:scale-95"
        aria-label={isOpen ? 'Close guide panel' : 'Open guide panel'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          // Close icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Info/Guide icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* Backdrop overlay for mobile - shown when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`
          fixed z-50 bg-gray-800/95 backdrop-blur-sm shadow-2xl border-2 border-gray-700
          transition-transform duration-300 ease-in-out

          /* Mobile: Bottom sheet style */
          bottom-0 left-0 right-0 rounded-t-2xl max-h-[70vh] overflow-y-auto
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}

          /* Tablet: Side drawer */
          md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-80 md:max-h-full md:rounded-t-none md:rounded-l-lg
          ${isOpen ? 'md:translate-x-0 md:translate-y-0' : 'md:translate-x-full md:translate-y-0'}

          /* Desktop: Always visible */
          xl:translate-x-0 xl:translate-y-0 xl:top-4 xl:right-4 xl:bottom-auto xl:left-auto
          xl:w-80 xl:max-h-[calc(100vh-2rem)] xl:rounded-lg
        `}
      >
        {/* Drag handle for mobile */}
        <div className="xl:hidden flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 xl:rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Poker Guide</h2>
            {/* Close button for mobile/tablet */}
            <button
              onClick={() => setIsOpen(false)}
              className="xl:hidden text-white/80 hover:text-white p-1"
              aria-label="Close guide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
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
    </>
  );
}
