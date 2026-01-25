# Deployment Guide - Poker Pardner

This document provides instructions for deploying Poker Pardner to production.

## Build Verification

### Production Build
```bash
npm run build
```

**Expected Output:**
- Bundle size: ~200 KB (~60 KB gzipped)
- All assets compiled successfully
- No TypeScript errors

**Current Build Stats:**
- `dist/index.html`: 0.75 kB (gzipped: 0.41 kB)
- `dist/assets/index-*.css`: ~31 KB (gzipped: ~6 KB)
- `dist/assets/index-*.js`: ~200 KB (gzipped: ~61 KB)
- **Total**: Well under 500 KB target

### Local Testing
```bash
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

**Verification Checklist:**
- [ ] App loads without errors
- [ ] All fonts render correctly
- [ ] Background music plays (requires user interaction)
- [ ] Cards deal with animations
- [ ] Betting rounds complete successfully
- [ ] AI opponents make decisions
- [ ] Showdown displays correctly
- [ ] Hand rankings guide works
- [ ] Fold confirmation dialog appears for medium/strong hands
- [ ] Responsive design works on mobile viewport

---

## Deployment Platforms

### Option 1: Vercel (Recommended)

**Advantages:**
- Zero-config deployment for Vite apps
- Automatic HTTPS
- Global CDN
- Instant deployments
- Free tier available
- GitHub integration

**Steps:**

1. **Install Vercel CLI** (optional, for command-line deployment)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub** (recommended)
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration
   - Click "Deploy"

3. **Deploy via CLI**
   ```bash
   vercel
   ```
   - Follow prompts to link project
   - Vercel automatically detects build settings

**Build Configuration (auto-detected):**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:** None required

**Custom Domain:**
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

### Option 2: Netlify

**Advantages:**
- Simple drag-and-drop deployment
- Free tier with generous limits
- Form handling (if needed later)
- Netlify Functions (serverless backend if needed)

**Steps:**

1. **Deploy via GitHub**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select repository
   - Configure build settings (see below)
   - Click "Deploy site"

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify init
   netlify deploy --prod
   ```

