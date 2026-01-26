# Poker Pardner - Functionality Testing Checklist

This checklist covers all critical gameplay flows, UI interactions, and responsive design requirements for the Poker Pardner Texas Hold'em tutorial application.

## Game Initialization & Setup

### Home Screen
- [ ] Home screen displays with "Tutorial Mode" and "Play Mode" buttons
- [ ] Tutorial Mode button navigates to game with guidance enabled
- [ ] Play Mode button navigates to game with guidance disabled (no strategic advice visible)
- [ ] Mode selection is persistent during gameplay
- [ ] Clicking mode selection buttons doesn't cause crashes or errors

### Game Start
- [ ] Initial hand starts automatically after home screen selection
- [ ] All 4 players start with $100 chip stacks
- [ ] Dealer button appears in correct position (position 0 for first hand)
- [ ] Small blind ($5) and big blind ($10) are posted automatically
- [ ] Cards are dealt with animation
- [ ] Player hole cards are face-up for user, face-down for AI players
- [ ] Community cards area is empty at start of pre-flop

## Pre-Flop Betting Round

### Hand Deal & Initial State
- [ ] User receives exactly 2 hole cards
- [ ] Each AI player receives exactly 2 hole cards
- [ ] User can see their own hole cards clearly
- [ ] AI hole cards remain hidden (back of card visible)
- [ ] Hand strength indicator updates correctly for user's current hand
- [ ] Strategic advice is provided for user's hand in Tutorial Mode
- [ ] Strategic advice is hidden in Play Mode

### Action Order & Execution
- [ ] Betting round starts with player left of big blind (position 2)
- [ ] AI players act in clockwise order
- [ ] User action is available only when it's their turn
- [ ] Action buttons (Fold, Call, Raise) are enabled only during user's turn
- [ ] Other players' actions show in action history
- [ ] AI players take 1-2 seconds to make decisions

### Fold Action
- [ ] Fold button correctly removes user from hand
- [ ] Fold button removes AI players from hand when they fold
- [ ] Folded players' hole cards remain hidden
- [ ] Folded players' chip stacks decrease by their bet amount
- [ ] Folded status is visually indicated (grayed out or dimmed)

### Call Action
- [ ] Call button is correctly labeled with amount to call
- [ ] Call button is disabled when user has no bet to match
- [ ] Call matches the highest bet in current round
- [ ] Call button text updates when bet changes (e.g., "Call $5" → "Call $10")
- [ ] User's chip stack decreases by call amount
- [ ] Pot increases by call amount

### Raise Action
- [ ] Raise button is available when user hasn't acted in round
- [ ] Raise increases bet by minimum amount (current bet + big blind)
- [ ] Minimum raise = current bet amount + $10 (big blind)
- [ ] User's chip stack decreases by raise amount
- [ ] Pot increases by raise amount
- [ ] Raise button is labeled "Raise to $X" showing final amount
- [ ] Raise re-opens betting (all-in raises don't re-open if user can't cover)

### All-In Scenarios
- [ ] User can go all-in when chip stack < minimum raise or call amount
- [ ] All-in bets are accepted without re-opening betting
- [ ] User's remaining chips are deducted and added to pot
- [ ] All-in player is marked visually as all-in
- [ ] AI players can go all-in correctly
- [ ] Betting continues with other active players after all-in

### Betting Round Completion
- [ ] Betting round ends when all active players have either:
  - Folded
  - Called the highest bet
  - Gone all-in
- [ ] Betting round doesn't stall with active player unable to act
- [ ] Action history logs all bets, calls, raises, and folds

### Chip Stack Management Pre-Flop
- [ ] User's chip stack decreases correctly by bet/call/raise amount
- [ ] AI players' chip stacks decrease correctly
- [ ] Pot amount increases by sum of all bets in round
- [ ] No chips are lost or created (pot = sum of all player bets)

## Flop, Turn, River Betting Rounds

### Community Cards Reveal
- [ ] Flop: exactly 3 community cards revealed with animation
- [ ] Turn: exactly 1 additional community card revealed
- [ ] River: exactly 1 additional community card revealed
- [ ] Cards are revealed in correct order (flop 3, turn 1, river 1)
- [ ] Burn card is used (not shown to players)
- [ ] Community cards appear in center of table in correct positions

### Hand Strength Updates
- [ ] User's hand strength is re-evaluated after each community card reveal
- [ ] Strategic advice updates after flop, turn, and river reveals
- [ ] Hand strength indicators show correct rankings (e.g., "High Card" → "Pair of Kings")
- [ ] Strength updates are immediate upon card reveal

