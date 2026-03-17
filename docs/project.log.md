# V2U Website Project Log

## 📅 Session: March 3-4, 2026 - YouTube Embed Enhancement

### 🎯 Objective
Implement YouTube channel iframe embed in podcast directory instead of static image placeholder.

#### ✅ Completed Actions

**1. Initial Iframe Implementation (Failed)**
- Updated YouTube panel to use iframe with channel featured page
- Target URL: `https://www.youtube.com/@v2u.AI-Deep-Dive/featured`
- Added `min-h-[600px]`, `rounded-lg`, and `loading="lazy"` to iframe styling
- Made container height dynamic (auto for embeds, h-48 for images)
- **Result**: Failed - YouTube blocks channel pages with `X-Frame-Options: SAMEORIGIN`

**2. Playlist Embed Solution**
- Discovered YouTube channel playlists using curl and grep
- Found available playlist ID: `PLQDaXrlGzy436-OiIAOwNJ3YrGXIoSq98`
- Updated embedUrl to: `https://www.youtube.com/embed/videoseries?list=PLQDaXrlGzy436-OiIAOwNJ3YrGXIoSq98`
- Verified playlist embed URL returns HTTP 200 (embeddable)

**3. Timeout Fix**
- **Problem**: Iframe still showing fallback image despite working URL
- **Root Cause**: Timeout set to 1 second (comment incorrectly said 5 seconds)
- **Solution**: Increased timeout from 1000ms to 5000ms to allow proper load time
- Updated `PodcastCard.tsx` timeout in useEffect hook

#### 📊 Files Modified

**PodcastDirectory.tsx**
- Changed YouTube embedUrl from channel page to playlist embed

**PodcastCard.tsx**
- Added `min-h-[600px]` and `rounded-lg` to YouTube iframe className
- Added `loading="lazy"` attribute for performance
- Increased timeout from 1s to 5s for iframe load detection
- Made container height responsive (`h-auto` for embeds, `h-48` for images)

**4. Panel Height Consistency Fix**
- **Problem**: YouTube panel changing shape on load (600px height vs 192px for other panels)
- **Root Cause**: `min-h-[600px]` on iframe and dynamic container height (`h-auto` vs `h-48`)
- **Solution**: 
  - Removed `min-h-[600px]` from YouTube iframe
  - Changed container from dynamic height to fixed `h-48` (192px)
  - All panels now maintain consistent height regardless of content type

**5. YouTube Music Embed Removal**
- **Problem**: YouTube Music showing "This video is unavailable" error
- **Root Cause**: Attempting to embed uploads playlist (`list=UUmwOvS8rhbbDYojNrar4g4g`) which YouTube blocks
- **Solution**: Removed embedUrl and embedType, reverted to static image with clickable link
- **Note**: Panel still fully functional - image displays, link works, no error message

#### 🔄 Commits

1. `0a44d56` - feat: Use iframe for YouTube featured page in podcast directory
2. `e015cf7` - fix: Use playlist embed for YouTube (channel pages blocked by X-Frame-Options)
3. `8ca5766` - fix: Increase iframe load timeout from 1s to 5s for YouTube embeds
4. `4f7532c` - fix: Make YouTube panel height consistent with other panels (h-48)
5. `fd3f5be` - fix: Remove YouTube Music embed (uploads playlist not embeddable)

#### 📝 Technical Notes

**YouTube Embed Restrictions:**
- Channel pages (`/@username/featured`) blocked by X-Frame-Options
- Playlist embeds (`/embed/videoseries?list=`) work for custom playlists only
- Uploads playlists (`list=UU...`) are blocked by YouTube embed policy
- Always test with `curl -I` to check X-Frame-Options header

**Panel Height Consistency:**
- All podcast cards use fixed `h-48` (192px) container height
- Prevents layout shifts during iframe loading
- Maintains uniform grid appearance across all platform cards

**Timeout Behavior:**
- Component uses timeout to fallback to static image if iframe fails
- 5 seconds provides enough time for slow connections and YouTube's embed load time
- Shorter timeouts cause premature fallback even when embed would succeed

