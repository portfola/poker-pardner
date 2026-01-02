# Poker Pardner - Texas Hold'em Tutorial App

An interactive web application that teaches complete beginners how to play Texas Hold'em poker through guided tutorial hands followed by assisted practice play.

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

## Current Progress

### Completed (Steps 1-8)

✅ **Step 1: Project Setup**
- Vite + React + TypeScript
- Tailwind CSS for styling
- Clean folder structure

✅ **Step 2: Type Definitions**
- Complete TypeScript types for game entities
- Card, Player, GameState, HandEvaluation types

✅ **Step 3: Card Utilities**
- Deck creation and shuffling (Fisher-Yates)
- Card dealing and display
- 24 tests passing

✅ **Step 4: Hand Evaluation**
- Complete hand ranking algorithm
- Handles all poker hands (Royal Flush → High Card)
- Ace-low straight edge case handling
- Best 5-card selection from 7 cards
- 44 tests passing

✅ **Step 5: Game State Management**
- React useReducer for state management
- Betting rounds, phase transitions
- Blind posting, chip management
- Winner determination
- 26 tests passing

✅ **Step 6: Poker Table UI**
- Professional green felt table design
- 4 player positions with dealer button
- Community cards display
- Pot display
- Player info (name, chips, cards)
- Visual states (current turn, folded, all-in)

✅ **Step 7: Card Component with Animations**
- Standalone Card component with face-up/face-down states
- Three sizes: small, medium, large
- Deal animation (slides in from center)
- Flip animation (rotates from face-down to face-up)
- Card back design with pattern and suit symbols
- Smooth CSS transitions and hover effects
- Integrated into PlayerPosition and CommunityCards

✅ **Step 8: Action Buttons and Controls**
- ActionButtons component with Fold, Call/Check, Raise
- Dynamic button text based on game state
  - "Check" when no bet to call
  - "Call $X" with correct amount
  - "Raise to $X" with minimum raise amount
  - "All-In" when insufficient chips for raise
- Button states (enabled only on user's turn)
- Color-coded buttons:
  - Red for Fold
  - Green for Call/Check
  - Blue for Raise
- Hover effects and smooth transitions
- Connected to game state actions
- Turn indicator ("Your turn to act" / "Waiting for...")

**Total: 94 tests passing ✓**

## Project Structure

```
src/
├── components/      # React UI components
│   ├── PokerTable.tsx
│   ├── PlayerPosition.tsx
│   ├── CommunityCards.tsx
│   ├── PotDisplay.tsx
│   ├── ActionButtons.tsx
│   ├── Card.tsx
│   └── Card.css
├── hooks/          # Custom React hooks
│   └── useGameState.ts
├── utils/          # Pure utility functions
│   ├── cards.ts
│   └── handEvaluator.ts
├── types/          # TypeScript type definitions
│   └── game.ts
└── constants/      # Game constants
    └── cards.ts
```

## Next Steps

See `prompt_plan.md` for the complete build plan. Next steps include:

- Step 9: Sidebar Information Panel
- Step 10: Hand Strength Display Logic
- Step 11: Basic AI Decision Engine
- And more...

## Documentation

- `spec.md` - Full Phase 1 specification
- `prompt_plan.md` - Detailed 23-step build plan
- `CLAUDE.md` - Guide for Claude Code instances

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework
