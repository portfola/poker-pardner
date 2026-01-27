# Poker Pardner - Development Roadmap

## Pre-Production & Deployment

- [ ] Post-deployment verification - Load testing, social sharing test, Lighthouse audit
  - BLOCKED: Requires application to be deployed first. Need deployment configuration and hosting setup.
- [x] Set up analytics - PostHog integration for user tracking and insights (2026-01-26)
- [ ] Create terraform infrastructure and Github Action for production deployment on AWS using S3 and Cloudfront, with Route53 DNS setup on domain poker.portfola.net. Consider whether other infrastructure is necessary and act accordingly.

## Performance Testing
- [x] Test with 100+ consecutive hands (2026-01-26)
- [x] Test hand integrity to ensure that game proceeds properly through each stage in order. (2026-01-26)
- [x] Test memory usage over extended gameplay. (2026-01-26)
- [ ] Test animation performance on low-end devices.

## Action Panel UI
- [ ] Update and combine the two text areas showing the cowboy's words. For example, "So, Annie throws their cards away - they're out of this hand." should be combined with "With a decent hand, it ain't worth chasin'. Better to wait for a better spot." These should appear in the same section as part of a single paragraph, so that we can conserve vertical space.
- [ ] Give the container for the cowboy text the appearance of a cartoon speech bubble, making it clear that they cowboy is saying these words. Use CSS animation to inflate the speech bubble on entry and deflate it on exit.
- [ ] Move the slider for raise amount to the right of the action buttons. Keep it small and simple, not fine-grained to precise amounts. Use a widge range with a maximum of 5 options for raise amounts.
- [ ] Keep the Hand Strength module visible even when it is not the user's turn.
- [ ] Move the game status box (pre-flop, flop, etc) to the top of the right-side column of the action panel. Below it comes the Hand Strength box, then the Hand Rankings icon.
- [ ] In the Hand Strength box, adjust the type so that it fits better. Left-justify the text and use a sans-serif font with a slightly larger size. Title the box "Your Hand".

## Cowboy Voice Narration
- [ ] Add ElevenLabs integration to use text-to-speech 
- [ ] Have the Cowboy speak out loud, so the user doesn't have to read the text

## Sound Effects
- [ ] Audio utility - Create `src/utils/audio.ts` for audio management
- [ ] Sound files - Add sound effects to `public/audio/` (deal, bet, fold, win, ambiance)
- [ ] Sound integration - Wire up sounds to game events
- [ ] Sound toggle - Add on/off setting

## Hand History Review
- [ ] Hand history utility - Create `src/utils/handHistory.ts` to track and store hands
- [ ] Hand history types - Create `src/types/handHistory.ts`
- [ ] Hand history screen - Create `src/components/HandHistoryScreen.tsx` showing last 10 hands