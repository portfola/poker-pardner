# Branding Assets To-Do

The following branding assets should be created before final production deployment:

## 1. Favicon
**Current Status:** Using default Vite SVG (referenced but file missing)
**Location:** `/public/favicon.ico` or `/public/favicon.svg`
**Requirements:**
- 32x32 pixels minimum
- Should reflect poker/western theme
- Common formats: `.ico`, `.svg`, or `.png`

**Quick Options:**
- Create a simple poker chip icon
- Use playing card suit (spade, heart, etc.)
- Western star badge design

## 2. Open Graph Image
**Current Status:** Referenced in meta tags but not created
**Location:** `/public/og-image.png`
**Requirements:**
- Dimensions: 1200x630 pixels (Facebook/LinkedIn recommended)
- Format: PNG or JPG
- File size: Under 1 MB
- Content: App name, tagline, visual representation of poker table

**Suggested Content:**
- Title: "Poker Pardner"
- Subtitle: "Learn Texas Hold'em Poker"
- Background: Western-themed or poker table green
- Graphics: Playing cards, poker chips, or table illustration

## 3. Twitter Card Image (Optional)
**Current Status:** Sharing og-image.png with Open Graph
**Alternative Location:** `/public/twitter-image.png`
**Requirements:**
- Dimensions: 1200x600 pixels (2:1 ratio)
- Format: PNG or JPG
- Similar to og-image but optimized for Twitter's display

## Implementation

Once assets are created:

1. **Favicon:**
   ```html
   <!-- Update in index.html -->
   <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
   <!-- Or for ICO: -->
   <link rel="icon" type="image/x-icon" href="/favicon.ico" />
   ```

2. **Open Graph Image:**
   - Place file at `/public/og-image.png`
   - Meta tags already configured in `index.html`
   - Update URL in meta tags if using custom domain

3. **Test Social Sharing:**
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

## Design Resources

**Free Tools:**
- Canva (https://canva.com) - Templates for social media images
- Figma (https://figma.com) - Professional design tool
- Favicon.io (https://favicon.io) - Generate favicons from text/emoji
- RealFaviconGenerator (https://realfavicongenerator.net) - Comprehensive favicon generator

**Asset Ideas:**
- Playing cards (Ace of Spades)
- Poker chips with "PP" monogram
- Western sheriff badge with card suits
- Minimalist poker table illustration
- Combination of cards + chips + western theme

## Current Workaround

The app is functional without these assets, but social sharing and browser tabs will show:
- Default Vite logo (or missing icon)
- Generic link previews without custom imagery

For initial deployment, this is acceptable. For production marketing, custom branding is recommended.

---

**Priority:** Medium (functional without, but improves professionalism)
**Effort:** 1-2 hours (design and implementation)
**Status:** To-Do
