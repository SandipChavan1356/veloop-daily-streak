# VELoop Daily Streak — Frontend

React + Vite frontend for the VELoop Rewards Daily Streak feature. Dark/purple/gold gamified theme, fully responsive (320px → 1920px+), talks to the [backend](../veloop-daily-streak-backend) over the documented REST API — **zero business logic lives here**: every day/streak/timer/reward value is displayed exactly as the backend returns it.

## Run it
```bash
npm install
cp .env.example .env      # point VITE_API_URL at your running backend
npm run dev                # http://localhost:5173
```
Log in with the backend's seeded demo user (`demo@veloop.test` / `Demo@1234`) or register a new account from the UI.

## What's built
- **Auth**: Login / Register (JWT stored client-side, attached to every request, auto-logout on 401)
- **Daily Streak page**: branded loader → skeleton → full page, sticky header with live gem balance, hero banner, 3-stat row, Ultimate Reward showcase (animated crown), 7-card reward grid with all states (Locked / Today+Available / Claimed), server-time-anchored countdown, CPA "Preparing your reward…" demo step, Why-Streak benefits, trust footer
- **Claim flow**: `initiate → CPA demo (visual only) → claim → refresh from backend` — mirrors the doc's required flow exactly; nothing is applied optimistically before the backend confirms it
- **Error handling**: every backend error code (`LOCKED`, `ALREADY_CLAIMED`, `DAY_MISMATCH`, session errors, etc.) maps to a plain-language toast, then the UI re-syncs from the server
- **Custom animated reward art**: coin stack, gift box, gift card, crown — built as inline SVG/CSS (float, glow, spin), not static images, since the actual Drive assets weren't accessible to this build (see note below)

## Design system
Tokens in `src/theme.css`. Sora (display/numbers) + Inter (body) from Google Fonts. One deliberate hero moment — the floating/glowing Ultimate Reward crown — everything else (cards, stats) stays deliberately quiet: state is shown via a left accent bar + border color, not a stacked-shadow card kit.

## A note on the original design assets
The Google Drive folder linked in the brief couldn't be opened from this environment (Drive's file listing needs an authenticated browser session, which isn't available here). The desktop and mobile screenshots embedded in the assignment PDF were used as the visual source of truth instead — colors, typography, layout composition, and card states are reproduced closely from those. Icons/illustrations were rebuilt as animated inline SVG rather than the original PNG/AI files.

**If you get the real Drive assets**, drop them in `src/assets/` and swap the relevant `<CoinStack />` / `<GiftBox />` / `<GiftCardArt />` / `<CrownArt />` calls in `src/components/icons/RewardArt.jsx` for `<img>` tags — everything else (states, layout, animation hooks) stays the same.

## Structure
```
src/
├── theme.css                   # design tokens
├── App.jsx, main.jsx
├── context/                    # AuthContext (JWT), ToastContext
├── hooks/useServerCountdown.js # server-time-anchored countdown (device clock can't fool it)
├── services/                   # api.js (axios + interceptors), authApi.js, streakApi.js
├── router/ProtectedRoute.jsx
├── pages/
│   ├── Auth/                   # Login, Register
│   └── DailyStreak/DailyStreakPage.jsx   # orchestrates fetch/claim/error states
└── components/
    ├── DailyStreak/            # Header, HeroBanner, Stats, UltimateReward, RewardGrid,
    │                            # RewardCard, CpaDemo, Loader, Skeleton, WhyStreak, TrustFooter
    ├── common/                 # Button, Toast, ErrorState
    └── icons/RewardArt.jsx     # animated SVG reward art
```

## Verified
- `npm run build` — clean production build
- `npm run lint` (oxlint) — 0 errors
- Headless render smoke test (jsdom) — every component tree renders without runtime errors across all reward states (claimed/available/locked/today), including the countdown timer path
- **Not verified**: this sandbox has no browser, so no visual screenshot/pixel comparison against the design was possible, and no live end-to-end run against a real backend + MongoDB. Run `npm run dev` alongside the backend and click through the full claim flow before treating this as final.

## Responsive breakpoints
320 · 480 · 640 · 720 · 900 · 1024+ — single column on mobile (2-col reward grid), 3–4 col grid on tablet, sticky two-pane layout (stream + Ultimate Reward rail) from 900px up.

---

## Redesign notes (Daily Streak v2)

**New pages** (inside `AppShell` with sidebar / mobile bottom-nav): Dashboard, Rewards, Achievements, Milestones, Activity, Leaderboard, Profile, Settings. The focused `/daily-streak` page has its own header, hero banner, journey rail, 7 reward cards, ultimate reward panel, claim reveal modal and CPA demo.

**Backend-authoritative:** the UI only renders backend state (server-time countdowns, `claim/initiate` -> `claim` -> full refetch, no optimistic updates).

**Assets:** drop real artwork into `public/assets/rewards/` as `coin`, `gift-box`, `gift-card`, `crown`, `calendar` (`.png/.webp/.gif/.svg/.jpg`). If absent, animated inline SVG art is used. See the README in that folder.

**Dev time-travel demo:** set `VITE_ENABLE_DEV_TOOLS=true` (frontend) and `ENABLE_DEV_TOOLS=true` (backend) to get the flask button for skipping time.

**New API used:** `GET /api/insights/{overview,achievements,milestones,activity,leaderboard}`.

**Verification honesty:** built/screenshotted in an esbuild sandbox with a mock API (npm registry was unavailable). Please run `npm install && npm run dev` with the real backend and click through the full flow.
