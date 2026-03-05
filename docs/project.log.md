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

#### 🔄 Commits

1. `0a44d56` - feat: Use iframe for YouTube featured page in podcast directory
2. `e015cf7` - fix: Use playlist embed for YouTube (channel pages blocked by X-Frame-Options)
3. `8ca5766` - fix: Increase iframe load timeout from 1s to 5s for YouTube embeds

#### 📝 Technical Notes

**YouTube Embed Restrictions:**
- Channel pages (`/@username/featured`) blocked by X-Frame-Options
- Playlist embeds (`/embed/videoseries?list=`) are allowed
- Always test with `curl -I` to check X-Frame-Options header

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