### Betting Action (Flop/Turn/River)
- [ ] Betting starts with first active player left of dealer button
- [ ] Action order is correct (clockwise from dealer left)
- [ ] Fold/Call/Raise buttons work correctly in each round
- [ ] User can bet when their hand strength is 0 (no showdown requirement)
- [ ] Check option appears when no bet needs to be called (current round action = 0)
- [ ] All four streets (pre-flop, flop, turn, river) execute betting correctly

### Multiple Betting Rounds Integration
- [ ] Betting round resets for each new street (flop, turn, river)
- [ ] Previous street bets are counted in pot but don't apply to new street
- [ ] Active player list is correct after each street
- [ ] Chip stacks accumulate correctly across all streets

## Showdown & Pot Award

### Hand Evaluation
- [ ] All remaining active players' hole cards are revealed
- [ ] Each player's best 5-card hand is correctly identified
- [ ] Hand rankings are displayed (e.g., "Pair of Kings", "Two Pair")
- [ ] Kickers are shown for tie-breaking situations
- [ ] Community cards are used correctly (all players have access to 7 cards: 2 hole + 5 community)

### Winner Determination
- [ ] Winner is correctly determined based on best 5-card hand
- [ ] Split pots are handled when two players have identical hands
- [ ] Each winner's chip stack increases by pot amount
- [ ] Winner is announced with explanation (e.g., "Player 2 wins with a Pair of Kings")
- [ ] Showdown explanation mentions what beat what (e.g., "Three of a kind beats two pair")

### Showdown Display
- [ ] Showdown modal/display appears with clear layout
- [ ] Winner is clearly highlighted (wanted poster style or similar)
- [ ] Runner-up hands are shown with their rankings
- [ ] Pot amount awarded is displayed
- [ ] All active players in showdown have their hands revealed

### Post-Showdown
- [ ] Showdown display closes after delay (1.5-2 seconds)
- [ ] Next hand starts automatically
- [ ] Users don't need to manually start next hand

## Dealer Button & Rotation

### Initial Dealer Position
- [ ] First hand: dealer button at position 0
- [ ] Dealer button is clearly visible on table layout

### Dealer Rotation
- [ ] After each complete hand, dealer button rotates clockwise by 1 position
- [ ] After position 3, dealer button moves to position 0
- [ ] Dealer rotation persists across multiple hands
- [ ] Player positions don't rotate, only dealer button

### Dealer Position in Action Order
- [ ] First hand: action starts at position 2 (left of big blind)
- [ ] Subsequent hands: action starts based on new dealer position
  - Dealer at 0: action starts at 2
  - Dealer at 1: action starts at 3
  - Dealer at 2: action starts at 0
  - Dealer at 3: action starts at 1

## Player Elimination

### Chip Depletion
- [ ] AI players are eliminated when their chip stack reaches $0
- [ ] Eliminated players are visually marked as "Bust" or removed from table
- [ ] Eliminated players don't participate in future hands

### User Elimination (Game End)
- [ ] Game ends when user's chip stack reaches $0
- [ ] Game over screen displays (deferred to Phase 2)
- [ ] Restart/replay option is available (deferred to Phase 2)

### Remaining Player Scenario
- [ ] If only 1 player remains (all others eliminated), game ends
- [ ] If that player is user, celebration screen displays (deferred to Phase 2)
- [ ] If that player is AI, user has lost and game ends

## UI Components & Interactions

### Action Buttons (Fold/Call/Raise)
- [ ] Buttons are clearly labeled and visible
- [ ] Buttons are disabled when not user's turn
- [ ] Buttons are enabled during user's action
- [ ] Button colors/styles indicate enabled/disabled state
- [ ] Clicking button during animation doesn't cause double action
- [ ] Button text updates correctly based on game state:
  - "Fold" when any action is available
  - "Call $X" with correct amount
  - "Check" when no bet to match
  - "Raise to $X" with correct amount

### Strategic Advice Panel (Tutorial Mode Only)
- [ ] Panel displays hand strength analysis
- [ ] Panel provides strategic recommendations
- [ ] Panel text is readable and well-formatted
- [ ] Panel updates in real-time as community cards reveal
- [ ] Panel is hidden in Play Mode

### Action History
- [ ] Action history logs all player actions (fold, check, call, raise, all-in)
- [ ] History shows action in chronological order
- [ ] History shows player name and action with amount
- [ ] History resets for each new hand
- [ ] History is accessible via modal or panel

