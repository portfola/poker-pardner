# Poker Pardner - Development Roadmap

## Next Up

### Fix display issues

- [x] Action Panel gets too tall and covers up the user's cards (2026-01-26)
- [x] Hand strength box needs more space to show all text clearly. Increase the width of the right column and decrease the width of the center column to make room (2026-01-26)
- [x] Refine the border colors and curves throughout the action panel components (2026-01-26) 

### Allow time to read guidance

- [x] Ensure the user has enough time to read messages from the cowboy. There are areas where messages are shown momentarily and then move forward automatically (2026-01-26)
- [x] For example, when the user selects "Raise" then the cowboy said something like "You're showing some gumption!" - but the message flashed too quickly to see before the next player moved and the cowboy commented on that move (2026-01-26)
- [x] Have the AI players typically take 4-6 seconds to make their move. Make it clear that we're waiting for that player to decide. Especially deeper into the hand, have AI players take a little longer to decide, like 7-8 seconds (2026-01-26)
 
## Backlog

### Pre-Production & Deployment

- [ ] Post-deployment verification - Load testing, social sharing test, Lighthouse audit
  - BLOCKED: Requires application to be deployed first. Need deployment configuration and hosting setup.
- [x] Set up analytics - PostHog integration for user tracking and insights (2026-01-26)

### Play Mode (No Guidance)
- [x] Home screen mode selection - Present choice between Tutorial (with guidance) and Play (no guidance) (2026-01-26)
- [x] Play mode implementation - Hide strategic advice from cowboy; keep game state display (2026-01-26)

### Variable AI Difficulty
- [x] Difficulty constants - Create `src/constants/difficulty.ts` with thresholds for Easy/Medium/Hard (2026-01-26)
- [x] AI difficulty parameter - Modify `src/utils/ai.ts` to accept and use difficulty parameter (2026-01-26)
- [x] Difficulty type definition - Add difficulty to GameState in `src/types/game.ts` (2026-01-26)
- [x] Difficulty selection UI - Add difficulty selection to mode selection screen (2026-01-26)

### Progress Tracking & Statistics
- [x] Statistics utility - Create `src/utils/statistics.ts` for tracking and localStorage persistence (2026-01-26)
- [x] Statistics types - Create `src/types/statistics.ts` with type definitions (2026-01-26)
- [x] Statistics screen - Create `src/components/StatisticsScreen.tsx` for stats display (2026-01-26)
- [x] Stats integration - Track hands played, hands won, biggest pot, win rate, streaks (2026-01-26)

### Custom Raise Amounts
- [x] Raise slider/input - Add raise amount controls to `src/components/ActionButtons.tsx` and `src/components/CowboyPanel.tsx` (2026-01-26)
- [x] Raise validation - Handle custom raise amounts in `src/hooks/useGameState.ts` and `src/App.tsx` (2026-01-26)

### Side Pot Calculation (Phase 2 Priority)
- [x] Side pot logic - Calculate side pots when multiple players all-in at different amounts (2026-01-26)
- [x] Side pot showdown - Award main pot and side pots to correct winners in `src/utils/showdown.ts` (2026-01-26)
- [x] Side pot UI - Display side pot amounts in `src/components/ShowdownDisplay.tsx` (2026-01-26)
- [x] Test 2-player all-in with different amounts (2026-01-26)
- [x] Test 3-player all-in with different amounts (2026-01-26)
- [x] Test side pot with folded players (2026-01-26)
- [x] Test multiple side pots (2026-01-26)

### End Game Scenarios (Phase 2 Priority)
- [x] Game ending when only 1 player has chips (all others eliminated) (2026-01-26)
- [x] Game over screen display with celebration (2026-01-26)
- [x] Restart/replay functionality after game ends (2026-01-26)

### UI Edge Cases (Phase 2 Priority)
- [x] Test rapid clicking during animations (2026-01-26)
- [x] Test action buttons during phase transitions (2026-01-26)
- [x] Test display of very large pot amounts (e.g., $10,000+) (2026-01-26)
- [x] Test display with long player names (10+ characters) (2026-01-26)

### Performance Testing (Phase 2 Priority)
- [x] Test with 100+ consecutive hands (2026-01-26)
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