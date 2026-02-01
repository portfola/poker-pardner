import { useState } from 'react'
import { GameMode, DifficultyLevel } from '../types/game'
import { DIFFICULTY_LABELS, DIFFICULTY_DESCRIPTIONS, DEFAULT_DIFFICULTY } from '../constants/difficulty'
import { StatisticsScreen } from './StatisticsScreen'

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode, difficulty: DifficultyLevel) => void
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(DEFAULT_DIFFICULTY)
  const [showStats, setShowStats] = useState(false)

  // If showing statistics, render the statistics screen
  if (showStats) {
    return <StatisticsScreen onBack={() => setShowStats(false)} />
  }

  // If mode is selected, show difficulty selection
  if (selectedMode) {
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
          <div className="text-6xl mb-6">🎯</div>

          <p className="text-gold-400 text-xl font-display font-bold mb-8 tracking-wide">
            Choose Your Challenge Level
          </p>

          <div className="flex flex-col gap-4 justify-center max-w-2xl mb-8">
            {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                aria-label={`Select ${difficulty} difficulty`}
                className={`w-full font-body font-bold py-6 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 ${
                  selectedDifficulty === difficulty
                    ? 'bg-gradient-to-b from-gold-400 to-gold-500 border-gold-600 text-wood-900'
                    : 'bg-gradient-to-b from-wood-700 to-wood-800 border-wood-900 text-sand-100'
                }`}
                style={{
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                }}
              >
                <div className="text-xl mb-2">{DIFFICULTY_LABELS[difficulty]}</div>
                <div className="text-sm opacity-90">
                  {DIFFICULTY_DESCRIPTIONS[difficulty]}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setSelectedMode(null)}
              aria-label="Go back to mode selection"
              className="bg-gradient-to-b from-wood-600 to-wood-700 hover:from-wood-500 hover:to-wood-600 text-sand-100 font-body font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-wood-800"
              style={{
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => onSelectMode(selectedMode, selectedDifficulty)}
              aria-label="Start game with selected difficulty"
              className="bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-body font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-green-700"
              style={{
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              Start Game →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Mode selection screen
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
              onClick={() => setSelectedMode('tutorial')}
              aria-label="Start tutorial mode with guidance"
              className="w-full bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-300 hover:to-blue-400 text-white font-body font-bold py-6 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-blue-600"
              style={{
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="text-3xl mb-2">📚</div>
              <div className="text-xl mb-2">Tutorial Mode</div>
              <div className="text-sm opacity-90">
                Learn with full guidance and strategic advice
              </div>
            </button>
          </div>

          {/* Play Mode */}
          <div className="flex-1">
            <button
              onClick={() => setSelectedMode('training')}
              aria-label="Start play mode without guidance"
              className="w-full bg-gradient-to-b from-red-400 to-red-500 hover:from-red-300 hover:to-red-400 text-white font-body font-bold py-6 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-red-600"
              style={{
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              <div className="text-3xl mb-2">🔫</div>
              <div className="text-xl mb-2">Play Mode</div>
              <div className="text-sm opacity-90">
                Test your skills with no hints
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

        {/* Statistics button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowStats(true)}
            aria-label="View your statistics"
            className="bg-gradient-to-b from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-wood-900 font-body font-bold py-3 px-8 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-gold-700"
            style={{
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            }}
          >
            <span className="mr-2">📊</span>
            View Statistics
          </button>
        </div>
      </div>
    </div>
  )
}
