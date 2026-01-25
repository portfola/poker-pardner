# Edge Cases Testing Documentation

## Overview
This document details all edge cases that have been tested in the poker application. All tests are passing as of January 2026 with 187 total tests (20 new edge case tests added).

## Bugs Fixed During Testing

### 1. Dealer Button Rotation Bug (FIXED)
**Issue:** When a player was eliminated, the dealer button could rotate to an invalid position.

**Root Cause:** In `useGameState.ts`, the `RESET_FOR_NEXT_HAND` action was rotating the dealer button BEFORE eliminating players. This meant:
1. Dealer at position 2 would rotate to position 3
2. Player at position 2 gets eliminated
3. Players get re-indexed to 0, 1, 2
4. Dealer position 3 is now out of bounds

**Fix:** Changed the order to eliminate players first, then rotate the dealer button.

**Location:** `src/hooks/useGameState.ts:460-474`

**Test Coverage:** `src/hooks/useGameState.test.tsx` - "should rotate dealer button correctly when dealer is eliminated"

---

### 2. Minimum Raise Not Set Correctly (FIXED)
**Issue:** After blinds were posted, the minimum raise was set to 10 (the big blind) instead of 20 (currentBet + bigBlind).

**Root Cause:** The `minRaise` was initialized to `bigBlind` but never updated after posting blinds when `currentBet` was set to the big blind amount.

**Fix:** Added code in `postBlinds()` to set `minRaise = currentBet + bigBlind` after posting the big blind.

**Location:** `src/hooks/useGameState.ts:137`

**Test Coverage:** `src/hooks/useGameState.test.tsx` - "should calculate minimum raise correctly after initial bet"

---

## Edge Case Categories

### 1. All-In Scenarios

#### 1.1 All-In When Player Cannot Cover Full Bet
**Scenario:** Player has fewer chips than required to call the current bet.

**Expected Behavior:**
- Player bets all remaining chips
- Player is marked as `isAllIn = true`
- Player's chips go to 0
- Pot increases by amount player had

**Test:** "should handle all-in when player cannot cover full bet"

**Status:** ✅ PASSING

---

#### 1.2 All-In When Player Cannot Cover Minimum Raise
**Scenario:** Player wants to raise but has fewer chips than the minimum raise amount.

**Expected Behavior:**
- Player bets all remaining chips
- Player is marked as `isAllIn = true`
- Current bet is updated to player's total bet (even if less than min raise)
- Other players must respond to the bet

**Test:** "should handle all-in when player cannot cover minimum raise"

**Status:** ✅ PASSING

---

#### 1.3 Blind Posting with Insufficient Chips
**Scenario:** Player in small blind or big blind position has fewer chips than the blind amount.

**Expected Behavior:**
- Player posts all remaining chips
- Player is marked as `isAllIn = true`
- Player still receives hole cards
- Pot increases by amount player had

**Test:** "should handle blind posting when player has insufficient chips"

**Status:** ✅ PASSING

---

#### 1.4 Multiple All-Ins in Same Hand
**Scenario:** Multiple players go all-in during the same hand at different amounts.

**Expected Behavior:**
- Each player correctly marked as all-in
- Pot accumulates all all-in amounts
- Players can't act further after going all-in
- Betting round continues for players with chips
- All all-in players participate in showdown

**Test:** "should handle multiple all-ins in same hand"

**Status:** ✅ PASSING

**Note:** Side pot calculation is deferred to Phase 2 per `CLAUDE.md`. Current implementation awards entire pot to winner, which is incorrect for complex all-in scenarios with multiple different bet amounts.

---

### 2. Player Elimination

#### 2.1 Basic Elimination
**Scenario:** Player ends a hand with 0 chips.

**Expected Behavior:**
- Player is removed from players array after `resetForNextHand()`
- Remaining players have positions re-assigned
- Game continues with remaining players

**Test:** "should eliminate player with 0 chips after hand"

**Status:** ✅ PASSING

---

#### 2.2 Dealer Elimination
**Scenario:** The player who is currently the dealer gets eliminated.

**Expected Behavior:**
- Player is eliminated
- Positions are re-assigned
- Dealer button rotates correctly to valid position
- Dealer position is within bounds of new player count

**Test:** "should rotate dealer button correctly when dealer is eliminated"

**Status:** ✅ PASSING (after bug fix)

---

#### 2.3 Multiple Eliminations
**Scenario:** Multiple players are eliminated in the same hand.

**Expected Behavior:**
- All players with 0 chips are removed
- Positions re-assigned sequentially (0, 1, 2...)
- Dealer button wraps correctly
- Game continues with remaining players

**Test:** "should handle multiple eliminations in one hand"

**Status:** ✅ PASSING

---

#### 2.4 Elimination Down to 2 Players
**Scenario:** Game continues until only 2 players remain.

