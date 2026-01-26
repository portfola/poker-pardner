# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive web application that teaches complete beginners how to play Texas Hold'em poker through guided practice play. Users learn by playing real poker hands with contextual strategic advice and explanations provided throughout gameplay. Features an Old West saloon aesthetic with a cowboy narrator.

## Architecture

### Game Mode
- **Practice Mode with Guidance**: Unlimited randomly-generated hands with full strategic guidance
  - Real-time hand strength analysis
  - Strategic advice at every decision point
  - Cowboy narrator explaining what's happening
  - Step-by-step tutorial mode with "Next" button for AI actions
  - Action history log for current hand
  - Hand ranking reference guide
  - Learning through experience with safety net of constant help

### Core Systems

**Game State Management**
- Uses React's useReducer for complex state management
- Tracks: dealer position, blinds, pot, community cards, betting rounds, active players
- Handles phase transitions: pre-flop → flop → turn → river → showdown
- Manages player actions, eliminations, and hand resets
- 14 action types for comprehensive state control

**Hand Evaluation**
- Evaluates 5-7 card combinations to determine best 5-card hand
- Handles all hand rankings from high card to royal flush
- Compares hands with proper kicker evaluation
- Critical edge cases: ace-low straights, split pots
- Side pots deferred to Phase 2

**AI Decision Engine**
- Basic, predictable strategy suitable for educational purposes
- Decisions based on hand strength, position, pot odds
- 10-20% randomness to avoid robotic behavior
- Delays (1000-2000ms) for natural pacing

**Betting System**
- Tracks current bet, amount to call, minimum raise
- Phase 1 uses minimum raise only (currentBet + bigBlind)
- Handles all-in scenarios (side pots deferred to Phase 2)
- Validates all actions before processing

### Component Structure

**Main Table View**
- PokerTable: Green felt layout with 4 player positions
- PlayerPosition: Shows name, chips, hole cards, dealer button, folded state
- CommunityCards: Center area for 5 community cards
- PotDisplay: Current pot amount
- Card: Animated component with deal/flip animations

**Cowboy Panel** (non-blocking sidebar)
- Cowboy narrator with personality-filled event narration
- StrategicAdvice: Hand strength analysis and recommendations
- ActionButtons: Fold, Call, Raise (with dynamic labeling)
- ActionHistory: Chronological log of actions in current hand
- HandRankings: Reference guide for poker hand rankings

**Supporting Components**
- ShowdownDisplay: Winner announcement (wanted poster style)
- MusicPlayer: Background music with play/pause control
- ConfirmDialog: Confirmation modals (e.g., fold confirmation)
- ErrorBoundary: Graceful error handling

## Game Configuration

**Players**: 4 total (1 user + 3 AI)
**Starting chips**: $100 per player
**Blinds**: $5 small blind, $10 big blind
**End conditions**: User goes broke (game ends) or AI eliminated (game continues)

## Development Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run all tests
npm test:ui          # Run tests with UI
npm test -- handEvaluator.test.ts    # Run specific test file
```

## File Organization

```
/src
  /components       # React UI components (18 files)
    PokerTable.tsx       # Main table layout
    CowboyPanel.tsx      # Narrator + action buttons sidebar
    PlayerPosition.tsx   # Individual player display
    Card.tsx             # Animated playing card
    ActionButtons.tsx    # Fold/Call/Raise buttons
    StrategicAdvice.tsx  # Hand strength and advice
    CommunityCards.tsx   # Community cards display
    PotDisplay.tsx       # Pot amount display
    ShowdownDisplay.tsx  # Winner announcement
    ActionHistory.tsx    # Action log modal
    HandRankings.tsx     # Hand ranking reference
    Sidebar.tsx          # Responsive sidebar container
    MusicPlayer.tsx      # Background music control
    ConfirmDialog.tsx    # Confirmation modal
    ErrorBoundary.tsx    # Error boundary
    GameStateDisplay.tsx # Game state info
    ActionNarration.tsx  # Action narration
  /hooks             # Custom React hooks
    useGameState.ts      # Game state management (629 lines)
  /utils             # Pure utility functions
    handEvaluator.ts     # Hand ranking logic (352 lines)
    handStrength.ts      # Hand strength descriptions
    ai.ts                # AI decision engine
    cards.ts             # Card & deck utilities
    cowboyNarration.ts   # Cowboy narrator text generation
    logger.ts            # Development logging utility
  /types             # TypeScript type definitions
    game.ts              # All game types (230 lines)
  /constants         # Game constants
    cards.ts             # Card ranks, suits, symbols
    ai.ts                # AI decision thresholds
    timing.ts            # Animation timing constants
