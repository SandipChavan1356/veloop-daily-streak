# VELoop Rewards — Daily Streak Backend

Backend-driven Daily Streak & Rewards system for VELoop Rewards. Node.js + Express + MongoDB(Mongoose) + JWT. Built against the "VELoop Rewards — Daily Streak System" assignment spec; this repo covers the **backend only**.

> **Core principle: the frontend never decides anything.** Current day, streak, timer, claim eligibility, reward value and wallet balance are all calculated and validated server-side. See `docs/SECURITY.md` for how each anti-cheat requirement is enforced.

## Stack
Node.js, Express, MongoDB + Mongoose, JWT (`jsonwebtoken`, `bcryptjs`), `express-rate-limit`, `helmet`, `morgan`.

## Project structure
```
backend/
├── server.js                 # entrypoint
├── seed/seed.js               # seeds StreakConfig + 7 StreakReward days + demo user
├── src/
│   ├── config/                # env.js (validated env vars), db.js (Mongo connect)
│   ├── controllers/           # auth, streak, wallet
│   ├── middleware/            # auth (JWT), rate limiting, error handling, NoSQL-injection guard
│   ├── models/                # User, Wallet, StreakConfig, StreakReward, StreakCycle,
│   │                           # StreakClaim, ClaimSession, WalletTransaction, AuditLog
│   ├── routes/                # /auth, /daily-streak, /wallet, /dev (dev-only)
│   ├── services/               # streak.service (core logic), reward/wallet/transaction services
│   ├── utils/                  # ApiError, asyncHandler, generateToken, clock (server time), audit
│   └── validators/             # request body validation
├── tests/
│   ├── unit/                   # no DB needed — eligibility/miss-window logic, sanitizer, ApiError
│   └── integration/            # supertest + mongodb-memory-server, full HTTP flow
docs/                           # API_DOCUMENTATION.md, DATABASE.md, SECURITY.md, TESTING.md
postman/                        # Postman collection incl. negative/anti-cheat tests
```

## Installation
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run seed            # creates StreakConfig, the 7 reward days, and a demo user
npm run dev              # nodemon, http://localhost:5000
```
Demo login after seeding: `demo@veloop.test` / `Demo@1234`.

### MongoDB requirement
**Use a replica set** (MongoDB Atlas's free tier already is one). Claims run inside a multi-document transaction (`mongoose.startSession().withTransaction`), which standalone `mongod` does not support. `db.js` logs a warning at boot if it detects a non-replica-set connection.

## Environment variables
See `.env.example`. Required: `MONGO_URI`, `JWT_SECRET` (≥32 chars in production — enforced at boot by `validateEnv()`). Optional: `PORT`, `CORS_ORIGIN` (comma-separated allowed frontend origins), `TRUST_PROXY`, `ENABLE_DEV_TOOLS`.

## Streak & timer architecture
A user's progress lives in a `StreakCycle` document with two independent timestamps:
- **`nextClaimAt`** — the day is *locked* until this moment (the cooldown, default 24h).
- **`claimDeadline`** — once unlocked, the user has until this moment to claim before the cycle is considered **missed** (default another 24h grace window).

Both fields are computed and stored server-side the instant a claim succeeds; the frontend only ever *displays* a countdown toward `nextClaimAt` using `serverTime` from the API — it never decides the countdown value itself (doc section 10–11, 46–48).

A cycle is resolved lazily on every read (`getOrCreateActiveCycle`): if `claimDeadline` has passed without a claim, the cycle is marked `RESET`, `currentStreak` is zeroed, and a fresh cycle starts at Day 1 — all before the response is built, so the very next `GET /daily-streak` already reflects the reset (doc section 15–16, 49–51).

## Reward types & wallet
`StreakReward.rewardType` is `VES` (spendable in-app currency) or `GIFT_CARD` (Amazon gift card, INR-denominated). Both are credited to the user's `Wallet` (separate `VES`/`INR` balances) and logged as a `WalletTransaction`; gift cards are additionally flagged `fulfilmentStatus: PENDING` since the actual voucher is issued manually by the VELoop team — this repo does not integrate a gift-card provider (doc section 21, 38, out of scope per section 68/105).

## Anti-cheat, at a glance
| Test (doc §96–105) | Result |
|---|---|
| Change streak/day in DevTools | No effect — frontend state is never authoritative |
| Change phone/PC clock | No effect — only server time (`clock.now()`) gates eligibility |
| Send `{ day: 7 }` while on Day 2 | `400 DAY_MISMATCH` |
| Send a fake `reward`/`currency`/`streak` | Silently ignored — server always looks up the real config |
| Send someone else's `userId` | Ignored — identity comes only from the JWT |
| Double-click / two tabs / concurrent requests | Exactly one reward — enforced by a unique DB index, not app code |

Full mapping in `docs/SECURITY.md`.

## Testing
```bash
npm run test:unit          # pure logic, no DB, runs anywhere
npm run test:integration   # full HTTP flow against a real MongoDB replica set (mongodb-memory-server)
```
See `docs/TESTING.md` for the full scenario list and a manual concurrency check with `curl`. Postman collection with a dedicated "Negative / Anti-cheat tests" folder is in `postman/`.

## Deployment
- **Backend**: Render / Railway (or any Node host) — set the env vars above, run `npm run seed` once against your production DB, then `npm start`.
- **Database**: MongoDB Atlas.
- **Frontend**: not included in this repo — point `VITE_API_URL` (or equivalent) at this backend's base URL and consume the endpoints documented in `docs/API_DOCUMENTATION.md`.

## Known limitations
- Rate limiting is in-process (per server instance); use a shared store (e.g. Redis) for multi-instance deployments.
- The CPA/ad-verification step (`ClaimSession`) is a placeholder, as the assignment explicitly asks for — no real ad SDK/network is integrated.
- Gift-card fulfilment is manual/external; the backend only tracks that a gift card was *earned* and is `PENDING`.