**Expected Behavior:**
- Game continues with 2 players
- Blinds are still posted correctly
- Dealer button alternates between the 2 players
- Game can proceed normally with heads-up play

**Test:** "should handle elimination when only 2 players remain"

**Status:** ✅ PASSING

---

### 3. Betting Round Completion

#### 3.1 All But One Player Folds
**Scenario:** During a betting round, all players except one fold.

**Expected Behavior:**
- Betting round is immediately complete
- No further betting occurs
- Remaining player wins pot
- Hand ends without going to showdown

**Test:** "should complete betting round when all but one player folds"

**Status:** ✅ PASSING

---

#### 3.2 All Players All-In
**Scenario:** All players in the hand are all-in.

**Expected Behavior:**
- Betting round is complete
- Community cards are dealt automatically
- Hand proceeds to showdown
- No more betting decisions needed

**Test:** "should complete betting round when all players are all-in"

**Status:** ✅ PASSING

---

#### 3.3 Only One Non-All-In Player Remains
**Scenario:** All players except one are either folded or all-in.

**Expected Behavior:**
- Betting round is complete
- Remaining player cannot bet against all-in players
- Hand proceeds to showdown
- Community cards are dealt

**Test:** "should complete betting round when only one non-all-in player remains"

**Status:** ✅ PASSING

---

#### 3.4 Active Player Has Not Acted
**Scenario:** Betting round where at least one active player hasn't acted yet.

**Expected Behavior:**
- Betting round is NOT complete
- Game waits for player action
- `isBettingComplete()` returns false

**Test:** "should not complete betting round if active player has not acted"

**Status:** ✅ PASSING

---

#### 3.5 Player Has Not Matched Current Bet
**Scenario:** A player has acted but their bet doesn't match the current bet.

**Expected Behavior:**
- Betting round is NOT complete
- Player must act again to call, raise, or fold
- `isBettingComplete()` returns false

**Test:** "should not complete betting round if player has not matched current bet"

**Status:** ✅ PASSING

---

### 4. Split Pots

#### 4.1 Identical Hands
**Scenario:** Two or more players have exactly the same hand at showdown.

**Expected Behavior:**
- All players with best hand are declared winners
- Pot is split evenly among winners
- Each winner receives floor(pot / winnerCount)
- Winners array contains all tying players

**Test:** "should split pot evenly when two players have identical hands"

**Status:** ✅ PASSING

**Note:** Test uses manually set cards to create identical hands. The hand evaluator correctly identifies ties and splits pots.

**Known Limitation:** With multiple all-ins at different amounts, side pots are NOT calculated (deferred to Phase 2).

---

### 5. Minimum Raise Calculations

#### 5.1 Initial Minimum Raise After Blinds
**Scenario:** After blinds are posted, what is the minimum raise amount?

**Expected Behavior:**
- Current bet is 10 (big blind)
- Minimum raise is 20 (current bet + big blind)
- Player must raise to at least 20 or go all-in

**Test:** "should calculate minimum raise correctly after initial bet"

**Status:** ✅ PASSING (after bug fix)

---

#### 5.2 Minimum Raise After a Raise
**Scenario:** Player raises, then another player wants to re-raise. What's the new minimum?

**Expected Behavior:**
- If player raises to 20, current bet becomes 20
- Minimum raise becomes 30 (20 + 10)
- Re-raise must be to at least 30 or all-in

**Test:** "should update minimum raise after a raise"

**Status:** ✅ PASSING

---

#### 5.3 All-In for Less Than Minimum Raise
**Scenario:** Player wants to raise but doesn't have enough chips for minimum raise.

**Expected Behavior:**
- Player is allowed to go all-in for less than minimum
- Player is marked as all-in
- This does NOT re-open betting for players who already acted
- Other players can call the all-in amount

**Test:** "should allow all-in for less than minimum raise"

**Status:** ✅ PASSING

**Note:** Current implementation allows this correctly. The all-in amount becomes the current bet even if less than minimum raise.

---

### 6. Blind Posting with Few Players

#### 6.1 Blinds with 3 Players
**Scenario:** Game continues with 3 players remaining.

**Expected Behavior:**
- Small blind at position (dealer + 1) % 3
- Big blind at position (dealer + 2) % 3
- First to act at position (dealer + 3) % 3 = dealer position
- Total pot starts at 15
- All positions calculated with modulo to wrap correctly

**Test:** "should post blinds correctly with 3 players"

**Status:** ✅ PASSING

---

#### 6.2 Blinds with 2 Players (Heads-Up)
**Scenario:** Heads-up play with only 2 players.

**Expected Behavior:**
- Small blind at position (dealer + 1) % 2
- Big blind at position (dealer + 2) % 2 = dealer position
- In heads-up, dealer is also small blind
- First to act is small blind pre-flop
- Pot starts at 15

**Test:** "should post blinds correctly with 2 players"

**Status:** ✅ PASSING

