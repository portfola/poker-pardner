# Poker Pardner - Development Roadmap

## Next Up

### Fix display issues

- [x] Action Panel gets too tall and covers up the user's cards (2026-01-26)
- [x] Hand strength box needs more space to show all text clearly. Increase the width of the right column and decrease the width of the center column to make room (2026-01-26)
- [x] Refine the border colors and curves throughout the action panel components (2026-01-26) 
 
## Backlog

### Pre-Production & Deployment

- [ ] Post-deployment verification - Load testing, social sharing test, Lighthouse audit
- [ ] Set up analytics - PostHog integration for user tracking and insights

### Play Mode (No Guidance)
- [x] Home screen mode selection - Present choice between Tutorial (with guidance) and Play (no guidance) (2026-01-26)
- [x] Play mode implementation - Hide strategic advice from cowboy; keep game state display (2026-01-26)

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

### Side Pot Calculation (Phase 2 Priority)
- [ ] Side pot logic - Calculate side pots when multiple players all-in at different amounts
- [ ] Side pot showdown - Award main pot and side pots to correct winners in `src/utils/showdown.ts`
- [ ] Side pot UI - Display side pot amounts in `src/components/ShowdownDisplay.tsx`
- [ ] Test 2-player all-in with different amounts
- [ ] Test 3-player all-in with different amounts
- [ ] Test side pot with folded players
- [ ] Test multiple side pots

### End Game Scenarios (Phase 2 Priority)
- [ ] Game ending when only 1 player has chips (all others eliminated)
- [ ] Game over screen display with celebration
- [ ] Restart/replay functionality after game ends

### UI Edge Cases (Phase 2 Priority)
- [ ] Test rapid clicking during animations
- [ ] Test action buttons during phase transitions
- [ ] Test display of very large pot amounts (e.g., $10,000+)
- [ ] Test display with long player names (10+ characters)

### Performance Testing (Phase 2 Priority)
- [ ] Test with 100+ consecutive hands
- [ ] Test memory usage over extended gameplay
- [ ] Test animation performance on low-end devices

### Sound Effects
- [ ] Audio utility - Create `src/utils/audio.ts` for audio management
- [ ] Sound files - Add sound effects to `public/audio/` (deal, bet, fold, win, ambiance)
- [ ] Sound integration - Wire up sounds to game events
- [ ] Sound toggle - Add on/off setting

### Hand History Review
- [ ] Hand history utility - Create `src/utils/handHistory.ts` to track and store hands
- [ ] Hand history types - Create `src/types/handHistory.ts`
- [ ] Hand history screen - Create `src/components/HandHistoryScreen.tsx` showing last 10 hands