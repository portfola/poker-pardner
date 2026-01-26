import { GameMode, DifficultyLevel } from '../types/game'
import { getAllStatistics, calculateWinRate, calculateNetProfit } from '../utils/statistics'
import { DIFFICULTY_LABELS } from '../constants/difficulty'

interface StatisticsScreenProps {
  onBack: () => void
}

export function StatisticsScreen({ onBack }: StatisticsScreenProps) {
  const stats = getAllStatistics()

  // Helper to format currency
  const formatCurrency = (amount: number): string => {
    return amount >= 0 ? `$${amount.toFixed(0)}` : `-$${Math.abs(amount).toFixed(0)}`
  }

  // Helper to format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  // Helper to format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString()
  }

  // Get all unique mode/difficulty combinations with stats
  const statEntries: Array<{
    mode: GameMode
    difficulty: DifficultyLevel
    stats: ReturnType<typeof calculateWinRate>
  }> = []

  Object.entries(stats.byModeAndDifficulty).forEach(([mode, difficulties]) => {
    Object.entries(difficulties || {}).forEach(([difficulty, modeStats]) => {
      if (modeStats && modeStats.handsPlayed > 0) {
        statEntries.push({
          mode: mode as GameMode,
          difficulty: difficulty as DifficultyLevel,
          stats: modeStats,
        })
      }
    })
  })

  // Sort by most hands played
  statEntries.sort((a, b) => b.stats.handsPlayed - a.stats.handsPlayed)

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{
        background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #3E2723 100%)',
      }}
    >
      {/* Background patterns */}
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

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-5xl font-display font-bold text-gold-400 mb-2" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            YOUR POKER STATS
          </h1>
          <div className="h-1 w-32 bg-gold-500 mx-auto my-4" />
          <p className="text-lg font-body text-sand-200">
            Track your progress across all game modes
          </p>
        </div>

        {/* Overall stats */}
        <div className="bg-wood-800 border-4 border-wood-900 rounded-lg p-6 mb-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-wood-700 rounded-lg p-4 border-2 border-wood-900">
              <div className="text-gold-400 text-3xl font-bold">
                {stats.sessionsPlayed}
              </div>
              <div className="text-sand-200 text-sm font-body mt-1">Sessions Played</div>
            </div>
            <div className="bg-wood-700 rounded-lg p-4 border-2 border-wood-900">
              <div className="text-gold-400 text-3xl font-bold">
                {formatDate(stats.createdAt)}
              </div>
              <div className="text-sand-200 text-sm font-body mt-1">Member Since</div>
            </div>
            <div className="bg-wood-700 rounded-lg p-4 border-2 border-wood-900">
              <div className="text-gold-400 text-3xl font-bold">
                {formatDate(stats.lastUpdated)}
              </div>
              <div className="text-sand-200 text-sm font-body mt-1">Last Played</div>
            </div>
          </div>
        </div>

        {/* Stats by mode and difficulty */}
        {statEntries.length === 0 ? (
          <div className="bg-wood-800 border-4 border-wood-900 rounded-lg p-12 text-center shadow-2xl">
            <div className="text-6xl mb-4">🎲</div>
            <p className="text-gold-400 text-xl font-body mb-2">No games played yet!</p>
            <p className="text-sand-200 font-body">
              Start playing to track your statistics and progress.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {statEntries.map(({ mode, difficulty, stats: modeStats }) => {
              const winRate = calculateWinRate(mode, difficulty)
              const netProfit = calculateNetProfit(mode, difficulty)
              const modeLabel = mode === 'tutorial' ? 'Tutorial' : 'Play'
              const difficultyLabel = DIFFICULTY_LABELS[difficulty]

              return (
                <div
                  key={`${mode}-${difficulty}`}
                  className="bg-wood-800 border-4 border-wood-900 rounded-lg p-6 shadow-xl"
                >
                  {/* Mode/Difficulty header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-wood-700">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-gold-400">
                        {modeLabel} Mode
                      </h3>
                      <p className="text-sand-200 font-body text-sm">
                        {difficultyLabel} Difficulty
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-400 text-2xl font-bold">
                        {formatPercentage(winRate)}
                      </div>
                      <div className="text-sand-200 text-xs font-body">Win Rate</div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-wood-700 rounded p-3 border-2 border-wood-900">
                      <div className="text-gold-300 text-lg font-bold">
                        {modeStats.handsPlayed}
                      </div>
                      <div className="text-sand-200 text-xs font-body">Hands Played</div>
                    </div>
                    <div className="bg-wood-700 rounded p-3 border-2 border-wood-900">
                      <div className="text-gold-300 text-lg font-bold">
                        {modeStats.handsWon}
                      </div>
                      <div className="text-sand-200 text-xs font-body">Hands Won</div>
                    </div>
                    <div className="bg-wood-700 rounded p-3 border-2 border-wood-900">
                      <div className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(netProfit)}
                      </div>
                      <div className="text-sand-200 text-xs font-body">Net Profit</div>
                    </div>
                    <div className="bg-wood-700 rounded p-3 border-2 border-wood-900">
                      <div className="text-gold-300 text-lg font-bold">
                        {formatCurrency(modeStats.biggestPot)}
                      </div>
                      <div className="text-sand-200 text-xs font-body">Biggest Pot</div>
                    </div>
                    <div className="bg-wood-700 rounded p-3 border-2 border-wood-900">
                      <div className="text-gold-300 text-lg font-bold">
                        {modeStats.currentStreak}
                      </div>
                      <div className="text-sand-200 text-xs font-body">Current Streak</div>
                    </div>
                    <div className="bg-wood-700 rounded p-3 border-2 border-wood-900">
                      <div className="text-gold-300 text-lg font-bold">
                        {modeStats.bestStreak}
                      </div>
                      <div className="text-sand-200 text-xs font-body">Best Streak</div>
                    </div>
                    <div className="bg-wood-700 rounded p-3 border-2 border-wood-900">
                      <div className="text-gold-300 text-lg font-bold">
                        {modeStats.allInsCount}
                      </div>
                      <div className="text-sand-200 text-xs font-body">All-Ins</div>
                    </div>
                    <div className="bg-wood-700 rounded p-3 border-2 border-wood-900">
                      <div className="text-gold-300 text-lg font-bold">
                        {modeStats.foldCount}
                      </div>
                      <div className="text-sand-200 text-xs font-body">Folds</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Back button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={onBack}
            aria-label="Go back to mode selection"
            className="bg-gradient-to-b from-wood-600 to-wood-700 hover:from-wood-500 hover:to-wood-600 text-sand-100 font-body font-bold py-4 px-10 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-wood-800"
            style={{
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            }}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}