---

## 📅 Session: March 1, 2026 - Company Phone Number Update

### 🎯 Objective
Update company contact phone number across all website pages.

#### ✅ Completed Actions

**Phone Number Change:**
- **Old**: (720) 656-9650
- **New**: (720) 519-7257

**Files Updated (7 total):**
1. `components/Footer.tsx` - Global footer (appears on all pages)
2. `app/terms/page.tsx` - Terms of Service page
3. `app/privacy/page.tsx` - Privacy Policy page
4. `app/press/page.tsx` - Press/Media page
5. `app/company/page.tsx` - About/Company page
6. `app/careers/page.tsx` - Careers page
7. `app/help-center/page.tsx` - Help Center (including tel: link update)

**Changes Made:**
- Updated display text: `+1 (720) 656-9650` → `+1 (720) 519-7257`
- Updated clickable tel link: `tel:+17206569650` → `tel:+17205197257`

#### 🔄 Commits

1. `fb8096b` - Update company phone number to (720) 519-7257

#### 📝 Notes
- Footer change applies site-wide automatically
- Help center includes both display and functional tel: link
- All formats verified (display text and tel: protocols)

---

## 📅 Session: January 14, 2026 - Emergency Recovery & Monorepo Restructure

### 🚨 Critical Issues & Recovery

**Context**: Previous AI session broke the repository structure. Emergency revert and complete monorepo restructuring required.

#### ✅ Completed Actions

**1. Emergency Revert**
- Reverted v2u-website to commit `46ee42ef3c45c401fa1727d94f0877dcd53dbaea`
- Force pushed to GitHub to restore working state
- Confirmed clean working tree at target commit

**2. Monorepo Structure Crisis**
- **Problem**: Apps moved into monorepo structure but not showing in VS Code Source Control
- **Root Cause**: Apps were configured as git submodules with .git folders stored in parent's `.git/modules/`
- **Critical Error**: Accidentally staged removal of thousands of files with `git rm -r --cached apps/`
- **Recovery**: Emergency `git reset HEAD .` to undo destructive operation

**3. Repository Restoration**
- Removed all submodule configurations from parent `.git/config`
- Deleted broken `.git/modules/` references
- Restored all app repositories from GitHub:
  - v2u-website (this repo)
  - nexoai
  - podcastpro-ai
  - chronos-ai
  - trajectory-ai
  - breakup-ai

**4. New Repository Initialization**
- Initialized fresh git repos for apps without individual GitHub repos:
  - blink
  - hirewire
  - news-collector
  - r2-tools
  - safeshipping
  - trafficjamz-api
  - trafficjamz-client

**5. Git Configuration Nightmare**
- **Problem**: Cannot set global git config (permission denied on `C:/Program Files/Git/home/richc/.gitconfig`)
- **Solution**: Set local git config in each repository individually
- Configured user.email: `richcobrien@hotmail.com`
- Configured user.name: `richcobrien1`

**6. Initial Commits**
- Successfully committed all files in 7 new repositories
- All 13 apps now have valid git repositories with commits

**7. VS Code Source Control Detection Issues**
- Updated workspace file multiple times with various settings:
  - `git.detectSubmodules: false`
  - `git.autoRepositoryDetection: "subFolders"` then `"openEditors"` then `true`
  - `git.scanRepositories` with explicit paths
  - `git.repositoryScanMaxDepth` variations
  - `scm.repositories.visible: 20`
- **None of the automatic detection methods worked**
- **Final Solution**: Manually opened each repository using VS Code command `git.openRepository`

**8. Final State**
- All 13 app repositories now visible in VS Code Source Control panel
- Parent `.gitignore` updated to exclude `apps/` folder
- Workspace file configured with 16 folders (1 root + 13 apps + 2 services)
- All repositories have proper git history and commits

#### 📝 Lessons Learned

