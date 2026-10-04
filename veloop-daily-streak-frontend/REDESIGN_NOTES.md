# VELoop Daily Streak — v4 "The Streak Pass" (fresh concept)

Setup: `npm install` then `npm run dev`. New deps: @fontsource-variable/fraunces (serif numerals/headlines).

## Not touched
Services, auth, StreakDataContext, claim flow (initiate -> verification wait -> claimReward -> reload), reward/streak logic.
Celebration still starts ONLY when claimReward resolves and is not alreadyClaimed; failures keep the reward claimable ("Try again").

## What is new (nothing carried over visually from v1-v3)
- Concept: obsidian + gold. No violet. Banknote guilloche background, light-beam sweep, gold dust.
- Shell: floating pill nav at the top (active item opens to show its label); drawer + bottom dock on mobile.
- Hero: 3D black-metal Pass (pointer tilt, holographic sheen, flip to ledger) with 7 engraved stamp slots + perforated Coupon.
- Reward Index: typographic list, cursor-follow reward preview (desktop), in-place expand (touch/keyboard).
- Final vault: giant outlined "07", tilting crown, light sweep, notch progress.
- Login/Register: the Pass floats in an obsidian room; flat underline-field sign-in column; bottom sheet on mobile.
- Motion language: odometer digits, stamp slam, stub tear + CLAIMED stamp, impact shake, holo drift.

## Claim sequence (backend-confirmed)
Claim reward -> Claiming... -> green "Reward claimed" -> seal slams into the pass slot (ripple + dust, card impact) ->
CLAIMED stamp on the coupon, stub tears off along the perforation -> toast (+N VES from API response) -> fade to next coupon + rolling countdown.

## Perf / assets
Same optimised AVIF/WebP width ladder + <Asset> as v3. Decorative loops pause offscreen; device-tiered background; transform/opacity only.

## Verified
Similarity v3 vs v4 (layout 0.14 / edges 0.13; v3 vs itself = 1.00). No horizontal overflow at 375-1920px.
