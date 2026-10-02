# VELoop Daily Streak — "The Trail" redesign (v2)

Setup: `npm install` (new deps: @fontsource-variable/{bricolage-grotesque,figtree,jetbrains-mono}) then `npm run dev`.

## Untouched (backend / auth / logic)
src/services/*, AuthContext, StreakDataContext, ProtectedLayout, hooks, claim flow (initiate -> claim), timers, CPA gate.
DailyStreakPage keeps its phase/claim/timer logic verbatim; only imports + render tree changed.

## New composition
- Stage (no cards): identity column · StreakCore (7-segment energy ring + flame + live number) · TodayDrop (free-floating reward + claim / countdown)
- StreakJourney: 7 nodes on an S-curve trail (horizontal >=720px container, zig-zag vertical on phones). Hover/focus/tap a node -> inspector.
- RewardVault: flat ledger (Secured / Next unlock / Sealed), deliberately unequal weights
- UltimateReward ("Final vault"): Day-7 object on an orbit system with the exclusive gift circling it
- RewardVisual: per-type staging (coin rays / perforated gift-card ticket / sparkling gift box / orbiting crown)
- Shell: slim icon rail that expands on hover (drawer + floating dock on mobile)
- Login/Register: editorial split (living ring-core world + flat underline-field panel); full-screen world + bottom sheet on mobile
- Palette: near-black neutral; violet = atmosphere, gold = rewards, cyan = progress/energy. Mono face for data labels.
- Mobile_Hero.png intentionally unused: it bakes in the old "Login Daily & Earn Bigger Rewards" copy.