**Note:** Standard poker heads-up rules are followed where dealer is small blind.

---

#### 6.3 Dealer Button Rotation with 2 Players
**Scenario:** Dealer button rotates between hands in heads-up play.

**Expected Behavior:**
- Dealer position alternates: 0 → 1 → 0 → 1...
- Modulo wrapping works correctly
- No out-of-bounds errors

**Test:** "should handle dealer button rotation with 2 players"

**Status:** ✅ PASSING

---

## Test Coverage Summary

| Category | Test Count | Status |
|----------|-----------|--------|
| All-In Scenarios | 4 | ✅ All Passing |
| Player Elimination | 4 | ✅ All Passing |
| Betting Round Completion | 5 | ✅ All Passing |
| Split Pots | 1 | ✅ Passing |
| Minimum Raise Calculations | 3 | ✅ All Passing |
| Blind Posting with Few Players | 3 | ✅ All Passing |
| **TOTAL EDGE CASES** | **20** | **✅ All Passing** |

**Overall Test Suite:** 187 tests passing
- 24 tests: Card utilities
- 29 tests: Hand strength analysis
- 53 tests: Hand evaluator (rankings, comparisons, edge cases)
- 14 tests: AI decision making
- 46 tests: Game state management (includes 20 new edge case tests)
- 21 tests: Component rendering and interactions

---

## Known Limitations (Deferred to Phase 2)

### Side Pot Calculation
**Current Status:** NOT IMPLEMENTED

**Scenario:** Multiple players go all-in at different amounts.

**Example:**
- Player A has $50, goes all-in
- Player B has $100, goes all-in
- Player C has $100, calls $100
- Pot should have:
  - Main pot: $150 ($50 × 3) - all players eligible
  - Side pot: $100 ($50 × 2) - only B and C eligible

**Current Behavior:**
- Entire pot awarded to single winner
- If Player A has best hand, they win entire $250 (incorrect)
- Correct behavior would be A wins $150, best of B/C wins $100

**Reason for Deferral:**
- Complex algorithm required
- Edge case that occurs infrequently
- Phase 1 focused on core gameplay
- Documented in `CLAUDE.md` and `plan.md`

**Test Status:**
- Multiple all-ins are handled (players go all-in correctly)
- Pot splitting for ties works
- Side pot calculation specifically is deferred

---

## Testing Methodology

### Test Framework
- **Framework:** Vitest
- **Testing Library:** React Testing Library
- **Approach:** Integration testing of game state logic

### Test Structure
Each edge case test follows this pattern:
1. Initialize game state with `renderHook(() => useGameState())`
2. Set up scenario (modify player chips, positions, etc.)
3. Execute actions (`startNewHand()`, `handlePlayerAction()`, etc.)
4. Assert expected outcomes

### Mutation Testing
Some tests directly mutate state for setup. This is acceptable because:
- Tests are isolated and independent
- Setup mutations occur before actions are tested
- Actions themselves are tested via the public API
- Real gameplay would never mutate state directly

### Coverage Areas
- ✅ All-in mechanics
- ✅ Player elimination
- ✅ Dealer button rotation
- ✅ Betting round completion
- ✅ Pot distribution (basic)
- ✅ Minimum raise calculations
- ✅ Edge cases with 2-3 players
- ⏸️ Side pot calculation (Phase 2)

---

## Recommendations for Future Testing

### Phase 2 Priorities
1. **Side Pot Calculation**
   - Test 2-player all-in with different amounts
   - Test 3-player all-in with different amounts
   - Test side pot with folded players
   - Test multiple side pots

2. **End Game Scenarios**
   - Test game ending when only 1 player has chips
   - Test game over screen display
   - Test restart after game over

3. **UI Edge Cases**
   - Test rapid clicking during animations
   - Test action buttons during phase transitions
   - Test display of very large pot amounts
   - Test display with long player names

### Performance Testing
- Test with 100+ consecutive hands
- Test memory usage over extended gameplay
- Test animation performance on low-end devices

### Cross-Browser Testing
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile devices (iOS, Android)
- Test with different screen sizes

---

## Conclusion

All critical edge cases identified in the development roadmap have been tested and are passing. Two bugs were discovered and fixed during edge case testing:

1. Dealer button rotation with eliminations
2. Minimum raise calculation after blinds

The application now has robust handling of:
- All-in scenarios with varying chip amounts
- Player elimination and game continuation
- Betting round completion in various states
- Split pots with identical hands
- Minimum raise calculations
- Gameplay with 2-4 players

The only deferred functionality is side pot calculation with multiple all-ins at different amounts, which is documented and planned for Phase 2.

**Total Edge Case Tests:** 20 new tests added
**Total Test Suite:** 187 tests passing
**Bugs Fixed:** 2
**Test Coverage:** Comprehensive for Phase 1 scope

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Next Review:** After Phase 2 implementation
