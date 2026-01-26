import { GameMode } from '../types/game'

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode) => void
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #3E2723 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(93, 64, 55, 0.3) 2px, rgba(93, 64, 55, 0.3) 4px),
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(93, 64, 55, 0.2) 80px, rgba(93, 64, 55, 0.2) 160px)
          `,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(218, 165, 32, 0.12) 0%, transparent 60%)',
        }}
      />

      <div className="text-center relative z-10 px-4">
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-gold-400/50 text-4xl">★</div>
          <div className="text-gold-500/60 text-5xl">★</div>
          <div className="text-gold-400/50 text-4xl">★</div>
        </div>

        <div
          className="inline-block bg-sand-100 border-8 border-wood-800 p-8 shadow-2xl mb-12"
          style={{
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
            background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%)',
          }}
        >
          <h1
            className="text-5xl font-display font-bold text-wood-900 mb-2"
            style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)' }}
          >
            POKER PARDNER
          </h1>
          <div className="h-1 w-32 bg-wood-700 mx-auto my-4" />
          <p className="text-lg font-body text-wood-800 font-semibold tracking-wide">
            Learn Texas Hold'em
          </p>
          <p className="text-base font-body text-wood-700">Old West Style</p>
        </div>

        <div className="text-6xl mb-12">🐴</div>

        <p className="text-gold-400 text-xl font-display font-bold mb-8 tracking-wide">
          Choose Your Path, Partner
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center max-w-4xl">
          {/* Tutorial Mode */}
          <div className="flex-1">
            <button
              onClick={() => onSelectMode('tutorial')}
              aria-label="Start tutorial mode with guidance"
              className="w-full bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-300 hover:to-blue-400 text-white font-body font-bold py-6 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-blue-600"
              style={{
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="text-3xl mb-2">📚</div>
              <div className="text-xl mb-2">Tutorial Mode</div>
              <div className="text-sm opacity-90">
                Learn with full guidance and strategic advice at every step
              </div>
            </button>
          </div>

          {/* Play Mode */}
          <div className="flex-1">
            <button
              onClick={() => onSelectMode('training')}
              aria-label="Start play mode without guidance"
              className="w-full bg-gradient-to-b from-red-400 to-red-500 hover:from-red-300 hover:to-red-400 text-white font-body font-bold py-6 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-red-600"
              style={{
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="text-3xl mb-2">🔫</div>
              <div className="text-xl mb-2">Play Mode</div>
              <div className="text-sm opacity-90">
                Test your skills with no strategic advice or hints
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-12 text-2xl">
          <span className="text-red-600">♥</span>
          <span className="text-black">♠</span>
          <span className="text-red-600">♦</span>
          <span className="text-black">♣</span>
        </div>
      </div>
    </div>
  )
}
