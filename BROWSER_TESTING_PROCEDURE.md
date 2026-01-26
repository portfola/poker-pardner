# Browser Testing Procedure - Poker Pardner

## Quick Start for Testing

### Prerequisites
1. Production build available: `npm run build`
2. Preview server running: `npm run preview`
3. Application accessible at: `http://localhost:4173/`

### Test Execution Steps

1. **Start Development/Preview Server**
   ```bash
   npm run preview
   # Application will be available at http://localhost:4173/
   ```

2. **Open Browser to Test**
   - Navigate to `http://localhost:4173/`
   - Open browser DevTools (F12 or Cmd+Option+I)
   - Go to Console tab to monitor for JavaScript errors

3. **Follow Checklist**
   - Use `BROWSER_TESTING.md` checklist
   - Test each browser systematically
   - Document any issues found

---

## Detailed Test Scenarios

### Scenario 1: Home Screen & Mode Selection (2-3 minutes)
1. Load `http://localhost:4173/`
2. Verify page loads without errors
3. Check console for any errors or warnings
4. Click "Tutorial" button
5. Verify game starts with Tutorial mode
6. Go back to home screen (or restart page)
7. Click "Play" button
8. Verify game starts without strategic advice panel

**Expected Results:**
- Both buttons work and mode selection functions
- No console errors
- Game loads in appropriate mode

---

### Scenario 2: Game Initialization & UI Layout (3-5 minutes)
1. Start a game in Tutorial mode
2. Check poker table renders correctly with:
   - 4 player positions
   - Player names visible
   - Chip stacks displayed
   - Dealer button visible
3. Verify sidebar displays:
   - Cowboy narrator text
   - Strategic advice section
   - Action buttons (Fold, Call, Raise)
   - Action history log
4. Check main content area:
   - Pot display visible
   - Community cards area (empty or with cards as appropriate)
5. Verify music player is present

**Expected Results:**
- All UI elements render in correct positions
- No overlapping or hidden elements
- Text is readable
- Buttons are clickable

---

### Scenario 3: Single Hand Gameplay (5-10 minutes)
1. Play through one complete hand:
   - Pre-flop betting (user makes a decision)
   - Flop is revealed (3 cards)
   - Flop betting round
   - Turn is revealed (1 card)
   - Turn betting round
   - River is revealed (1 card)
   - River betting round
   - Showdown and winner announcement
   - Next hand starts

**Expected Results:**
- All cards display correctly at each stage
- Betting round actions work (Fold, Call, Raise)
- Showdown displays winner with explanation
- New hand starts automatically
- No console errors throughout

---

### Scenario 4: Animations & Responsiveness (2-3 minutes)
1. Watch card dealing animations
2. Watch chip betting animations
3. Watch showdown reveal animations
4. Resize browser window to test responsiveness:
   - Desktop size (1920x1080)
   - Tablet size (768px width)
   - Mobile size (375px width)
5. Verify all elements remain accessible and readable

**Expected Results:**
- Animations play smoothly without stuttering
- Layout adapts to window size
- All buttons remain clickable at all sizes
- No layout shifts that cause confusion

---

### Scenario 5: Extended Gameplay (5-10 minutes)
1. Play multiple hands (5-10 hands)
2. Monitor console for any errors
3. Watch for memory issues
4. Test various game scenarios:
   - User folds pre-flop
   - User calls all the way to showdown
   - User wins a hand
   - User loses a hand
   - All-in scenarios

**Expected Results:**
- Game remains stable over multiple hands
- No memory leaks
- Consistent behavior across different scenarios
- No console errors

---

### Scenario 6: Tutorial Mode Specific (3-5 minutes)
1. In Tutorial mode, verify:
   - Cowboy panel displays strategic advice
   - Advice updates based on hand strength
   - Action history shows all previous actions
   - Hand rankings reference is accessible
2. Verify guidance text is helpful and readable
3. Check that advice doesn't block gameplay

**Expected Results:**
- Strategic advice displays and updates correctly
- Text is readable and helpful
- Sidebar is non-blocking
- All information is accessible

---

### Scenario 7: Play Mode Specific (3-5 minutes)
1. In Play mode (no guidance), verify:
   - Cowboy panel is hidden or minimal
   - No strategic advice displayed
   - Core game mechanics still work
   - Action buttons still function
   - Showdown still displays winner

**Expected Results:**
- Play mode removes guidance as expected
- Game remains fully playable
- No errors when strategic advice is absent

---

## Browser-Specific Considerations

### Chrome/Edge (Chromium-based)
- DevTools Console and Performance tabs useful for debugging
- Same rendering engine, so very similar results expected
- CSS Grid and Flexbox fully supported

### Firefox
- Different JavaScript engine (SpiderMonkey)
- Some CSS features may render slightly differently
- DevTools also excellent for debugging

### Safari
- Some CSS properties need -webkit prefix
- Font rendering may look slightly different
- Touch interactions may differ on macOS trackpad

---

## Issues to Watch For

### Visual Issues
- Cards not displaying properly
- Text overlapping or cut off
- Buttons outside clickable area
- Layout shifts during animations
- Font rendering problems

### Functional Issues
- Button clicks not registering
- Animations freezing or not playing
- Game logic not executing correctly
- Console errors preventing functionality
- Memory usage growing excessively

### Responsive Design Issues
- Content hidden or inaccessible on smaller screens
- Horizontal scrolling on mobile
- Buttons too small to click
- Text too small to read

---

## Testing Checklist Summary

For each browser, complete:
1. ✅ Home screen loads and mode selection works
2. ✅ Game initializes with correct UI layout
3. ✅ One complete hand plays through without errors
4. ✅ Animations are smooth and responsive
5. ✅ Multiple hands play without instability
6. ✅ Tutorial mode guidance displays correctly
7. ✅ Play mode (no guidance) works correctly
8. ✅ Responsive design works at all window sizes
9. ✅ No console errors or warnings
10. ✅ Overall user experience is smooth

---

## Documentation

After testing each browser:
1. Note the browser version tested
2. Record test date and time
3. Document any issues found with:
   - Description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshot if possible
4. Update `BROWSER_TESTING.md` with results
5. If all tests pass, mark browser as ✅ PASSED

---

## Post-Testing

If all browsers pass:
1. Update `BROWSER_TESTING.md` with completion date
2. Mark task as complete in `plan.md`
3. Commit with message: `test(browser): Verify functionality across Chrome, Firefox, Safari, Edge`
4. Application is ready for deployment

If issues found:
1. Document issues in `BROWSER_TESTING.md`
2. Create bug fixes as needed
3. Re-test affected browsers after fixes
4. Document workarounds if issues cannot be fixed
