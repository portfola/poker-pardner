# Poker Tutorial Web App - Specification

## Overview
A poker saloon in the Old West where complete beginners learn how to play Texas Hold'em poker through guided practice play with strategic advice.

## Target Audience
Complete beginners who have never played poker or any card games before.

## Core Gameplay

### Practice Mode with Guidance
- **Unlimited randomly-generated hands** with full guidance and strategic advice
- User learns by playing real poker hands with contextual help from a cowboy assistant
- Cowboy assistant acts as a pop-up guide providing play-by-play explanations, hand analysis, and strategic recommendations
- User can practice until going broke, then start a new game
- Allows organic learning through experience with safety net of constant guidance

### Game Configuration

**Players:**
- 4 total players (1 user + 3 AI opponents)
- AI players begin with basic, predictable strategy and gradually increase complexity of play

**Starting Conditions:**
- Each player starts with $100 in chips
- Small blind: $5
- Big blind: $10
- Uses dollar ($) notation to imply real money stakes

**End Conditions:**
- If user goes broke: game ends
- If AI player goes broke: eliminated, game continues with remaining players
- Game continues until only one player remains with all chips
- If user is the last player remaining, game ends with a celebration

### User Interface

#### Main Table View
- Poker table with 4 player positions
- Playing cards:
  - User's 2 hole cards (face up, visible to user only)
  - Other players' hole cards (face down until showdown)
  - 5 community cards (revealed progressively: flop, turn, river)
- Action buttons: Fold, Call, Raise (minimum raise only in Phase 1)
- Chip stack display for each player
- Pot size display
- Dealer button indicator (rotates each hand)
- Card animations when dealing
- Chip animations when betting


### Gameplay Flow

#### Pre-Flop
1. Dealer button assigned/rotated
2. Blinds posted automatically
3. Cards dealt with animation
4. Betting round begins (starts with player left of big blind)
5. User sees their hole cards and current hand strength
6. Sidebar explains situation and provides strategic advice
7. User chooses action (Fold/Call/Raise)
8. AI players act in turn
9. Betting round concludes when all active players have matched

#### Post-Flop, Turn, River
1. Burn card (not shown)
2. Community cards revealed with animation
3. User's hand strength updates dynamically
4. Betting round (starts with first active player left of dealer)
5. Sidebar provides updated strategic advice
6. User makes decision
7. AI players act
8. Round concludes

#### Showdown
1. All active players' hole cards revealed
2. Each player's best 5-card hand displayed
3. Winner determined and explained (e.g., "Player 2 wins with two pair (Kings and 7s), beating your pair of Jacks")
4. Pot awarded with animation
5. Brief pause before next hand

#### Between Hands
- Dealer button rotates clockwise
- Chip stacks update
- Eliminated players (if any) removed from table
- Next hand begins automatically after brief delay

### User Guidance Strategy

**Practice Mode:**
- Sidebar provides detailed explanations at every decision point
- Strategic advice analyzes current hand strength and situation
- User allowed to make any legal action (learning by doing)
- Post-hand showdown explains why someone won
- Guidance remains active throughout all gameplay
- User learns organically through repeated play with contextual help

### Raise Mechanics (Simplified)
- Clicking "Raise" automatically raises by minimum amount
- Minimum raise = current bet + big blind amount
- No custom raise sizing in Phase 1
- "All-In" still possible if user's chip stack < minimum raise

### Technical Requirements

**Frontend Framework:**
- React for UI components and state management
- Responsive design (desktop primary, mobile-friendly)
- Smooth animations for cards and chips

**Game Logic:**
- Betting round state machine
- Hand evaluation algorithm (determine best 5-card hand)
- AI decision engine (basic strategy)
- Pot calculation and side pot handling
- Chip stack management

**Visual Design:**
- Clean, uncluttered poker table interface
- Clear card visibility and readability
- Intuitive action buttons
- Professional but approachable aesthetic
- Accessibility considerations (color contrast, font sizes)


## Technical Debt & Maintenance

### Code Quality
- All test coverage maintained above 80%
- All new features include unit tests
- TypeScript strict mode compliance
- No console.log in production builds

### Performance
- Bundle size stays under 500KB gzipped
- No memory leaks in extended gameplay
- Smooth animations on 60fps

### Documentation
- Update CLAUDE.md as features are added
- Keep README.md current with feature list
- Document any architecture changes
- Add JSDoc comments for complex functions
