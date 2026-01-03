# Poker Pardner - Texas Hold'em Tutorial App

An interactive web application that teaches complete beginners how to play Texas Hold'em poker through guided practice play. Built with React, TypeScript, and Tailwind CSS with a classic Western saloon theme.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to the URL shown (typically http://localhost:5173)

### Build

```bash
npm run build
```

### Testing

```bash
npm test          # Run tests
npm run test:ui   # Run tests with UI
```

**Current Test Coverage: 103 tests passing ✓**

## Project Status

### Phase 1: Core Gameplay - ✅ COMPLETE

The application is **fully functional and playable** with:
- Complete poker game mechanics (betting rounds, phase transitions, showdown)
- 4-player games with realistic AI opponents
- Beautiful Western-themed UI with animations
- Real-time hand strength analysis and strategic advice
- Accessible keyboard navigation and screen reader support
- Production-ready error handling and logging

## Features Implemented

### Core Game Systems
- **Game State Management** - React useReducer for complex state handling
- **Hand Evaluation** - Bulletproof algorithm handling all poker hands including edge cases (ace-low straights, kickers)
- **AI Decision Engine** - Basic strategic AI with 10-20% randomness for natural play
- **Betting System** - Complete betting rounds with validation, all-in handling
- **Phase Transitions** - Smooth progression through pre-flop → flop → turn → river → showdown

### User Interface
- **Poker Table** - Professional green felt layout with 4 player positions
- **Card Component** - Animated cards with deal/flip animations, face-up/face-down states
- **Action Buttons** - Dynamic Fold/Call/Raise buttons with smart labeling
- **Sidebar Panel** - Real-time game state, action narration, and strategic advice
- **Showdown Display** - Winner announcement with hand comparison
- **Error Boundary** - Western-themed error screen with restart capability

### Visual Polish
- **Western Theme** - Saloon-style design with wood, gold, and felt color palette
- **Animations** - Card dealing, chip movements, phase transitions (CSS transforms)
- **Custom Fonts** - Rye (display), Roboto Slab (body), Alfa Slab One (accent)
- **Responsive States** - Visual indicators for folded, all-in, current turn
- **Accessibility** - ARIA labels, focus indicators, keyboard navigation

## Game Configuration

- **Players**: 4 total (1 user + 3 AI)
- **Starting chips**: $100 per player
- **Blinds**: $5 small blind, $10 big blind
- **Betting**: Minimum raise only (currentBet + bigBlind)
- **End conditions**: User goes broke (game ends) or AI eliminated (game continues)

## Development Plans

### Completed

**From prompt_plan_1.md (Steps 1-16):**
- ✅ Steps 1-8: Project setup, types, utilities, UI components, animations
- ✅ Steps 9-11: Sidebar, hand strength display, AI engine
- ✅ Steps 12-14: Betting rounds, phase transitions, showdown
- ✅ Step 15: Game over screen
- ✅ Step 16: Visual polish and animations

**From prompt_plan_2.md (All 12 tasks):**
- ✅ Type safety improvements
- ✅ Dead code removal
- ✅ Logging utility
- ✅ Error handling standardization
- ✅ Magic number extraction
- ✅ Code duplication elimination
- ✅ Accessibility improvements
- ✅ Error boundary
- ✅ Tailwind CSS conversion

**From prompt_plan_3.md:**
- ✅ Sprint 1: Stability fixes (phase advancement, memory leaks, constants)
- ✅ Sprint 2: Code quality (logging, error handling, type safety, dead code)
- ✅ Sprint 4: Polish (error boundary, accessibility, CSS conversion)

### Remaining Work

**Testing (prompt_plan_3.md Sprint 3):**
- ⏳ Add AI decision tests (src/utils/ai.test.ts)
- ⏳ Add hand strength utility tests (src/utils/handStrength.test.ts)
- ⏳ Add component render tests (src/components/components.test.tsx)

**Responsive Design (prompt_plan_1.md Step 17):**
- ⏳ Tablet optimization (768px - 1199px)
- ⏳ Mobile optimization (< 768px)
- ⏳ Touch-friendly action buttons
- ⏳ Collapsible sidebar for small screens

**Deployment Preparation (prompt_plan_1.md Steps 18-21):**
- ⏳ Edge case testing and bug fixes
- ⏳ User experience refinements
- ⏳ Final integration testing
- ⏳ Production deployment setup

### Future Enhancements (Phase 2)

Items deferred for future development:
- Side pot calculation (multiple all-ins)
- Custom raise amounts (slider/input)
- Play Mode (no guidance)
- Variable AI difficulty
- Progress tracking & statistics
- Sound effects
- Hand history review
- Multiplayer features

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling framework
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities

## Architecture Highlights

### State Management
Uses React's `useReducer` for complex game state with well-defined actions:
- `START_NEW_HAND` - Initialize new hand with blinds and cards
- `PLAYER_ACTION` - Handle fold/call/raise actions
- `START_PHASE_ADVANCE` / `ADVANCE_PHASE` - Manage phase transitions
- `DETERMINE_WINNER` - Evaluate hands and award pot
- `RESET_FOR_NEXT_HAND` - Rotate dealer and eliminate broke players

### Hand Evaluation
Comprehensive algorithm handling:
- All hand rankings (Royal Flush → High Card)
- Best 5-card selection from 7 cards (21 combinations)
- Best 5-card selection from 6 cards (6 combinations)
- Kicker comparison for tied hands
- Ace-low straights ("wheel")
- Proper ordering and comparison

### AI Strategy
Educational AI with predictable but varied play:
- Hand strength evaluation (pre-flop through river)
- Position-aware decisions
- Pot odds consideration
- 10-20% randomness to avoid robotic behavior
- Configurable thresholds (fold < 2, call ≥ 4, raise ≥ 6)

## Contributing

This is an educational project following a structured development plan. See the prompt plan documents for planned improvements and current status.

## License

MIT