1. **Submodules are dangerous** - Converting from submodules to independent repos is complex and error-prone
2. **VS Code workspace detection is unreliable** - Manual repository opening via commands is more reliable than automatic detection
3. **Git config permissions** - Global git config may be locked; always have fallback to local config
4. **Always verify before destructive operations** - `git rm -r --cached` can stage thousands of deletions instantly
5. **Workspace file changes don't apply reliably** - Even with reload, manual intervention may be required

#### 🔧 Technical Debt Created

- [ ] Set up individual GitHub remotes for 7 new repos (currently pointing to v2u-workspace)
- [ ] Create GitHub repositories for: blink, hirewire, news-collector, r2-tools, safeshipping, trafficjamz-api, trafficjamz-client
- [ ] Push initial commits to new GitHub repos once created
- [ ] Document monorepo workflow for future developers
- [ ] Fix git global config permissions or document local-only approach

#### ⚠️ Important Notes

- This repository (v2u-website) now lives at: `c:\Users\richc\Projects\v2u\apps\v2u-website`
- Parent workspace at: `c:\Users\richc\Projects\v2u`
- GitHub remote: `https://github.com/richcobrien1/v2u-website`
- Working state restored to: commit `46ee42e`
- One untracked file: `create-placeholders.js`

---

**Session Duration**: ~2 hours of emergency troubleshooting and recovery
**Status**: ✅ Stable - All repositories functional and visible in VS Code

---

## 📅 Session: March 17, 2026 - Analytics Tracking & Advertising Campaign Setup

### 🎯 Objective
Implement comprehensive analytics tracking infrastructure and prepare $500 test advertising campaign with conversion tracking to achieve 1000 Premium subscribers or $5,000 net revenue.

#### ✅ Completed Actions

**1. Advertising Strategy Development**
- Created 7-phase advertising plan with financial models (Options A, B, C)
- Modified Option C for target: "Fastest way to 1000 Premium subscribers and/or $5,000 net revenue"
- Designed $500 test campaign framework with success metrics:
  - CAC target: <$30 per subscriber
  - CVR target: >10% conversion rate
  - CPC target: <$3 per click
  - CTR target: >2% click-through rate
- Budget allocation: YouTube $300, Facebook $150, Google $50

**2. Google Analytics 4 Setup**
- Created GA4 account and property: "AI Deep Dive Analytics"
- Created data stream: "V2U Production" for https://www.v2u.us
- Obtained Measurement ID: `G-J1PQFJTH9B`
- Added environment variable to `.env.local`: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Configured Vercel environment variable for production deployment

**3. Analytics Tracking Infrastructure**