### Hand Rankings Reference
- [ ] Hand rankings guide is accessible (e.g., modal, side panel)
- [ ] All hand rankings are listed with correct order
- [ ] Examples are provided for each ranking
- [ ] Guide is visible in both Tutorial and Play modes
- [ ] Guide text is readable

### Pot Display
- [ ] Pot amount is clearly visible
- [ ] Pot updates in real-time as bets are placed
- [ ] Pot amount shows correct total ($100 starting, increases with bets)
- [ ] Very large pot amounts ($1,000+) display correctly

### Chip Stack Display
- [ ] Each player's chip stack is visible
- [ ] Chip stacks update in real-time
- [ ] User's chip stack is highlighted or clearly distinguished
- [ ] Chip stacks decrease/increase correctly
- [ ] Very large chip stacks (if earned) display correctly

### Dealer Button Indicator
- [ ] Dealer button is visually distinct (D button or similar)
- [ ] Button is in correct position each hand
- [ ] Button rotates correctly after each hand

### Community Cards Display
- [ ] Community cards are clearly centered on table
- [ ] Cards appear in correct positions (flop left to right, turn, river)
- [ ] Card values and suits are readable
- [ ] Face-down cards show correct back design

### Player Position Display
- [ ] Player names are visible at their positions
- [ ] Player chip stacks are visible below names
- [ ] Dealer button position is clear
- [ ] Current action indicator shows whose turn it is
- [ ] Folded status is visually indicated

### Music Player
- [ ] Music player control is visible
- [ ] Music plays automatically on page load
- [ ] Play/pause button toggles music correctly
- [ ] Music doesn't interfere with other audio (if added)
- [ ] Music control is accessible on desktop and mobile

### Confirm Dialog
- [ ] Confirmation modals appear when appropriate (e.g., fold confirmation)
- [ ] Modal has clear question and yes/no buttons
- [ ] Clicking "Yes" confirms action
- [ ] Clicking "No" cancels action
- [ ] Clicking outside modal closes it appropriately

## Animation & Visual Feedback

### Card Dealing Animation
- [ ] Cards animate when dealt with smooth motion
- [ ] Deal animation timing is consistent
- [ ] Animation doesn't block game logic
- [ ] Cards appear in correct order
- [ ] Animation is visible on slower devices

### Card Reveal Animation
- [ ] Community cards animate when revealed
- [ ] Reveal timing is appropriate (not too fast, not too slow)
- [ ] Animation is smooth without stuttering
- [ ] All card reveals (flop, turn, river) animate correctly

### Chip Movement Animation
- [ ] Chips animate when moved to pot
- [ ] Animation is smooth and visible
- [ ] Animation doesn't block betting logic
- [ ] Multiple chip movements animate without stalling

### Button Feedback
- [ ] Buttons show hover state (color change, cursor change)
- [ ] Buttons show pressed/active state
- [ ] Disabled buttons are visually distinct
- [ ] Button interactions feel responsive

## Responsive Design

### Desktop Layout (1920x1080 and larger)
- [ ] Table layout is centered and well-proportioned
- [ ] All cards are clearly readable
- [ ] Button text is readable (no overflow)
- [ ] Sidebar (cowboy panel) displays alongside table
- [ ] No horizontal scrolling required
- [ ] All UI elements fit within viewport

### Tablet Layout (768px - 1024px)
- [ ] Table scales appropriately for tablet width
- [ ] Cards remain readable
- [ ] Buttons are tappable (min 44x44px)
- [ ] Sidebar may collapse or adjust layout
- [ ] No essential content is hidden off-screen
- [ ] Landscape orientation works correctly

### Mobile Layout (375px - 767px)
- [ ] Table scales down appropriately
- [ ] Cards are readable on small screens
- [ ] Buttons are tappable size (min 44x44px)
- [ ] Sidebar is accessible (hamburger menu or swipe)
- [ ] No horizontal scrolling required
- [ ] Pot and chip displays are visible
- [ ] Action buttons are clearly visible
- [ ] Portrait orientation works correctly
- [ ] Landscape orientation works correctly

### Portrait vs Landscape
- [ ] Layout adapts correctly when device is rotated
- [ ] No content loss on rotation
- [ ] Table remains playable in both orientations
- [ ] Sidebar adjusts appropriately for orientation

### Touch Interactions (Mobile)
- [ ] Buttons are tappable without requiring precision
- [ ] Touch interactions don't trigger unwanted hover states
- [ ] Swiping doesn't cause accidental actions
- [ ] Double-tap zoom doesn't interfere with gameplay
- [ ] Long-press doesn't cause accidental folds

