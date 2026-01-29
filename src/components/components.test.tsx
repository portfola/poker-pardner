/**
 * Component render tests.
 * Tests that components render without crashing and display expected content.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import { PotDisplay } from './PotDisplay';
import { ActionButtons } from './ActionButtons';
import { PlayerPosition } from './PlayerPosition';
import { GameState, Player, Card as CardType } from '../types/game';

// Helper to create a card
const c = (rank: CardType['rank'], suit: CardType['suit']): CardType => ({ rank, suit });

// Helper to create a minimal player
function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'user',
    name: 'You',
    chips: 100,
    holeCards: [],
    isFolded: false,
    isUser: true,
    position: 0,
    currentBet: 0,
    totalBet: 0,
    hasActed: false,
    isAllIn: false,
    ...overrides,
  };
}

// Helper to create a minimal game state
function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [createPlayer()],
    pot: 0,
    communityCards: [],
    currentPhase: 'pre-flop',
    dealerPosition: 0,
    currentPlayerIndex: 0,
    currentBet: 0,
    minRaise: 20,
    smallBlind: 5,
    bigBlind: 10,
    deck: [],
    mode: 'tutorial',
    difficulty: 'medium',
    isHandComplete: false,
    winners: [],
    winningHands: [],
    isAdvancingPhase: false,
    isWaitingForContinue: false,
    pendingEvent: null,
    actionHistory: [],
    isWaitingForNextAction: false,
    isGameOver: false,
    ...overrides,
  };
}

describe('Card component', () => {
  it('should render placeholder when no card provided', () => {
    render(<Card />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should render card back when faceUp is false', () => {
    render(<Card card={c('A', 'spades')} faceUp={false} />);
    // Card back shows a star
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('should render face-up card with rank and suit', () => {
    render(<Card card={c('A', 'spades')} faceUp={true} />);
    // Should show rank (appears twice - top-left and bottom-right)
    const ranks = screen.getAllByText('A');
    expect(ranks.length).toBeGreaterThanOrEqual(2);
    // Should show spade symbol (appears multiple times)
    const spades = screen.getAllByText('♠');
    expect(spades.length).toBeGreaterThanOrEqual(1);
  });

  it('should render hearts in red', () => {
    render(<Card card={c('K', 'hearts')} faceUp={true} />);
    const hearts = screen.getAllByText('♥');
    expect(hearts.length).toBeGreaterThanOrEqual(1);
  });

  it('should apply different size classes', () => {
    const { rerender, container } = render(<Card card={c('A', 'spades')} faceUp={true} size="small" />);
    expect(container.querySelector('.w-12')).toBeInTheDocument();

    rerender(<Card card={c('A', 'spades')} faceUp={true} size="large" />);
    expect(container.querySelector('.w-20')).toBeInTheDocument();
  });

  it('should render 10 correctly', () => {
    render(<Card card={c('10', 'diamonds')} faceUp={true} />);
    const tens = screen.getAllByText('10');
    expect(tens.length).toBeGreaterThanOrEqual(2);
  });
});

describe('PotDisplay component', () => {
  it('should display the pot amount', () => {
    render(<PotDisplay amount={100} />);
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('should display POT label', () => {
    render(<PotDisplay amount={50} />);
    expect(screen.getByText('POT')).toBeInTheDocument();
  });

  it('should display zero amount', () => {
    render(<PotDisplay amount={0} />);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('should apply awarding animation class when isAwarding is true', () => {
    const { container } = render(<PotDisplay amount={100} isAwarding={true} />);
    expect(container.querySelector('.scale-110')).toBeInTheDocument();
  });

  it('should not apply awarding animation class by default', () => {
    const { container } = render(<PotDisplay amount={100} />);
    expect(container.querySelector('.scale-110')).not.toBeInTheDocument();
  });

  it('should display large pot amounts with comma formatting', () => {
    render(<PotDisplay amount={10000} />);
    expect(screen.getByText('$10,000')).toBeInTheDocument();
  });

  it('should display very large pot amounts with comma formatting', () => {
    render(<PotDisplay amount={999999} />);
    expect(screen.getByText('$999,999')).toBeInTheDocument();
  });

  it('should display comma-separated thousands for readability', () => {
    render(<PotDisplay amount={50000} />);
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('should display amounts under 1000 without commas', () => {
    render(<PotDisplay amount={500} />);
    expect(screen.getByText('$500')).toBeInTheDocument();
  });
});

describe('ActionButtons component', () => {
  it('should render all three buttons', () => {
    const gameState = createGameState({
      players: [createPlayer({ isUser: true })],
      currentPlayerIndex: 0,
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    expect(screen.getByText('Fold')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument(); // No bet to call
    expect(screen.getByText(/Raise/)).toBeInTheDocument();
  });

  it('should show "Call $X" when there is a bet to call', () => {
    const gameState = createGameState({
      players: [createPlayer({ isUser: true, currentBet: 0 })],
      currentPlayerIndex: 0,
      currentBet: 20,
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    expect(screen.getByText('Call $20')).toBeInTheDocument();
  });

  it('should call onFold when Fold button is clicked', () => {
    const gameState = createGameState({
      players: [createPlayer({ isUser: true })],
      currentPlayerIndex: 0,
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    fireEvent.click(screen.getByText('Fold'));
    expect(onFold).toHaveBeenCalledTimes(1);
  });

  it('should call onCall when Call/Check button is clicked', () => {
    const gameState = createGameState({
      players: [createPlayer({ isUser: true })],
      currentPlayerIndex: 0,
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    fireEvent.click(screen.getByText('Check'));
    expect(onCall).toHaveBeenCalledTimes(1);
  });

  it('should call onRaise when Raise button is clicked', () => {
    const gameState = createGameState({
      players: [createPlayer({ isUser: true, chips: 100 })],
      currentPlayerIndex: 0,
      currentBet: 0,
      minRaise: 20,
      bigBlind: 10,
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    // First click shows the slider
    fireEvent.click(screen.getByText(/Raise/));
    expect(onRaise).toHaveBeenCalledTimes(0);

    // Second click confirms the raise
    fireEvent.click(screen.getByText(/Raise to \$/));
    expect(onRaise).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when not user turn', () => {
    const aiPlayer = createPlayer({ id: 'ai1', name: 'AI', isUser: false });
    const userPlayer = createPlayer({ isUser: true });
    const gameState = createGameState({
      players: [userPlayer, aiPlayer],
      currentPlayerIndex: 1, // AI's turn
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    // Buttons should be disabled
    expect(screen.getByText('Fold')).toBeDisabled();
    expect(screen.getByText('Check')).toBeDisabled();
    expect(screen.getByText(/Raise/)).toBeDisabled();
  });

  it('should show "Your turn to act" when it is user turn', () => {
    const gameState = createGameState({
      players: [createPlayer({ isUser: true })],
      currentPlayerIndex: 0,
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    expect(screen.getByText('Your turn to act')).toBeInTheDocument();
  });

  it('should show "Waiting for X..." when not user turn', () => {
    const aiPlayer = createPlayer({ id: 'ai1', name: 'Player 2', isUser: false });
    const userPlayer = createPlayer({ isUser: true });
    const gameState = createGameState({
      players: [userPlayer, aiPlayer],
      currentPlayerIndex: 1, // AI's turn
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    expect(screen.getByText('Waiting for Player 2...')).toBeInTheDocument();
  });

  it('should return null when no user player exists', () => {
    const gameState = createGameState({
      players: [createPlayer({ isUser: false })],
      currentPlayerIndex: 0,
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    const { container } = render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show All-In when player cannot afford minimum raise', () => {
    const gameState = createGameState({
      players: [createPlayer({ isUser: true, chips: 15 })],
      currentPlayerIndex: 0,
      currentBet: 10,
      minRaise: 20,
      bigBlind: 10,
    });
    const onFold = vi.fn();
    const onCall = vi.fn();
    const onRaise = vi.fn();

    render(
      <ActionButtons
        gameState={gameState}
        onFold={onFold}
        onCall={onCall}
        onRaise={onRaise}
      />
    );

    expect(screen.getByText('All-In')).toBeInTheDocument();
  });
});

describe('PlayerPosition component', () => {
  it('should render player name correctly', () => {
    const player = createPlayer({ name: 'Doc' });
    render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={false} />);
    expect(screen.getByText('Doc')).toBeInTheDocument();
  });

  it('should render long player names (10+ characters) without overflow', () => {
    const player = createPlayer({ name: 'Christopher' }); // 11 characters
    const { container: _container } = render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={false} />);
    expect(screen.getByText('Christopher')).toBeInTheDocument();

    // Name should be in a div with text-center class to ensure centering
    const nameElement = screen.getByText('Christopher');
    expect(nameElement).toHaveClass('text-center');
  });

  it('should render very long player names (15+ characters) without overflow', () => {
    const player = createPlayer({ name: 'WildBillHickok' }); // 15 characters
    const { container: _container } = render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={false} />);
    expect(screen.getByText('WildBillHickok')).toBeInTheDocument();
  });

  it('should render long player names in compact mode', () => {
    const player = createPlayer({ name: 'SheriffJones' }); // 12 characters
    render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={false} compact={true} />);
    expect(screen.getByText('SheriffJones')).toBeInTheDocument();
  });

  it('should render player with dealer button', () => {
    const player = createPlayer({ name: 'You' });
    render(<PlayerPosition player={player} isDealer={true} isCurrentTurn={false} />);
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('should highlight player on their turn', () => {
    const player = createPlayer({ name: 'You' });
    const { container } = render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={true} />);
    // Should have gold border when it's their turn
    expect(container.querySelector('.border-gold-500')).toBeInTheDocument();
  });

  it('should show folded state', () => {
    const player = createPlayer({ name: 'You', isFolded: true });
    render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={false} />);
    expect(screen.getByText('FOLDED')).toBeInTheDocument();
  });

  it('should show all-in state', () => {
    const player = createPlayer({ name: 'You', isAllIn: true });
    render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={false} />);
    expect(screen.getByText('ALL IN')).toBeInTheDocument();
  });

  it('should show current bet', () => {
    const player = createPlayer({ name: 'You', currentBet: 50 });
    render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={false} />);
    expect(screen.getByText('Bet: $50')).toBeInTheDocument();
  });

  it('should display chips with appropriate color', () => {
    const player = createPlayer({ name: 'You', chips: 80 });
    const { container } = render(<PlayerPosition player={player} isDealer={false} isCurrentTurn={false} />);
    expect(screen.getByText('$80')).toBeInTheDocument();
    // Green for > 75 chips
    expect(container.querySelector('.text-green-400')).toBeInTheDocument();
  });
});
