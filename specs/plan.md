# Poker Pardner - Development Roadmap

## Next Up
- [ ] Improve design, layout, and spacing of the elements within the action panel. Prefer rounded rectangles and squares to circles. Ensure the text is readable and buttons are usable.

## Backlog

### Pre-Production & Deployment
- [ ] Create favicon - 32x32px minimum, poker/western theme (.ico or .svg)
- [ ] Create Open Graph image - 1200x630px PNG for social sharing
- [ ] Run pre-deployment checklist - Code quality, assets, SEO, performance verification
- [ ] Browser testing - Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Mobile browser testing - iOS Safari, Chrome Mobile (Android)
- [ ] Functionality testing checklist - All gameplay flows, UI interactions, responsive design
- [ ] Post-deployment verification - Load testing, social sharing test, Lighthouse audit
- [ ] Set up analytics - PostHog integration for user tracking and insights

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