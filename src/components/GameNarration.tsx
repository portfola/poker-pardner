/**
 * Displays game narration and event log.
 * Shows what's happening in the game step-by-step.
 */

interface GameNarrationProps {
  messages: string[];
}

export function GameNarration({ messages }: GameNarrationProps) {
  // Show last 10 messages
  const recentMessages = messages.slice(-10);

  return (
    <div className="fixed top-4 left-4 w-72 bg-gray-800/95 rounded-lg shadow-2xl p-4 border-2 border-gray-700 max-h-96 overflow-y-auto z-50">
      <h3 className="text-white font-bold mb-2 text-sm uppercase tracking-wide">Game Log</h3>
      <div className="space-y-2">
        {recentMessages.length === 0 ? (
          <div className="text-gray-400 text-sm italic">Waiting for game to start...</div>
        ) : (
          recentMessages.map((message, index) => (
            <div
              key={index}
              className={`text-sm ${
                index === recentMessages.length - 1
                  ? 'text-yellow-300 font-semibold'
                  : 'text-gray-300'
              }`}
            >
              {message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
