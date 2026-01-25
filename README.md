# Poker Pardner - Texas Hold'em Tutorial App

An interactive web application that teaches complete beginners how to play Texas Hold'em poker through guided practice play. Built with React, TypeScript, and Tailwind CSS with a classic Western saloon theme.

## Features

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

### Audio
- **Background Music** - Optional looping background music with play/pause control (top-left corner)

## Game Configuration

- **Players**: 4 total (1 user + 3 AI)
- **Starting chips**: $100 per player
- **Blinds**: $5 small blind, $10 big blind
- **Betting**: Minimum raise only (currentBet + bigBlind)
- **End conditions**: User goes broke (game ends) or AI eliminated (game continues)

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

The project includes comprehensive test coverage with 167+ passing tests.

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling framework
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities

## Roadmap

Potential future enhancements:
- Side pot calculation (multiple all-ins)
- Custom raise amounts (slider/input)
- Play Mode (no guidance)
- Variable AI difficulty
- Progress tracking & statistics
- Sound effects
- Hand history review
- Multiplayer features

## Architecture

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

Contributions are welcome! This is an educational project designed to help beginners learn Texas Hold'em poker. Feel free to open issues for bugs or feature requests, and submit pull requests for improvements.

## License

MIT
