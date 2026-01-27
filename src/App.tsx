import './App.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameState } from './hooks/useGameState'
import { useSoundEffects } from './hooks/useSoundEffects'
import { PokerTable } from './components/PokerTable'
import { CowboyPanel } from './components/CowboyPanel'
import { MusicPlayer } from './components/MusicPlayer'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ModeSelection } from './components/ModeSelection'
import { GameOverScreen } from './components/GameOverScreen'
import { makeAIDecision } from './utils/ai'
import { TIMING } from './constants/timing'
import { getBestFiveCardHand, getBestHandFromSix, evaluateHand } from './utils/handEvaluator'
import { evaluateHandStrength } from './utils/handStrength'
import {
  generateHandStartNarration,
  generateAIActionNarration,
  generateUserTurnNarration,
  generateUserActionNarration,
  generateShowdownNarration,
} from './utils/cowboyNarration'
import {
  trackModeSelection,
  trackHandStart,
  trackUserAction,
  trackSessionStart,
} from './utils/analytics'
import { incrementSessionCount } from './utils/statistics'
import { audioService } from './utils/audio'

// Delay before showing narrator after an action (let user see animation)
const NARRATION_DELAY = 800

function App() {
  const {
    state,
    startNewHand,
    handlePlayerAction,
    isBettingComplete,
    startPhaseAdvance,
    advancePhase,
    determineWinner,
    resetForNextHand,
    setPendingEvent,
    addActionHistory,
    setWaitingForNext,
    setMode,
    setDifficulty,
    restartGame,
  } = useGameState()

  const [showFoldConfirm, setShowFoldConfirm] = useState(false)
  const [modeSelected, setModeSelected] = useState(false)
  const hasShownHandStart = useRef(false)
  const isProcessingAI = useRef(false)
  const lastPhaseRef = useRef<string>('')
  const userActionTimestamp = useRef<number>(0)

  // Check if hand has been dealt
  const hasCards = state.players.some(p => p.holeCards.length > 0)

  // Enable sound effects when mode is selected
  useSoundEffects(state)

  // Track session start on mount
  useEffect(() => {
    trackSessionStart()
    incrementSessionCount()
  }, [])

  // Preload sound effects on mount
  useEffect(() => {
    audioService.preload()
  }, [])

  // Handle mode selection
  const handleModeSelect = (mode: 'tutorial' | 'training', difficulty: 'easy' | 'medium' | 'hard') => {
    setMode(mode)
    setDifficulty(difficulty)
    setModeSelected(true)
    trackModeSelection(mode)
  }

  // Helper to get AI hand strength for narration
  const getAIHandStrength = useCallback((playerId: string): number => {
    const player = state.players.find(p => p.id === playerId)
    if (!player || player.holeCards.length !== 2) return 0

    if (state.communityCards.length === 0) {
      const rankValues: Record<string, number> = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
        '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
      }
      const v1 = rankValues[player.holeCards[0].rank]
      const v2 = rankValues[player.holeCards[1].rank]
      if (v1 === v2) return Math.min(10, v1 / 2 + 3)
      return (v1 + v2) / 4
    }

    if (state.communityCards.length === 3) {
      const allCards = [...player.holeCards, ...state.communityCards]
      return evaluateHand(allCards).rank
    } else if (state.communityCards.length === 4) {
      const allCards = [...player.holeCards, ...state.communityCards]
      return getBestHandFromSix(allCards).rank
    } else if (state.communityCards.length === 5) {
      return getBestFiveCardHand(player.holeCards, state.communityCards).rank
    }

    return 0
  }, [state.players, state.communityCards])

  // Helper to evaluate current hand strength
  const evaluateCurrentHandStrength = useCallback((): 'weak' | 'medium' | 'strong' => {
    const userPlayer = state.players.find(p => p.isUser)
    if (!userPlayer || userPlayer.holeCards.length === 0) return 'weak'

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

    let evaluation
    const totalCards = userPlayer.holeCards.length + state.communityCards.length

    if (totalCards === 7) {
      evaluation = getBestFiveCardHand(userPlayer.holeCards, state.communityCards)
    } else if (totalCards === 6) {
      const allCards = [...userPlayer.holeCards, ...state.communityCards]
      evaluation = getBestHandFromSix(allCards)
    } else if (totalCards === 5) {
      const allCards = [...userPlayer.holeCards, ...state.communityCards]
      evaluation = evaluateHand(allCards)
    } else {
      return 'weak'
    }

    return evaluateHandStrength(evaluation)
  }, [state.players, state.communityCards])

  // Check active players
  const getActivePlayers = useCallback(() => {
    return state.players.filter(p => !p.isFolded)
  }, [state.players])


  // Effect: Show hand start narration
  useEffect(() => {
    if (hasCards && !hasShownHandStart.current) {
      hasShownHandStart.current = true

      const dealerIdx = state.dealerPosition
      const sbIdx = (dealerIdx + 1) % state.players.length
      const bbIdx = (dealerIdx + 2) % state.players.length

      const dealerName = state.players[dealerIdx]?.name || 'Dealer'
      const sbName = state.players[sbIdx]?.name || 'Small Blind'
      const bbName = state.players[bbIdx]?.name || 'Big Blind'

      const message = generateHandStartNarration(
        dealerName,
        sbName,
        bbName,
        state.smallBlind,
        state.bigBlind
      )

      setPendingEvent({
        type: 'hand_start',
        message,
      })

      // Track hand start
      trackHandStart()
    }
  }, [hasCards, state.dealerPosition, state.players, state.smallBlind, state.bigBlind, setPendingEvent])

  // Effect: Handle AI turns and phase transitions
  useEffect(() => {
    // Don't run if game not started, already processing, or hand complete
    if (!hasCards || isProcessingAI.current || state.isHandComplete) {
      return
    }

    const currentPlayer = state.players[state.currentPlayerIndex]

    // Check for single player remaining
    const activePlayers = getActivePlayers()
    if (activePlayers.length === 1) {
      determineWinner()
      return
    }

    // Check if betting round is complete - need to advance phase
    if (!state.isAdvancingPhase && isBettingComplete()) {
      isProcessingAI.current = true
      startPhaseAdvance()

      // Advance phase first (deal cards), then show narration
      setTimeout(() => {
        const nextPhase =
          state.currentPhase === 'pre-flop' ? 'flop' :
          state.currentPhase === 'flop' ? 'turn' :
          state.currentPhase === 'turn' ? 'river' : 'showdown'

        advancePhase()

        // After cards are dealt, show narration
        setTimeout(() => {
          if (nextPhase === 'showdown') {
            setPendingEvent({
              type: 'showdown',
              message: generateShowdownNarration(),
            })
          } else {
            const phaseMessages: Record<string, string> = {
              'flop': "Three cards on the board! Take a look at what we're workin' with, partner.",
              'turn': "The turn card is here! One more to come after this.",
              'river': "And there's the river! This is it - make your move!",
            }
            setPendingEvent({
              type: 'phase_advance',
              message: phaseMessages[nextPhase] || "New cards on the table!",
            })
            // Require user to click Next before continuing
            setWaitingForNext(true)
          }
          isProcessingAI.current = false
        }, NARRATION_DELAY)
      }, 100)

      return
    }

    // If it's an AI player's turn and we're not already waiting for user to click Next
    if (currentPlayer && !currentPlayer.isUser && !currentPlayer.isFolded && !currentPlayer.isAllIn && !state.isWaitingForNextAction) {
      isProcessingAI.current = true

      // Calculate delay based on game phase (longer in later rounds)
      let baseDelay = TIMING.AI_TURN_BASE_DELAY
      if (state.currentPhase === 'turn' || state.currentPhase === 'river') {
        baseDelay += TIMING.AI_TURN_LATE_DELAY
      }
      const randomDelay = Math.random() * TIMING.AI_TURN_RANDOM_DELAY
      let thinkingDelay = baseDelay + randomDelay

      // Add extra delay if this follows a user action (to allow reading cowboy message)
      const timeSinceUserAction = Date.now() - userActionTimestamp.current
      if (timeSinceUserAction < TIMING.USER_ACTION_DELAY) {
        thinkingDelay += TIMING.USER_ACTION_DELAY - timeSinceUserAction
      }

      setTimeout(() => {
        // Calculate decision but DON'T execute yet - wait for user to click Next
        const decision = makeAIDecision(currentPlayer, state)
        const handStrength = getAIHandStrength(currentPlayer.id)

        const narration = generateAIActionNarration(
          currentPlayer,
          decision.action,
          decision.amount,
          state,
          handStrength
        )

        // Show narration with pending action stored
        setPendingEvent({
          type: 'ai_action',
          message: narration.message,
          playerName: currentPlayer.name,
          action: decision.action,
          reasoning: narration.reasoning,
          pendingAction: {
            playerId: currentPlayer.id,
            action: decision.action,
            amount: decision.amount,
          },
        })

        // Set waiting state so user must click Next
        setWaitingForNext(true)
        isProcessingAI.current = false
      }, thinkingDelay)

      return
    }

    // If it's the user's turn, show advice only in tutorial mode
    if (currentPlayer && currentPlayer.isUser && !currentPlayer.isFolded && !currentPlayer.isAllIn) {
      const userPlayer = state.players.find(p => p.isUser)
      if (userPlayer && state.mode === 'tutorial') {
        const turnNarration = generateUserTurnNarration(userPlayer, state)
        setPendingEvent({
          type: 'user_turn',
          message: turnNarration.message,
          handStrength: turnNarration.handStrength,
          advice: turnNarration.advice,
        })
      }
    }
  }, [
    hasCards,
    state.isHandComplete,
    state.isAdvancingPhase,
    state.isWaitingForNextAction,
    state.currentPhase,
    state.currentPlayerIndex,
    state.players,
    state.currentBet,
    state.pot,
    getActivePlayers,
    getAIHandStrength,
    isBettingComplete,
    startPhaseAdvance,
    advancePhase,
    handlePlayerAction,
    setPendingEvent,
    setWaitingForNext,
    determineWinner,
  ])

  // Effect: Handle showdown
  useEffect(() => {
    if (state.currentPhase === 'showdown' && !state.isHandComplete) {
      const timer = setTimeout(() => {
        determineWinner()
      }, TIMING.SHOWDOWN_REVEAL_DELAY)
      return () => clearTimeout(timer)
    }
  }, [state.currentPhase, state.isHandComplete, determineWinner])

  // Reset flags when hand ends
  useEffect(() => {
    if (!hasCards) {
      hasShownHandStart.current = false
      isProcessingAI.current = false
      lastPhaseRef.current = ''
      userActionTimestamp.current = 0
    }
  }, [hasCards])

  // User action handlers
  const handleFold = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer) {
      const strength = evaluateCurrentHandStrength()

      if (strength === 'medium' || strength === 'strong') {
        setShowFoldConfirm(true)
      } else {
        handlePlayerAction(userPlayer.id, 'fold')
        addActionHistory({
          playerName: userPlayer.name,
          playerId: userPlayer.id,
          action: 'fold',
          phase: state.currentPhase,
          potAfter: state.pot,
          isUser: true,
        })
        trackUserAction('fold', state.currentPhase)
        setTimeout(() => {
          setPendingEvent({
            type: 'user_action',
            message: generateUserActionNarration('fold'),
            action: 'fold',
          })
          userActionTimestamp.current = Date.now()
        }, NARRATION_DELAY)
      }
    }
  }

  const confirmFold = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer) {
      handlePlayerAction(userPlayer.id, 'fold')
      addActionHistory({
        playerName: userPlayer.name,
        playerId: userPlayer.id,
        action: 'fold',
        phase: state.currentPhase,
        potAfter: state.pot,
        isUser: true,
      })
      trackUserAction('fold', state.currentPhase)
      setTimeout(() => {
        setPendingEvent({
          type: 'user_action',
          message: generateUserActionNarration('fold'),
          action: 'fold',
        })
        userActionTimestamp.current = Date.now()
      }, NARRATION_DELAY)
    }
    setShowFoldConfirm(false)
  }

  const cancelFold = () => {
    setShowFoldConfirm(false)
  }

  const handleCall = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer) {
      const amountToCall = state.currentBet - userPlayer.currentBet
      const action = amountToCall === 0 ? 'check' : 'call'

      handlePlayerAction(userPlayer.id, action)
      addActionHistory({
        playerName: userPlayer.name,
        playerId: userPlayer.id,
        action,
        amount: amountToCall > 0 ? amountToCall : undefined,
        phase: state.currentPhase,
        potAfter: state.pot + amountToCall,
        isUser: true,
      })
      trackUserAction(action, state.currentPhase, amountToCall > 0 ? amountToCall : undefined)

      setTimeout(() => {
        setPendingEvent({
          type: 'user_action',
          message: generateUserActionNarration(action),
          action,
        })
        userActionTimestamp.current = Date.now()
      }, NARRATION_DELAY)
    }
  }

  const handleRaise = (customAmount?: number) => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer) {
      // Use custom amount if provided, otherwise use default minimum raise
      const raiseAmount = customAmount !== undefined ? customAmount : (state.currentBet + state.bigBlind)
      const additionalChips = raiseAmount - userPlayer.currentBet

      handlePlayerAction(userPlayer.id, 'raise', raiseAmount)
      addActionHistory({
        playerName: userPlayer.name,
        playerId: userPlayer.id,
        action: 'raise',
        amount: raiseAmount,
        phase: state.currentPhase,
        potAfter: state.pot + additionalChips,
        isUser: true,
      })
      trackUserAction('raise', state.currentPhase, raiseAmount)

      setTimeout(() => {
        setPendingEvent({
          type: 'user_action',
          message: generateUserActionNarration('raise', raiseAmount),
          action: 'raise',
        })
        userActionTimestamp.current = Date.now()
      }, NARRATION_DELAY)
    }
  }

  const handleStartNewHand = () => {
    hasShownHandStart.current = false
    isProcessingAI.current = false
    lastPhaseRef.current = ''
    startNewHand()
  }

  const handleNextHand = () => {
    const userPlayer = state.players.find(p => p.isUser)

    if (userPlayer && userPlayer.chips === 0) {
      handleStartNewHand()
      return
    }

    resetForNextHand()
    hasShownHandStart.current = false
    isProcessingAI.current = false
    lastPhaseRef.current = ''

    setTimeout(() => {
      startNewHand()
    }, TIMING.NEW_HAND_DELAY)
  }

  const handlePlayAgain = () => {
    restartGame()
    hasShownHandStart.current = false
    isProcessingAI.current = false
    lastPhaseRef.current = ''
    userActionTimestamp.current = 0
  }

  // Handle "Next" button click in tutorial mode - executes the pending AI action
  const handleNext = () => {
    const pendingAction = state.pendingEvent?.pendingAction
    if (!pendingAction) {
      // No pending action, just clear waiting state (e.g., for phase transitions)
      setWaitingForNext(false)
      return
    }

    const { playerId, action, amount } = pendingAction
    const player = state.players.find(p => p.id === playerId)

    if (player) {
      // Execute the action
      handlePlayerAction(playerId, action, amount)

      // Record in action history
      const amountForHistory = action === 'call'
        ? state.currentBet - player.currentBet
        : amount

      addActionHistory({
        playerName: player.name,
        playerId: player.id,
        action,
        amount: amountForHistory,
        phase: state.currentPhase,
        potAfter: state.pot + (amountForHistory || 0),
        isUser: player.isUser,
      })
    }

    // Clear waiting state so game can continue
    setWaitingForNext(false)
  }

  // Show mode selection if not yet selected
  if (!modeSelected) {
    return (
      <>
        <MusicPlayer gameStarted={false} />
        <ModeSelection onSelectMode={handleModeSelect} />
      </>
    )
  }

  if (!hasCards) {
    // After mode selection, show loading/waiting screen before first hand
    return (
      <>
        <MusicPlayer gameStarted={false} />
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

          <div className="text-center relative z-10">
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-gold-400/50 text-4xl">★</div>
              <div className="text-gold-500/60 text-5xl">★</div>
              <div className="text-gold-400/50 text-4xl">★</div>
            </div>

            <div className="text-6xl mb-6">🐴</div>

            <p className="text-gold-400 text-xl font-display font-bold mb-8 tracking-wide">
              {state.mode === 'tutorial' ? 'Starting Tutorial Mode...' : 'Starting Play Mode...'}
            </p>

            <button
              onClick={handleStartNewHand}
              aria-label="Deal first hand"
              className="bg-gradient-to-b from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-wood-900 font-body font-bold py-4 px-10 rounded-lg text-xl shadow-xl transition-all hover:scale-105 active:scale-95 border-4 border-gold-600"
              style={{
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
              }}
            >
              Deal Hand
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MusicPlayer gameStarted={true} />
      <PokerTable gameState={state} />
      <CowboyPanel
        gameState={state}
        narratorEvent={state.pendingEvent}
        onFold={handleFold}
        onCall={handleCall}
        onRaise={handleRaise}
        onNext={handleNext}
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
      {state.isGameOver && state.gameWinner && (
        <GameOverScreen
          winner={{
            name: state.gameWinner.name,
            chips: state.gameWinner.chips,
            isUser: state.gameWinner.isUser,
          }}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  )
}

export default App