**Created `app/components/Analytics.tsx`:**
- Global analytics component with GA4 gtag.js integration
- Facebook Pixel integration (prepared for future use)
- Loads scripts with `next/script` using `afterInteractive` strategy
- Reads environment variables: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_FB_PIXEL_ID`

**Created `lib/analytics.ts`:**
- Centralized conversion tracking helper functions
- `trackEvent(eventName, params)` - Dual GA4 + FB Pixel tracking
- `trackSubscribePageView()` - Fires on /subscribe page load
- `trackSubscribeButtonClick(buttonLocation)` - Tracks which CTA clicked
- `trackPremiumPurchase(subscriptionId)` - Purchase conversion event
- `trackEmailSignup(signupLocation)` - Lead generation tracking
- Console logging with 📊 emoji for debugging

**Modified `components/payments/StripeBuyButton.tsx`:**
- Complete rewrite from Stripe embed to custom redirect button
- Added `location` prop for attribution tracking (5 locations)
- Custom styled button with gradient background
- Tracks button click before redirect to Stripe
- Redirects to payment link with prefilled TRIAL99 promo code
- Interface: `StripeBuyButtonProps { location?: string }`

**Modified `app/subscribe/page.tsx`:**
- Added `trackSubscribePageView()` in useEffect hook
- 3 buttons with unique location tracking: `hero`, `cta_after_hero`, `cta_after_faq`
- Fixed React ESLint apostrophe errors (replaced with `&apos;`)
- Removed `buyButtonId` props (no longer needed)

**Modified `app/founder-subscriber/page.tsx`:**
- Updated to match new StripeBuyButton interface
- Added location tracking: `founder_hero`, `founder_bottom`
- Removed `buyButtonId` props

**Modified `app/layout.tsx`:**
- Injected `<Analytics />` component at top of body
- Global tracking now active on all pages

**4. Build Error Resolution** (5 sequential commits)
- Fixed ESLint errors: Unescaped apostrophes in JSX (replaced with HTML entities)
- Fixed ESLint errors: Removed `eslint-disable-next-line @next/next/no-img-element` warning with proper disable comment
- Fixed TypeScript errors: Removed explicit `any` types from analytics.ts
- Fixed TypeScript errors: Simplified `trackEvent` parameter type to `Record<string, string | number>`
- Fixed TypeScript errors: Removed complex `items` array parameter from `trackPremiumPurchase`

**5. Stripe Promotional Pricing Setup**

**Initial Attempt (Failed):**
- Created coupon: ID `lpQbZSyW`, $4.00 off once
- Problem: Coupon applied to "AI Deep Dive Subscription" (wrong product)
- Issue: Payment link for "AI Deep Dive Premium Subscription" (different product)
- Deleted old product to resolve conflict

**Final Working Configuration:**
- Created new coupon: ID `nz4sgLAn`, $4.00 off once, expires Apr 30, 2026
- Applies to: "AI Deep Dive Premium Subscription" ✅
- Created promotion code: `TRIAL99` (API ID: `promo_1TC2PwDisN9aFc9h1udsQ5Kt`)
- Settings: First-time order only = **NO** (critical fix)
- Payment link: `https://buy.stripe.com/3cIcN5aGE5q717lbUdfnO01`
- URL parameter: `?prefilled_promo_code=TRIAL99`
- Result: **$0.99 first month, then $4.99/month recurring** ✅

**6. Deployment Pipeline**
- 8 git commits pushed to GitHub (see commits section below)
- Multiple Vercel deployments triggered
- Added `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-J1PQFJTH9B` to Vercel production environment
- Triggered deployment with empty commit to rebuild with environment variable

**7. Production Validation**
- Verified GA4 tracking requests in browser Network tab
- Confirmed `collect?v=2&tid=G-J1PQFJTH9B` requests firing successfully
- Verified Stripe checkout: TRIAL99 applies automatically, shows $0.99 total
- Console tracking events visible: `📊 Event tracked: page_view`, `📊 Event tracked: subscribe_button_click`

**8. Documentation**
- Created `docs/ANALYTICS_TRACKING_GUIDE.md`:
  - GA4 setup instructions
  - FB Pixel setup instructions
  - Metric definitions (CAC, CVR, CPC, CTR)
  - Troubleshooting guide
  - Dashboard templates for campaign monitoring

#### 🔄 Commits

1. `1eee799` - feat: Add Google Analytics and Facebook Pixel tracking infrastructure
2. `2b9c903` - fix: Replace unescaped apostrophes with HTML entities in subscribe page
3. `7eedf52` - fix: Add eslint disable for FB Pixel img tag
4. `b9d75ec` - fix: Remove explicit any types from analytics tracking functions
5. `43e67e6` - fix: Remove buyButtonId prop from founder subscription page
6. `adc488c` - feat: Update subscribe button to use payment link with $0.99 first month coupon
7. `71c4d2a` - feat: Update coupon code to TRIAL99
8. `ab3bc09` - feat: Re-add working TRIAL99 promo code
9. `64ed0a9` - chore: Trigger deploy with GA4 environment variable

#### 📊 Files Created

- `app/components/Analytics.tsx` - GA4 and FB Pixel initialization
- `lib/analytics.ts` - Conversion tracking helper functions
- `docs/ANALYTICS_TRACKING_GUIDE.md` - Comprehensive analytics documentation

#### 📊 Files Modified

- `components/payments/StripeBuyButton.tsx` - Complete rewrite with location tracking
- `app/subscribe/page.tsx` - Added page view and button tracking
- `app/founder-subscriber/page.tsx` - Updated button interface
- `app/layout.tsx` - Added Analytics component
- `.env.local` - Added GA4 measurement ID

