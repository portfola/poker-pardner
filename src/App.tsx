import './App.css'
import { useState, useEffect, useRef } from 'react'
import { useGameState } from './hooks/useGameState'
import { PokerTable } from './components/PokerTable'
import { GameNarration } from './components/GameNarration'
import { makeAIDecision } from './utils/ai'

function App() {
  const { state, startNewHand, handlePlayerAction, isBettingComplete, advancePhase } = useGameState()
  const [narrationMessages, setNarrationMessages] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const processingRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)

  // Check if hand has been dealt
  const hasCards = state.players.some(p => p.holeCards.length > 0)

  // Add narration message
  const addNarration = (message: string) => {
    setNarrationMessages(prev => [...prev, message])
  }

  // Action handlers for user
  const handleFold = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer && !isProcessing) {
      handlePlayerAction(userPlayer.id, 'fold')
      addNarration(`You folded.`)
    }
  }

  const handleCall = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer && !isProcessing) {
      const amountToCall = state.currentBet - userPlayer.currentBet
      if (amountToCall === 0) {
        handlePlayerAction(userPlayer.id, 'check')
        addNarration(`You checked.`)
      } else {
        handlePlayerAction(userPlayer.id, 'call')
        addNarration(`You called $${amountToCall}.`)
      }
    }
  }

  const handleRaise = () => {
    const userPlayer = state.players.find(p => p.isUser)
    if (userPlayer && !isProcessing) {
      // For Phase 1, use minimum raise (currentBet + bigBlind)
      const raiseAmount = state.currentBet + state.bigBlind
      handlePlayerAction(userPlayer.id, 'raise', raiseAmount)
      addNarration(`You raised to $${raiseAmount}.`)
    }
  }

  // Custom start handler with narration
  const handleStartNewHand = () => {
    setNarrationMessages([])
    startNewHand()

    // Add initial narration after state updates
    setTimeout(() => {
      const smallBlindPos = (state.dealerPosition + 1) % state.players.length
      const bigBlindPos = (state.dealerPosition + 2) % state.players.length
      const firstToAct = (bigBlindPos + 1) % state.players.length

      addNarration(`New hand started!`)
      addNarration(`${state.players[smallBlindPos]?.name} posts small blind $5.`)
      addNarration(`${state.players[bigBlindPos]?.name} posts big blind $10.`)
      addNarration(`Cards dealt. ${state.players[firstToAct]?.name} to act first.`)
    }, 500)
  }

  // AI automation with delays
  useEffect(() => {
    // Only run if game has actually started
    if (!hasCards) {
      return
    }

    console.log('AI Effect triggered:', {
      processingRef: processingRef.current,
      isProcessing,
      currentPlayerIndex: state.currentPlayerIndex,
      currentPlayer: state.players[state.currentPlayerIndex]?.name,
      isUser: state.players[state.currentPlayerIndex]?.isUser,
      hasCards,
      isHandComplete: state.isHandComplete
    })

    // Prevent multiple simultaneous processes
    if (processingRef.current) {
      console.log('Skipping - already processing (ref)')
      return
    }

    const currentPlayer = state.players[state.currentPlayerIndex]

    // Check if betting round is complete
    if (!state.isHandComplete && isBettingComplete()) {
      console.log('Betting round complete, advancing phase')
      processingRef.current = true
      setIsProcessing(true)

      timeoutRef.current = window.setTimeout(() => {
        addNarration('Betting round complete.')
        timeoutRef.current = window.setTimeout(() => {
          advancePhase()
          const phaseNames: Record<string, string> = {
            'flop': 'Dealing the flop...',
            'turn': 'Dealing the turn...',
            'river': 'Dealing the river...',
            'showdown': 'Showdown!'
          }
          if (state.currentPhase !== 'pre-flop') {
            addNarration(phaseNames[state.currentPhase] || 'Next phase...')
          }
          processingRef.current = false
          setIsProcessing(false)
        }, 1000)
      }, 500)
      return
    }

    // Only process if it's an AI player's turn
    if (!currentPlayer || currentPlayer.isUser || state.isHandComplete) {
      console.log('Not AI turn or hand complete')
      return
    }

    console.log('Starting AI action for:', currentPlayer.name)

    // Mark as processing
    processingRef.current = true
    setIsProcessing(true)

    // Delay before AI acts (1-2 seconds for realism)
    const delay = 1000 + Math.random() * 1000

    timeoutRef.current = window.setTimeout(() => {
      console.log('Executing AI action for:', currentPlayer.name)

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

      addNarration(narration)
      console.log('AI action:', decision.action, decision.amount)

      // Execute the action
      handlePlayerAction(currentPlayer.id, decision.action, decision.amount)

      // Mark processing complete after action
      setTimeout(() => {
        processingRef.current = false
        setIsProcessing(false)
      }, 300)
    }, delay)

    // Cleanup - don't clear timeout as it's managed by ref
    return () => {
      // Don't clear the timeout here - let it complete
    }
  }, [state.currentPlayerIndex, state.players, state.currentPhase, state.isHandComplete, hasCards])

  if (!hasCards) {
    // Welcome screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            Poker Pal
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Learn Texas Hold'em from the ground up
          </p>
          <button
            onClick={handleStartNewHand}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-all hover:scale-105"
          >
            Start Tutorial
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <GameNarration messages={narrationMessages} />
      <PokerTable
        gameState={state}
        onFold={handleFold}
        onCall={handleCall}
        onRaise={handleRaise}
      />
    </>
  )
}

export default App