### Font Sizes & Readability
- [ ] Player names are readable on all screen sizes
- [ ] Card values/suits are readable
- [ ] Button text is readable
- [ ] Pot and chip amounts are readable
- [ ] Narrative text (cowboy panel) is readable
- [ ] No text overflow in UI elements

### Color Contrast & Accessibility
- [ ] Text contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Card suits are distinguishable (red vs black)
- [ ] Disabled state buttons are distinguishable from enabled
- [ ] No critical information conveyed by color alone
- [ ] Links (if any) are underlined or otherwise distinguished

## Error Handling & Edge Cases

### Network & Performance
- [ ] App doesn't crash on rapid action clicking
- [ ] App handles slow device rendering gracefully
- [ ] Animations degrade gracefully on low-end devices
- [ ] No memory leaks during extended gameplay
- [ ] App doesn't freeze during AI decision delays

### Input Validation
- [ ] Negative chip amounts never display
- [ ] Bets never exceed player's chip stack
- [ ] Raise amounts are always >= minimum
- [ ] Player actions are validated before processing

### Visual Edge Cases
- [ ] Very long player names (10+ characters) don't break layout
- [ ] Very large pot amounts ($10,000+) display correctly
- [ ] All 4 players all-in simultaneously displays correctly
- [ ] Single remaining player displays correctly

### Game State Edge Cases
- [ ] Game handles all players folding except one (winner determined)
- [ ] Game handles user checking down to showdown
- [ ] Game handles all players checking (community cards revealed automatically)
- [ ] Game handles AI players with $0 chips (eliminated correctly)

## Tutorial Mode vs Play Mode

### Strategic Advice Visibility
- [ ] Tutorial Mode: Strategic advice always visible
- [ ] Play Mode: Strategic advice is hidden/not displayed
- [ ] Mode switching doesn't cause crashes
- [ ] Both modes play identically (only display difference)

### Cowboy Narration
- [ ] Both modes: Cowboy narrates actions
- [ ] Both modes: Narration explains hand rankings at showdown
- [ ] Both modes: Narration provides context-appropriate commentary
- [ ] Tutorial Mode: Narration includes strategic guidance
- [ ] Play Mode: Narration is action-focused

### Action History & Hand Rankings
- [ ] Both modes: Action history is available
- [ ] Both modes: Hand rankings reference is available
- [ ] These features are not mode-dependent

## Audio

### Music Player
- [ ] Background music plays on load
- [ ] Music volume is appropriate
- [ ] Music doesn't loop abruptly
- [ ] Music can be toggled on/off
- [ ] Music control is persistent across hands

## Test Coverage & Quality

### Unit Tests
- [ ] All core logic functions have unit tests
- [ ] Hand evaluator tests cover all hand rankings
- [ ] AI decision tests cover various scenarios
- [ ] Card utility tests cover deck operations
- [ ] 80%+ code coverage maintained

### Integration Tests
- [ ] Full game flow from start to showdown works
- [ ] Multiple consecutive hands play correctly
- [ ] Player elimination flow works
- [ ] Mode switching works without issues

### Manual Testing Scenarios
- [ ] Play 5 consecutive complete hands
- [ ] Test folding in each position
- [ ] Test raising with different chip stacks
- [ ] Test with very tight/loose AI decisions
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on multiple devices (desktop, tablet, phone)

## Pre-Deployment Verification

### Browser Compatibility
- [ ] Chrome (latest) - all features work
- [ ] Firefox (latest) - all features work
- [ ] Safari (latest) - all features work
- [ ] Edge (latest) - all features work
- [ ] Mobile Safari (iOS latest)
- [ ] Chrome Mobile (Android latest)

### Performance Benchmarks
- [ ] Initial page load < 3 seconds
- [ ] Hand deal animation smooth (60fps)
- [ ] No jank during betting round
- [ ] Memory usage stable after 10+ hands
- [ ] Bundle size < 500KB gzipped

### Console Errors
- [ ] No console errors on initial load
- [ ] No console errors during gameplay
- [ ] No console warnings in production build
- [ ] No console.log statements in production code

### Accessibility
- [ ] Keyboard navigation possible (Tab through elements)
- [ ] Screen reader announcements clear (if applicable)
- [ ] Focus indicators visible on all interactive elements
- [ ] Color contrast adequate throughout UI
- [ ] Font sizes readable on all devices

---

## Testing Notes

**Tester Name:** _______________

**Testing Date:** _______________

**Browser/Device:** _______________

**Notes & Issues Found:**

---

## Sign-Off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] App ready for deployment

**Tested By:** _______________

**Date:** _______________
