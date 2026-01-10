/**
 * Component render tests.
 * Tests that components render without crashing and display expected content.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';
import { PotDisplay } from './PotDisplay';
import { ActionButtons } from './ActionButtons';
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
    isHandComplete: false,
    winners: [],
    winningHands: [],
    isAdvancingPhase: false,
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

    fireEvent.click(screen.getByText(/Raise/));
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
