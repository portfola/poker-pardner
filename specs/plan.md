# Poker Pardner - Development Roadmap

#### Play Mode (No Guidance)
Add a second mode for users who want to practice without guidance:

**Implementation:**
- Add mode selection screen: Practice (with guidance), Play (no guidance)
- In Play Mode, hide strategic advice from sidebar
- Keep game state display (pot, round, current player)
- Update UI to indicate current mode

**Files to Modify:**
- `src/types/game.ts` - Add 'play' to mode type
- `src/App.tsx` - Add mode selection screen
- `src/components/Sidebar.tsx` - Conditional strategic advice rendering

#### Variable AI Difficulty
**Effort:** Medium (1 day)
**Impact:** Medium - more engaging gameplay

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

#### Progress Tracking & Statistics
**Effort:** Medium (1-2 days)
**Impact:** Medium - engagement and learning feedback

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


#### Custom Raise Amounts
**Effort:** Medium (1 day)
**Impact:** Low-Medium - more realistic poker

Replace minimum raise with custom raise input:

**Implementation:**
- Add slider or input field to raise button
- Show min raise (currentBet + bigBlind) and max raise (player's chips)
- Validate raise amounts
- Update UI to show raise controls

**Files to Modify:**
- `src/components/ActionButtons.tsx` - Add raise amount controls
- `src/hooks/useGameState.ts` - Handle custom raise amounts

#### Side Pot Calculation
**Effort:** Large (2-3 days)
**Impact:** Low - edge case handling

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

#### Sound Effects
**Effort:** Small-Medium (1 day)
**Impact:** Low - ambiance

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

#### Hand History Review
**Effort:** Medium (1-2 days)
**Impact:** Low - learning tool

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
