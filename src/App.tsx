import './App.css'
import { useState, useEffect, useRef } from 'react'
import { useGameState } from './hooks/useGameState'
import { PokerTable } from './components/PokerTable'
import { Sidebar } from './components/Sidebar'
import { ShowdownDisplay } from './components/ShowdownDisplay'
import { MusicPlayer } from './components/MusicPlayer'
import { ConfirmDialog } from './components/ConfirmDialog'
import { makeAIDecision } from './utils/ai'
import { TIMING } from './constants/timing'
import { logger } from './utils/logger'
import { getBestFiveCardHand, getBestHandFromSix, evaluateHand } from './utils/handEvaluator'
import { evaluateHandStrength } from './utils/handStrength'

function App() {
  const { state, startNewHand, handlePlayerAction, isBettingComplete, startPhaseAdvance, advancePhase, determineWinner, resetForNextHand } = useGameState()
  const [lastAction, setLastAction] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showFoldConfirm, setShowFoldConfirm] = useState(false)
  const processingRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)

  // Check if hand has been dealt
  const hasCards = state.players.some(p => p.holeCards.length > 0)

  // Set last action message
  const setAction = (message: string) => {
    setLastAction(message)
  }

  // Helper function to evaluate current hand strength
  const evaluateCurrentHandStrength = (): 'weak' | 'medium' | 'strong' => {
    const userPlayer = state.players.find(p => p.isUser)
    if (!userPlayer || userPlayer.holeCards.length === 0) {
      return 'weak'
    }

    // Pre-flop: simple evaluation
    if (state.communityCards.length === 0) {
      const card1 = userPlayer.holeCards[0]
      const card2 = userPlayer.holeCards[1]

      if (card1.rank === card2.rank) {
        const highRanks = ['A', 'K', 'Q', 'J', '10']
        return highRanks.includes(card1.rank) ? 'strong' : 'medium'
      }

      const highRanks = ['A', 'K', 'Q']
      const hasHighCard = highRanks.includes(card1.rank) || highRanks.includes(card2.rank)
      const suited = card1.suit === card2.suit
      return (hasHighCard && suited) ? 'medium' : 'weak'
    }

    // Post-flop: evaluate actual hand
    let evaluation
    const totalCards = userPlayer.holeCards.length + state.communityCards.length

    if (totalCards === 7) {
      // River (7 cards)
      evaluation = getBestFiveCardHand(userPlayer.holeCards, state.communityCards)
    } else if (totalCards === 6) {
      // Turn (6 cards)
      const allCards = [...userPlayer.holeCards, ...state.communityCards]
      evaluation = getBestHandFromSix(allCards)
    } else if (totalCards === 5) {
      // Flop (5 cards)
      const allCards = [...userPlayer.holeCards, ...state.communityCards]
      evaluation = evaluateHand(allCards)
    } else {
      return 'weak'
    }

    return evaluateHandStrength(evaluation)
  }

  // Action handlers for user
  const handleFold = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer && !isProcessing) {
      // Check hand strength - confirm if medium or strong
      const strength = evaluateCurrentHandStrength()

      if (strength === 'medium' || strength === 'strong') {
        setShowFoldConfirm(true)
      } else {
        // Weak hand, fold immediately
        handlePlayerAction(userPlayer.id, 'fold')
        setAction('You folded.')
      }
    }
  }

  // Confirm fold action
  const confirmFold = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer) {
      handlePlayerAction(userPlayer.id, 'fold')
      setAction('You folded.')
    }
    setShowFoldConfirm(false)
  }

  // Cancel fold action
  const cancelFold = () => {
    setShowFoldConfirm(false)
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

    // Start new hand after a brief delay
    setTimeout(() => {
      startNewHand()
    }, TIMING.NEW_HAND_DELAY)
  }

  // Handle showdown - determine winner when phase is showdown
  useEffect(() => {
    if (state.currentPhase === 'showdown' && !state.isHandComplete) {
      // Trigger winner determination
      const timer = setTimeout(() => {
        determineWinner()
      }, TIMING.SHOWDOWN_REVEAL_DELAY) // Pause to let players see the cards

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
    // Don't start phase advancement if already advancing
    if (!state.isHandComplete && !state.isAdvancingPhase && isBettingComplete()) {
      processingRef.current = true
      setIsProcessing(true)

      // Mark that we're starting to advance (prevents re-triggering)
      startPhaseAdvance()

      timeoutRef.current = window.setTimeout(() => {
        setAction('Betting round complete.')
        timeoutRef.current = window.setTimeout(() => {
          const phaseNames: Record<string, string> = {
            'pre-flop': 'Dealing the flop...',
            'flop': 'Dealing the turn...',
            'turn': 'Dealing the river...',
            'river': 'Showdown!'
          }
          setAction(phaseNames[state.currentPhase] || 'Next phase...')

          advancePhase()

          processingRef.current = false
          setIsProcessing(false)
        }, TIMING.PHASE_ADVANCE_DELAY)
      }, TIMING.BETTING_COMPLETE_DELAY)
      return
    }

    // Only process if it's an AI player's turn
    if (!currentPlayer || currentPlayer.isUser || state.isHandComplete) {
      return
    }

    // Mark as processing
    processingRef.current = true
    setIsProcessing(true)

    // Delay before AI acts (realistic thinking time)
    const delay = TIMING.AI_TURN_BASE_DELAY + Math.random() * TIMING.AI_TURN_RANDOM_DELAY

    timeoutRef.current = window.setTimeout(() => {
      logger.debug('AI turn:', currentPlayer.name)

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

    // Cleanup function - clear any pending timeouts on unmount or dependency change
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      processingRef.current = false
    }
  }, [state.currentPlayerIndex, state.players, state.currentPhase, state.isHandComplete, state.isAdvancingPhase, hasCards, isBettingComplete, startPhaseAdvance, advancePhase, handlePlayerAction])

  if (!hasCards) {
    // Welcome screen - Saloon entrance
    return (
      <>
      <MusicPlayer gameStarted={false} />
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
            aria-label="Start tutorial mode to learn poker"
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
      </>
    )
  }

  return (
    <>
      <MusicPlayer gameStarted={true} />
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
      <ConfirmDialog
        isOpen={showFoldConfirm}
        title="Fold a Good Hand?"
        message="You have a decent hand. Are you sure you want to fold? This could be a winning hand!"
        confirmLabel="Yes, Fold"
        cancelLabel="Keep Playing"
        onConfirm={confirmFold}
        onCancel={cancelFold}
        variant="warning"
      />
    </>
  )
}

export default App