```

## Key Implementation Details

### Animation Timing (from constants/timing.ts)
- AI turn base delay: 1000ms
- AI turn random delay: 0-1000ms additional
- Betting complete delay: 500ms
- Phase advance delay: 1000ms
- Showdown reveal delay: 1500ms
- New hand delay: 500ms

### Hand Evaluation Algorithm
Must handle:
- Ace-low straights (A-2-3-4-5)
- Kicker comparison when main hands tie
- Multiple players with identical hands (split pot)
- Best 5-card selection from 7 available cards
- Proper ranking: royal flush > straight flush > four of a kind > full house > flush > straight > three of a kind > two pair > pair > high card

### State Machine Flow
1. Start new hand → post blinds → deal hole cards
2. Pre-flop betting round → action starts left of big blind
3. Deal flop (3 cards) → betting round → action starts left of dealer
4. Deal turn (1 card) → betting round
5. Deal river (1 card) → betting round
6. Showdown → reveal hands → determine winner → award pot
7. Rotate dealer → eliminate broke players → repeat

## Current Scope

**Implemented**:
- Practice mode with full guidance
- Step-by-step tutorial mode with "Next" button for AI actions
- Cowboy-themed narrator panel (non-blocking sidebar)
- Action history log for current hand
- Hand ranking reference guide
- Basic AI strategy (no personalities)
- Minimum raise only (no custom amounts)
- Desktop primary, mobile-friendly responsive design
- Background music with play/pause control
- Error boundary and accessibility features
- Old West saloon aesthetic throughout
- Comprehensive test coverage (187 tests)

**Out of scope**:
- Play Mode (no guidance)
- Variable AI difficulty
- Progress tracking/statistics
- Custom raise amounts
- Side pot calculation with multiple all-ins
- Sound effects (only background music)
- Multiplayer features
- User accounts/persistence
- Hand history review between sessions

## Testing Requirements

**Critical test scenarios**:
- All-in when player can't cover bet
- Player elimination and dealer button rotation
- Betting round completion with folded players
- Split pots (identical hands)
- All hand rankings correctly evaluated
- Hand evaluation with 6 and 7 cards
- AI decision making across various situations
- Component rendering and user interactions

**Current Test Coverage**: 187 tests passing across 6 test files
- utils/cards.test.ts: 24 tests
- utils/handEvaluator.test.ts: 53 tests
- utils/handStrength.test.ts: 29 tests
- utils/ai.test.ts: 14 tests
- hooks/useGameState.test.tsx: 46 tests
- components/components.test.tsx: 21 tests

**Deferred to future**:
- Side pots with multiple all-ins at different amounts

## Code Quality Expectations

- TypeScript strict mode enabled
- All game logic pure functions where possible
- Comprehensive JSDoc comments for complex algorithms
- Logger utility for debugging (disabled in production)
- TypeScript interfaces for all components
- Separate concerns: UI components vs game logic vs AI strategy

## References

- Full specification: `specs/spec.md`
- Development plan: `specs/plan.md`
- Edge cases tested: `specs/edge_cases_tested.md`
- Deployment guide: `DEPLOY.md`
- Asset requirements: `ASSETS_TODO.md`
