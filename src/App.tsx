import './App.css'
import { useState, useEffect, useRef } from 'react'
import { useGameState } from './hooks/useGameState'
import { PokerTable } from './components/PokerTable'
import { Sidebar } from './components/Sidebar'
import { ShowdownDisplay } from './components/ShowdownDisplay'
import { makeAIDecision } from './utils/ai'

function App() {
  const { state, startNewHand, handlePlayerAction, isBettingComplete, advancePhase, determineWinner, resetForNextHand } = useGameState()
  const [lastAction, setLastAction] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const processingRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)
  const phaseJustAdvanced = useRef(false)

  // Check if hand has been dealt
  const hasCards = state.players.some(p => p.holeCards.length > 0)

  // Set last action message
  const setAction = (message: string) => {
    setLastAction(message)
  }

  // Action handlers for user
  const handleFold = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer && !isProcessing) {
      handlePlayerAction(userPlayer.id, 'fold')
      setAction('You folded.')
    }
  }

  const handleCall = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer && !isProcessing) {
      const amountToCall = state.currentBet - userPlayer.currentBet
      if (amountToCall === 0) {
        handlePlayerAction(userPlayer.id, 'check')
        setAction('You checked.')
      } else {
        handlePlayerAction(userPlayer.id, 'call')
        setAction(`You called $${amountToCall}.`)
      }
    }
  }

  const handleRaise = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer && !isProcessing) {
      // For Phase 1, use minimum raise (currentBet + bigBlind)
      const raiseAmount = state.currentBet + state.bigBlind
      handlePlayerAction(userPlayer.id, 'raise', raiseAmount)
      setAction(`You raised to $${raiseAmount}.`)
    }
  }

  // Custom start handler
  const handleStartNewHand = () => {
    setLastAction('')
    phaseJustAdvanced.current = false
    startNewHand()
  }

  // Handle next hand after showdown
  const handleNextHand = () => {
    const userPlayer = state.players.find(p => p.isUser)

    // If user is eliminated, start completely new game
    if (userPlayer && userPlayer.chips === 0) {
      handleStartNewHand()
      return
    }

    // Otherwise, reset for next hand
    resetForNextHand()
    setLastAction('')
    phaseJustAdvanced.current = false

    // Start new hand after a brief delay
    setTimeout(() => {
      startNewHand()
    }, 500)
  }

  // Handle showdown - determine winner when phase is showdown
  useEffect(() => {
    if (state.currentPhase === 'showdown' && !state.isHandComplete) {
      // Trigger winner determination
      const timer = setTimeout(() => {
        determineWinner()
      }, 1500) // Pause to let players see the cards

      return () => clearTimeout(timer)
    }
  }, [state.currentPhase, state.isHandComplete, determineWinner])

  // AI automation with delays
  useEffect(() => {
    // Only run if game has actually started
    if (!hasCards) {
      return
    }

    // Prevent multiple simultaneous processes
    if (processingRef.current) {
      return
    }

    const currentPlayer = state.players[state.currentPlayerIndex]

    // Check if betting round is complete
    // Don't check immediately after a phase was just advanced
    if (!state.isHandComplete && isBettingComplete() && !phaseJustAdvanced.current) {
      processingRef.current = true
      setIsProcessing(true)
      phaseJustAdvanced.current = true

      timeoutRef.current = window.setTimeout(() => {
        setAction('Betting round complete.')
        timeoutRef.current = window.setTimeout(() => {
          advancePhase()

          // Reset the flag after a delay to allow new betting round to start
          window.setTimeout(() => {
            phaseJustAdvanced.current = false
          }, 1500)

          const phaseNames: Record<string, string> = {
            'pre-flop': 'Dealing the flop...',
            'flop': 'Dealing the turn...',
            'turn': 'Dealing the river...',
            'river': 'Showdown!'
          }
          setAction(phaseNames[state.currentPhase] || 'Next phase...')

          processingRef.current = false
          setIsProcessing(false)
        }, 1000)
      }, 500)
      return
    }

    // Only process if it's an AI player's turn
    if (!currentPlayer || currentPlayer.isUser || state.isHandComplete) {
      return
    }

    // Mark as processing
    processingRef.current = true
    setIsProcessing(true)

    // Delay before AI acts (1-2 seconds for realism)
    const delay = 1000 + Math.random() * 1000

    timeoutRef.current = window.setTimeout(() => {
      console.log('AI turn:', currentPlayer.name)

      // Make AI decision
      const decision = makeAIDecision(currentPlayer, state)

      // Add narration based on action
      let narration = `${currentPlayer.name} `
      if (decision.action === 'fold') {
        narration += 'folds.'
      } else if (decision.action === 'check') {
        narration += 'checks.'
      } else if (decision.action === 'call') {
        const amountToCall = state.currentBet - currentPlayer.currentBet
        narration += `calls $${amountToCall}.`
      } else if (decision.action === 'raise') {
        narration += `raises to $${decision.amount}.`
      }

      setAction(narration)

      // Execute the action
      handlePlayerAction(currentPlayer.id, decision.action, decision.amount)

      // Mark processing complete immediately so next player can act
      processingRef.current = false
      setIsProcessing(false)
    }, delay)

    // Cleanup - don't clear timeout as it's managed by ref
    return () => {
      // Don't clear the timeout here - let it complete
    }
  }, [state.currentPlayerIndex, state.players, state.currentPhase, state.isHandComplete, hasCards])

  if (!hasCards) {
    // Welcome screen - Saloon entrance
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #3E2723 100%)',
        }}
      >
        {/* Wood grain background */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(93, 64, 55, 0.3) 2px, rgba(93, 64, 55, 0.3) 4px),
              repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(93, 64, 55, 0.2) 80px, rgba(93, 64, 55, 0.2) 160px)
            `,
          }}
        />

        {/* Warm lantern glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(218, 165, 32, 0.12) 0%, transparent 60%)',
          }}
        />

        <div className="text-center relative z-10">
          {/* Western decorative stars */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-gold-400/50 text-4xl">★</div>
            <div className="text-gold-500/60 text-5xl">★</div>
            <div className="text-gold-400/50 text-4xl">★</div>
          </div>

          {/* Wanted poster style title */}
          <div
            className="inline-block bg-sand-100 border-8 border-wood-800 p-8 shadow-2xl mb-8"
            style={{
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
              background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5B7 100%)',
            }}
          >
            {/* Title */}
            <h1
              className="text-6xl font-display font-bold text-wood-900 mb-2"
              style={{
                textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)',
              }}
            >
              POKER PARDNER
            </h1>

            {/* Subtitle */}
            <div className="h-1 w-32 bg-wood-700 mx-auto my-4" />
            <p className="text-lg font-body text-wood-800 font-semibold tracking-wide">
              Learn Texas Hold'em
            </p>
            <p className="text-base font-body text-wood-700">
              Old West Style
            </p>
          </div>

          {/* Horseshoe for luck */}
          <div className="text-6xl mb-6">🐴</div>

          {/* Start button - Saloon door style */}
          <button
            onClick={handleStartNewHand}
            className="bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-900 font-body font-bold py-4 px-10 rounded-lg text-xl shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-gold-600"
            style={{
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            }}
          >
            Start Tutorial
          </button>

          {/* Card suits */}
          <div className="flex justify-center gap-4 mt-8 text-2xl">
            <span className="text-red-600">♥</span>
            <span className="text-black">♠</span>
            <span className="text-red-600">♦</span>
            <span className="text-black">♣</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Sidebar gameState={state} lastAction={lastAction} />
      <PokerTable
        gameState={state}
        onFold={handleFold}
        onCall={handleCall}
        onRaise={handleRaise}
      />
      <ShowdownDisplay
        gameState={state}
        onNextHand={handleNextHand}
      />
    </>
  )
}

export default App
