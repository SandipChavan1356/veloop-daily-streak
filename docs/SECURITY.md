# Security — VELoop Daily Streak

Every rule below maps to a "Critical Failure Condition" in the assignment doc (section 119) and to the anti-cheat tests in section 96–105.

| Attack | Defense | Where |
|---|---|---|
| Change streak/day/timer in DevTools | Frontend never holds authoritative state; every value is re-fetched from the server after every action | `GET /daily-streak`, `GET /daily-streak/status` |
| Send `{ "day": 7 }` while eligible for Day 2 | Server derives `actualDay` from `StreakCycle.currentDay`; a mismatched `day` in the body is only used to *detect* tampering, never to select the day | `streak.service.validateEligibility` |
| Send `{ "reward": 1000000, "currency": "VES" }` | These fields are simply never read; the reward is looked up server-side from `StreakReward` by day | `streak.service.claimReward` |
| Send `{ "userId": "someoneElse" }` | Identity comes **only** from the verified JWT (`req.user.id`); no request body/query field is ever trusted for ownership | `auth.middleware.protect` |
| Change phone/PC clock | The API has no "client time" field anywhere. All eligibility checks use `clock.now()`, an in-process server clock (real time in production; only the dev-only `/dev/time-travel` route can shift it, and that's hard-disabled outside `NODE_ENV!==production`) | `src/utils/clock.js` |
| Double-click / resubmit the same claim | `StreakClaim` has a unique index on `{ userId, cycleId, day }`. The second insert throws `E11000`, which is caught and turned into an idempotent "already claimed" response — not a second reward | `StreakClaim` schema + `claimReward` catch block |
| Two simultaneous requests (2 tabs / a script) | Same unique index — MongoDB guarantees only one of the two concurrent `create()` calls can succeed, inside a session transaction, so there is no read-then-write race window | `claimReward` (`session.withTransaction`) |
| Skip a day, then claim | `assertPreviousDayClaimed` explicitly checks a `StreakClaim` exists for `day - 1` in the same cycle before allowing a claim, in addition to the fact that `currentDay` can't architecturally skip ahead | `streak.service.assertPreviousDayClaimed` |
| Let the CPA/ad demo itself grant the reward | `POST /claim/initiate` never touches the wallet or `StreakClaim`; it only issues a `ClaimSession`. `POST /claim` re-validates everything from scratch and is the only place a reward is created | `streak.service.initiateClaim` / `claimReward` |
| Replay or forge a CPA session token | Only a SHA-256 **hash** of the token is stored; the raw token never touches the database. Sessions are single-use (`status` flips to `CONSUMED`), scoped to one user/cycle/day, and expire (`expiresAt`) | `ClaimSession` model, `consumeSession` |
| NoSQL operator injection (`{"email": {"$gt": ""}}`) | Global middleware rejects any request body/query containing a `$`-prefixed key or a dotted key before it reaches any Mongoose query | `sanitize.middleware.js` |
| Brute-force login | Per-IP rate limit on `/auth/login` and `/auth/register` (30 requests / 15 min) | `rateLimiter.middleware.authLimiter` |
| Scripted claim spam bypassing a disabled frontend button | Per-user rate limit on the claim endpoints (10 requests / min) — disabling a button is UX, not security (doc section 41) | `rateLimiter.middleware.claimLimiter` |
| Leaking internal errors (`MongoServerError`, stack traces) | Central error handler maps every error class to a safe, generic message; the raw error is only `console.error`'d server-side | `error.middleware.js` |
| Password exposure | `password` field has `select: false`; hashed with bcrypt (cost 10); never returned in any response | `User` model |
| Closing the browser resets the streak | It doesn't — reset is driven entirely by `claimDeadline` vs. server time, checked lazily whenever the user's cycle is next read; there is no client-side timer that could cause a reset | `getOrCreateActiveCycle` / `isCycleMissed` |
| Production secrets committed | `.env` is gitignored; only `.env.example` (no real values) is committed; `validateEnv()` refuses to boot without a real `MONGO_URI`/`JWT_SECRET`, and enforces a longer `JWT_SECRET` in production | `src/config/env.js`, `.gitignore` |

## Defense in depth, explicitly

Two of the guards above (previous-day validation, and the unique-index race protection) are **not strictly reachable through the public API** given how `currentDay` is derived — but they're implemented anyway, because a future refactor of the service layer should not be able to silently reopen an exploit. This is intentional over-engineering per the assignment's "Anti-Cheat Test" philosophy (section 96–105).

## Known limitations (documented per doc section 108)

- Rate limiting is in-memory (per Node process). For a multi-instance deployment, swap `express-rate-limit`'s store for a Redis-backed store.
- The CPA/ad-verification step is a placeholder (`ClaimSession`) with no real ad network integrated, as the assignment explicitly asks for (section 7, 68).
- Gift-card rewards are credited to the wallet's `INR` balance and flagged `fulfilmentStatus: PENDING`; actual gift-card issuance is a manual/external process, not automated here.
