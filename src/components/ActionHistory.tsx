/**
 * Modal component displaying the history of all actions in the current hand.
 */

import { ActionHistoryEntry, GamePhase } from '../types/game';

interface ActionHistoryProps {
  history: ActionHistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const phaseLabels: Record<GamePhase, string> = {
  'pre-flop': 'Pre-Flop',
  'flop': 'Flop',
  'turn': 'Turn',
  'river': 'River',
  'showdown': 'Showdown',
};

function formatAction(entry: ActionHistoryEntry): string {
  switch (entry.action) {
    case 'fold':
      return 'folded';
    case 'check':
      return 'checked';
    case 'call':
      return entry.amount ? `called $${entry.amount}` : 'called';
    case 'raise':
      return entry.amount ? `raised to $${entry.amount}` : 'raised';
    case 'smallBlind':
      return entry.amount ? `posted small blind $${entry.amount}` : 'posted small blind';
    case 'bigBlind':
      return entry.amount ? `posted big blind $${entry.amount}` : 'posted big blind';
    default:
      return entry.action;
  }
}

export function ActionHistory({ history, isOpen, onClose }: ActionHistoryProps) {
  if (!isOpen) return null;

  // Group history by phase
  const groupedHistory: Record<GamePhase, ActionHistoryEntry[]> = {
    'pre-flop': [],
    'flop': [],
    'turn': [],
    'river': [],
    'showdown': [],
  };

  history.forEach(entry => {
    groupedHistory[entry.phase].push(entry);
  });

  const phases: GamePhase[] = ['pre-flop', 'flop', 'turn', 'river'];

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden border-4 border-amber-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-amber-800/30 bg-gradient-to-r from-amber-100 to-yellow-100">
          <h2
            className="text-stone-800 font-black text-lg sm:text-xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Hand History
          </h2>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 p-1 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
          {history.length === 0 ? (
            <p className="text-stone-500 text-center italic py-8" style={{ fontFamily: "'Crimson Text', serif" }}>
              No actions yet this hand.
            </p>
          ) : (
            <div className="space-y-4">
              {phases.map(phase => {
                const phaseEntries = groupedHistory[phase];
                if (phaseEntries.length === 0) return null;

                return (
                  <div key={phase}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-amber-300"></div>
                      <span
                        className="text-xs font-bold text-amber-700 uppercase tracking-wider px-2"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {phaseLabels[phase]}
                      </span>
                      <div className="h-px flex-1 bg-amber-300"></div>
                    </div>

                    <div className="space-y-1.5">
                      {phaseEntries.map(entry => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${
                            entry.isUser
                              ? 'bg-emerald-100/60 border border-emerald-300'
                              : 'bg-white/60 border border-amber-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold text-sm ${
                                entry.isUser ? 'text-emerald-800' : 'text-stone-700'
                              }`}
                              style={{ fontFamily: "'Crimson Text', serif" }}
                            >
                              {entry.playerName}
                            </span>
                            <span
                              className="text-stone-600 text-sm"
                              style={{ fontFamily: "'Crimson Text', serif" }}
                            >
                              {formatAction(entry)}
                            </span>
                          </div>
                          <span className="text-xs text-stone-500 font-medium">
                            Pot: ${entry.potAfter}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
