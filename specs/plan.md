# Poker Pardner - Development Roadmap

## Higher Priority Development

### Ensure the pace of game play

- Keep a running log of each player's actions that can be viewed by clicking a history button in the action panel
- In tutorial mode, play the moves one at a time, and wait for user action before moving on. So, when the cowboy explains what player one did, wait for the user to click "Next" to advance the game play. The Next button should replace the Fold/Call/Raise buttons when AI players are playing, and then those buttons should appear (and the Next button should disappear) when it is the user's turn
- Ensure that the first actions in the hand are recorded in the log, we want the user to see the small blind and big blind. Currently we are not seeing those first actions recorded in the log.
- Pause on the introduction of the flop, turn, and river, so the user has time to read the cowboy's words. Have them click Next to move ahead.

### Give names to the AI players

- Give each AI player a unique name that fits with the Cowboy/Western theme
- Persist these player names throughout the game

### Move game status box into the action panel

- There is a box that displays the game phase: "Turn", "Flop", etc, which is placed between the table and the action panel
- To conserve vertical space, let's move this element into the action panel, placed on the left side beneath the cowboy avatar

### End of Hand display

- At the end of the hand, a modal is currently presented which shows the results. But the user cannot see the table anymore, which makes it difficult to understand why the hand was won or lost.
- Instead of a modal, move this information into the action panel. Have the cowboy explain who won and why.

## Lower Priority Development

### Play Mode (No Guidance)
Add a second mode for users who want to practice without guidance:

**Implementation:**
- Home page should present mode selection: Tutorial (with guidance), Play (no guidance)
- In Play Mode, hide strategic advice from cowboy
- Keep game state display (pot, round, current player)
- Update UI to indicate current mode

### Variable AI Difficulty

Add difficulty levels that affect AI decision-making:

**Difficulty Levels:**
- **Easy:** AI plays more conservatively, folds weak hands often
- **Medium:** Current AI behavior (balanced strategy)
- **Hard:** AI more aggressive, uses position better, better at pot odds

**Implementation:**
- Add difficulty setting to game state
- Modify `src/utils/ai.ts` to accept difficulty parameter
- Adjust thresholds and randomness based on difficulty
- Add difficulty selection to mode selection screen

**Files to Create:**
- `src/constants/difficulty.ts` - Thresholds for each difficulty level

**Files to Modify:**
- `src/utils/ai.ts` - Accept and use difficulty parameter
- `src/types/game.ts` - Add difficulty to GameState

### Progress Tracking & Statistics

Track player performance across sessions:

**Statistics to Track:**
- Hands played
- Hands won
- Biggest pot won
- Win rate percentage
- Tutorial completion status
- Current win/loss streak

**Implementation:**
- Use localStorage for persistence
- Create statistics screen (accessible from main menu)
- Add "Your Stats" button to game over screen
- Display simple charts (win rate over time)

**Files to Create:**
- `src/utils/statistics.ts` - Stats tracking and persistence
- `src/components/StatisticsScreen.tsx` - Stats display UI
- `src/types/statistics.ts` - Statistics type definitions

### Custom Raise Amounts

Replace minimum raise with custom raise input:

**Implementation:**
- Add slider or input field to raise button
- Show min raise (currentBet + bigBlind) and max raise (player's chips)
- Validate raise amounts
- Update UI to show raise controls

**Files to Modify:**
- `src/components/ActionButtons.tsx` - Add raise amount controls
- `src/hooks/useGameState.ts` - Handle custom raise amounts

### Side Pot Calculation

Handle multiple all-ins at different amounts:

**Current Status:** Deferred to Phase 2 per CLAUDE.md

**Implementation:**
- Calculate side pots when multiple players all-in
- Award main pot and side pots to correct winners
- Display side pot amounts in UI
- Update showdown display to show multiple pots

**Files to Modify:**
- `src/hooks/useGameState.ts` - Side pot calculation logic
- `src/utils/showdown.ts` - Multiple winner determination
- `src/components/ShowdownDisplay.tsx` - Display side pots

### Sound Effects

Add sound effects for game actions:

**Sound Effects:**
- Card dealing (whoosh)
- Chip betting (clink)
- Fold action (soft thud)
- Winner announcement (celebratory)
- Background ambiance (saloon sounds)

**Implementation:**
- Find or create sound files
- Add audio playing utility
- Wire up sounds to game events
- Add sound effects toggle (on/off)

**Files to Create:**
- `src/utils/audio.ts` - Audio management
- `public/audio/` - Sound effect files

### Hand History Review

Allow users to review previous hands:

**Features:**
- Show last 10 hands played
- Display all players' hole cards
- Show betting action timeline
- Indicate winning hand

**Files to Create:**
- `src/components/HandHistoryScreen.tsx`
- `src/utils/handHistory.ts` - Track and store hand history
- `src/types/handHistory.ts`
