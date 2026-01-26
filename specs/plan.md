# Poker Pardner - Development Roadmap

## Next Up
- [ ] Action log: blind recording - Ensure small blind and big blind are recorded as first actions in the history log
- [ ] Tutorial pacing: AI turns - Show "Next" button instead of Fold/Call/Raise when AI players act; wait for user click to advance
- [ ] Tutorial pacing: community cards - Pause on flop/turn/river introduction with cowboy explanation; require "Next" click to proceed
- [ ] AI player names - Give each AI player a unique Western-themed name; persist throughout game
- [ ] Relocate game phase indicator - Move "Turn"/"Flop" status box from between table and action panel into action panel, left side beneath cowboy avatar
- [ ] End of hand display - Replace modal with cowboy explanation in action panel; keep table visible so user can see final hands

## Backlog

### Play Mode (No Guidance)
- [ ] Home screen mode selection - Present choice between Tutorial (with guidance) and Play (no guidance)
- [ ] Play mode implementation - Hide strategic advice from cowboy; keep game state display

### Variable AI Difficulty
- [ ] Difficulty constants - Create `src/constants/difficulty.ts` with thresholds for Easy/Medium/Hard
- [ ] AI difficulty parameter - Modify `src/utils/ai.ts` to accept and use difficulty parameter
- [ ] Difficulty type definition - Add difficulty to GameState in `src/types/game.ts`
- [ ] Difficulty selection UI - Add difficulty selection to mode selection screen

### Progress Tracking & Statistics
- [ ] Statistics utility - Create `src/utils/statistics.ts` for tracking and localStorage persistence
- [ ] Statistics types - Create `src/types/statistics.ts` with type definitions
- [ ] Statistics screen - Create `src/components/StatisticsScreen.tsx` for stats display
- [ ] Stats integration - Track hands played, hands won, biggest pot, win rate, streaks

### Custom Raise Amounts
- [ ] Raise slider/input - Add raise amount controls to `src/components/ActionButtons.tsx`
- [ ] Raise validation - Handle custom raise amounts in `src/hooks/useGameState.ts`

### Side Pot Calculation
- [ ] Side pot logic - Calculate side pots when multiple players all-in at different amounts
- [ ] Side pot showdown - Award main pot and side pots to correct winners in `src/utils/showdown.ts`
- [ ] Side pot UI - Display side pot amounts in `src/components/ShowdownDisplay.tsx`

### Sound Effects
- [ ] Audio utility - Create `src/utils/audio.ts` for audio management
- [ ] Sound files - Add sound effects to `public/audio/` (deal, bet, fold, win, ambiance)
- [ ] Sound integration - Wire up sounds to game events
- [ ] Sound toggle - Add on/off setting

### Hand History Review
- [ ] Hand history utility - Create `src/utils/handHistory.ts` to track and store hands
- [ ] Hand history types - Create `src/types/handHistory.ts`
- [ ] Hand history screen - Create `src/components/HandHistoryScreen.tsx` showing last 10 hands