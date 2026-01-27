/**
 * Western saloon pot of gold display.
 */

interface PotDisplayProps {
  amount: number;
  isAwarding?: boolean;
}

export function PotDisplay({ amount, isAwarding = false }: PotDisplayProps) {
  // Format large numbers with commas for readability
  const formattedAmount = amount.toLocaleString('en-US');

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-500 ${isAwarding ? 'scale-110' : ''}`}>
      <div className="relative">
        {/* Pot of gold */}
        <div
          className={`relative bg-gradient-to-b from-whiskey-600 via-whiskey-700 to-whiskey-800 px-6 py-3 rounded-lg shadow-xl border-2 border-wood-700 transition-all ${
            isAwarding ? 'ring-4 ring-green-500/50 animate-pulse' : ''
          }`}
          style={{
            boxShadow: isAwarding
              ? '0 8px 24px rgba(34, 197, 94, 0.5), inset 0 2px 4px rgba(205, 133, 63, 0.2)'
              : '0 6px 16px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(205, 133, 63, 0.2)',
          }}
        >
          {/* POT label */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-sand-100 border-2 border-wood-700 rounded px-2 py-0.5 shadow-md">
            <span className="text-wood-900 text-xs font-body font-bold tracking-wider">POT</span>
          </div>

          {/* Amount display */}
          <div className="relative z-10 text-center mt-1">
            <div
              className="text-3xl font-display font-bold text-gold-400 tracking-wide"
              style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 0 10px rgba(218, 165, 32, 0.3)' }}
            >
              ${formattedAmount}
            </div>
          </div>

          {/* Gold coin pile effect */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-60">
            <span className="text-gold-400 text-xs">🪙</span>
            <span className="text-gold-400 text-xs">🪙</span>
            <span className="text-gold-400 text-xs">🪙</span>
          </div>
        </div>
      </div>
    </div>
  );
}