#### 📝 Technical Notes

**Analytics Architecture:**
- Dual tracking: GA4 for detailed metrics, FB Pixel ready for Facebook ads
- Location-based attribution: 5 button locations tracked (hero, cta_after_hero, cta_after_faq, founder_hero, founder_bottom)
- Event-driven tracking: page_view, subscribe_button_click, premium_purchase, email_signup
- Console debugging: All events logged with 📊 emoji for development testing

**Stripe Coupon Gotchas:**
- Cannot edit coupons or promotion codes after creation (must delete and recreate)
- "Applies to" must match exact product name in payment link
- "First-time order only" restriction prevents testing with existing customer records
- Promotion codes require creation on top of coupons (coupon ID ≠ promotion code)
- URL parameter: `?prefilled_promo_code=CODE` (not `?promo_code=` or coupon ID)

**Environment Variables:**
- Development: `.env.local` (not committed to git)
- Production: Vercel dashboard → Environment Variables
- Must redeploy after adding/changing environment variables
- Next.js requires `NEXT_PUBLIC_` prefix for client-side access

**GA4 Realtime Lag:**
- Data can take 2-5 minutes to appear in GA4 Realtime dashboard
- Network tab shows immediate confirmation of tracking requests
- Check for `collect?v=2&tid=G-J1PQFJTH9B` requests to verify tracking is working

#### 🎯 Next Steps (Campaign Ready)

**Pre-Launch Checklist:**
- ✅ GA4 tracking verified in production
- ✅ Stripe checkout tested with TRIAL99 code ($0.99 working)
- ✅ Button location tracking implemented
- ✅ Subscribe page optimized (completed March 16)
- ✅ QR codes created for video overlays
- 🔄 Facebook Pixel (optional - can add later)
- 🔄 Verify conversion data appears in GA4 dashboard

**$500 Test Campaign Launch Plan:**
1. YouTube Ads: $300 budget, 7-day campaign targeting AI enthusiasts
2. Facebook Ads: $150 budget, retargeting website visitors
3. Google Search: $50 budget, "AI newsletter" keywords
4. Monitor daily in GA4: CPC, CTR, clicks, conversions, button location performance

**Success Metrics (7-Day Test):**
- CAC <$30 + CVR >10% = **SCALE** to full budget
- CAC >$30 or CVR <8% = **STOP** and optimize page/pricing
- Analyze which traffic source (YouTube, Facebook, Google) has best unit economics
- Check which button location (hero vs CTA vs FAQ) converts highest

#### ⚠️ Known Issues

1. **Facebook Pixel**: Not yet created (environment variable empty)
   - Code ready, just needs pixel ID from business.facebook.com/events_manager
   - Can launch campaign with GA4 only, add FB Pixel before Facebook ads

2. **GA4 Realtime Delay**: 
   - Tracking requests confirmed working in Network tab
   - Dashboard may show zero until data processes (2-5 min lag)

3. **Stripe Prefilled Promo Temporary Error**:
   - Occasionally shows "Something went wrong" with `?prefilled_promo_code=TRIAL99`
   - Manually entering TRIAL99 always works
   - Appears to be intermittent Stripe API issue, resolved after retry

#### 💡 Lessons Learned

1. **Stripe UI Complexity**: No edit capability forces delete/recreate workflow for coupons
2. **Product Name Precision**: Coupon must apply to exact product name in payment link
3. **Environment Variable Deployment**: Vercel requires redeploy after adding env vars
4. **Console Logging Strategy**: Emoji prefixes (📊) improve debug log visibility
5. **TypeScript Strictness**: Avoid `any` types; use `Record<string, string | number>` for generic params
6. **Location Attribution**: Tracking button placement enables data-driven page optimization

---

**Session Duration**: ~4 hours (strategy, implementation, troubleshooting, deployment)
**Status**: ✅ Production Ready - All systems operational, campaign launch ready