3. **Deploy via Drag-and-Drop**
   - Run `npm run build` locally
   - Go to [netlify.com/drop](https://app.netlify.com/drop)
   - Drag the `dist` folder

**Build Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `18` (or latest LTS)

**netlify.toml** (optional, for advanced configuration):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages

**Advantages:**
- Free hosting for GitHub repositories
- Simple setup
- Good for open-source projects

**Limitations:**
- Requires repository to be public (for free tier)
- Slightly more complex routing setup

**Steps:**

1. **Install gh-pages package**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   Add to `scripts`:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

   Add `homepage` field (replace with your repository name):
   ```json
   "homepage": "https://username.github.io/poker-pardner"
   ```

3. **Update vite.config.ts**
   Add base path:
   ```typescript
   export default defineConfig({
     base: '/poker-pardner/', // Replace with your repo name
     plugins: [react()],
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` (root)
   - Save

**Note:** If using a custom domain, create a `public/CNAME` file with your domain.

---

### Option 4: Cloudflare Pages

**Advantages:**
- Excellent global CDN
- Unlimited bandwidth
- Fast builds
- Free tier available

**Steps:**

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up/login
3. Create a new project
4. Connect to GitHub repository
5. Configure build:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Deploy

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing: `npm test`
- [ ] No console.log statements in production code
- [ ] TypeScript strict mode compliance: `npm run build` succeeds
- [ ] No unused dependencies

### Assets
- [ ] Favicon exists (currently using `/vite.svg` - consider replacing)
- [ ] Open Graph image created (`/public/og-image.png`, 1200x630px recommended)
- [ ] Background music file exists (`/public/audio/background-music.mp3`)

### SEO & Meta Tags
- [x] Title tag set
- [x] Description meta tag
- [x] Open Graph tags (og:title, og:description, og:image, og:url)
- [x] Twitter card tags
- [x] Keywords meta tag
- [x] Theme color set

### Performance
- [x] Bundle size < 500 KB (currently ~200 KB)
- [ ] Images optimized (if any added)
- [x] Fonts loading efficiently (using preconnect)
- [x] CSS/JS minified in production build

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Functionality Testing
- [ ] Game starts correctly
- [ ] All betting rounds work
- [ ] AI makes decisions
- [ ] Showdown awards pot correctly
- [ ] Dealer button rotates
- [ ] Player elimination works
- [ ] Background music plays/pauses
- [ ] Hand rankings guide opens/closes
- [ ] Fold confirmation dialog works
- [ ] Responsive design on mobile

---

## Post-Deployment

### Verification
After deployment, verify the following:

1. **Load Testing**
   - Visit the deployed URL
   - Check browser console for errors
   - Verify all assets load (Network tab)

2. **Social Sharing**
   - Test Open Graph tags: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Test Twitter cards: [Twitter Card Validator](https://cards-dev.twitter.com/validator)

3. **Lighthouse Audit**
   - Run Lighthouse in Chrome DevTools
   - Target scores: Performance 90+, Accessibility 90+, Best Practices 90+, SEO 90+

4. **Mobile Testing**
   - Test on real iOS device
   - Test on real Android device
   - Verify touch interactions work
   - Check responsive layout

### Monitoring

**Recommended Tools:**
- Google Analytics (optional, privacy-conscious setup)
- Sentry (error tracking)
- Vercel/Netlify Analytics (built-in)

### Custom Domain Setup

**DNS Configuration:**
If using a custom domain, add these DNS records (example for Vercel):

```
Type  Name  Value
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

Check your hosting platform's documentation for specific DNS values.

---

## Continuous Deployment

### Automatic Deployments
Most platforms (Vercel, Netlify, Cloudflare Pages) support automatic deployments:

1. Push to `main` branch → automatic production deployment
2. Push to `develop` branch → preview deployment
3. Pull requests → preview deployments with unique URLs

### Manual Deployments
If needed, trigger manual deployments:

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**GitHub Pages:**
```bash
npm run deploy
```

---

## Rollback Procedure

### Vercel
- Go to Deployments tab
- Find previous successful deployment
- Click "..." → "Promote to Production"

### Netlify
- Go to Deploys tab
- Find previous deployment
- Click "Publish deploy"

### GitHub Pages
```bash
git revert HEAD
git push origin main
npm run deploy
```

---

## Troubleshooting

### Build Fails

**Issue:** TypeScript errors
```bash
npm run build
```
Fix TypeScript errors shown in output.

**Issue:** Missing dependencies
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Assets Not Loading

**Issue:** 404 errors for assets
- Check `base` path in `vite.config.ts` matches deployment URL
- For GitHub Pages, ensure base path is `/repository-name/`
- For Vercel/Netlify, base path should be `/`

### Background Music Not Playing

**Issue:** Audio doesn't play automatically
- This is expected browser behavior
- Audio requires user interaction to start
- Verify play/pause button works

### Fonts Not Loading

**Issue:** Fonts not rendering
- Check Google Fonts links in `index.html`
- Verify preconnect tags are present
- Check browser console for CORS errors

---

## Security Considerations

### HTTPS
All recommended platforms provide free HTTPS by default.

### Content Security Policy (Optional)
Add to `index.html` if needed:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
```

### Headers (Optional)
Add via platform configuration (e.g., `netlify.toml` or Vercel config):
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Future Enhancements

### Analytics Setup
When ready to add analytics:
1. Create Google Analytics 4 property
2. Add tracking script to `index.html` (in production only)
3. Track custom events (hands played, game completed, etc.)

### Error Monitoring
Consider adding Sentry:
```bash
npm install @sentry/react
```

Configure in `src/main.tsx`.

### Performance Monitoring
- Use Vercel/Netlify analytics (built-in)
- Monitor Core Web Vitals
- Set up performance budgets

---

## Cost Estimate

**Free Tier Limits (as of 2026):**
- **Vercel:** 100GB bandwidth/month, unlimited projects
- **Netlify:** 100GB bandwidth/month, 300 build minutes/month
- **GitHub Pages:** 100GB bandwidth/month, 100GB storage
- **Cloudflare Pages:** Unlimited bandwidth, 500 builds/month

For this app (200 KB per load), free tiers support:
- ~500,000 page views/month on Vercel/Netlify
- Unlimited on Cloudflare Pages

---

## Support

### Documentation
- Vite: https://vitejs.dev/guide/
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com/
- GitHub Pages: https://docs.github.com/en/pages

### Project Files
- `spec.md` - Original specification
- `CLAUDE.md` - Project context for AI assistance
- `plan.md` - Development roadmap

---

**Last Updated:** January 25, 2026
**Status:** Ready for Production Deployment
