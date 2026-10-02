# API Documentation — VELoop Daily Streak

Base URL: `http://localhost:5000/api` (or your deployed backend URL)

All Daily Streak / Wallet routes require:
```
Authorization: Bearer <JWT>
```

---

## Auth

### POST /auth/register
```json
{ "username": "alex", "email": "alex@example.com", "password": "Passw0rd!" }
```
`201` → `{ success, token, user: { id, username, email } }`

### POST /auth/login
```json
{ "email": "alex@example.com", "password": "Passw0rd!" }
```
`200` → `{ success, token, user }`
`401 INVALID_CREDENTIALS` — same message whether email or password was wrong (no user enumeration).

### GET /auth/me
`200` → `{ success, user }`

---

## Daily Streak

### GET /daily-streak
Full status: current day, streak, reward cards, timer, everything the UI needs on page load.

```json
{
  "success": true,
  "serverTime": "2026-09-29T12:00:00.000Z",
  "streak": {
    "currentStreak": 1,
    "currentDay": 2,
    "checkedIn": 1,
    "totalRewards": 7,
    "status": "ACTIVE",
    "wasReset": false,
    "eligibleNow": false,
    "nextClaimAt": "2026-09-30T12:00:00.000Z",
    "claimDeadline": "2026-10-01T12:00:00.000Z",
    "nextReward": { "amount": 10, "currency": "VES", "type": "VES" },
    "adVerification": { "required": true, "minSeconds": 3 }
  },
  "rewards": [
    { "day": 1, "status": "CLAIMED", "isToday": false, "reward": { "type": "VES", "amount": 5, "...": "..." } },
    { "day": 2, "status": "LOCKED", "isToday": true, "nextClaimAt": "2026-09-30T12:00:00.000Z", "reward": {} }
  ]
}
```
`status` per card: `LOCKED` | `AVAILABLE` | `CLAIMED`. `isToday` marks the current actionable day (shown with the "Today" badge).

### GET /daily-streak/status
Lightweight poll — call this when the frontend's visual countdown hits zero, **instead of** assuming the claim is now allowed (doc section 48).
```json
{ "success": true, "serverTime": "...", "currentDay": 2, "status": "AVAILABLE", "nextClaimAt": null }
```

### POST /daily-streak/claim/initiate
Starts the CPA/ad-demo step. **Grants nothing.** Body: `{ "day": 2 }` (optional — used only to catch tampering).
```json
{
  "success": true,
  "day": 2,
  "sessionToken": "a1b2c3...",
  "minWaitSeconds": 3,
  "expiresInSeconds": 120,
  "message": "Preparing your reward... Advertisement / Reward Verification. Please wait..."
}
```
Errors: `400 DAY_MISMATCH`, `423 LOCKED`, `409 ALREADY_CLAIMED`, `409 SEQUENCE_ERROR`.

### POST /daily-streak/claim
The only endpoint that actually grants a reward. Body: `{ "day": 2, "sessionToken": "a1b2c3..." }` (`sessionToken` required only when `StreakConfig.adVerification.required` is `true`).

Success:
```json
{
  "success": true,
  "message": "Reward claimed successfully.",
  "day": 2,
  "reward": { "type": "VES", "amount": 10, "currency": "VES" },
  "transactionId": "TXN-A1B2C3D4",
  "streak": { "...": "refreshed streak block, same shape as GET /daily-streak" }
}
```
Idempotent duplicate (second click / second tab):
```json
{ "success": true, "alreadyClaimed": true, "message": "This reward has already been claimed.", "day": 2 }
```

| Code | Status | Meaning |
|---|---|---|
| `NOT_AUTHENTICATED` / `INVALID_TOKEN` | 401 | missing/invalid JWT |
| `DAY_MISMATCH` | 400 | client-sent `day` doesn't match the server's `currentDay` |
| `LOCKED` | 423 | claimed before `nextClaimAt` |
| `ALREADY_CLAIMED` | 409 | today's day is already claimed |
| `SEQUENCE_ERROR` | 409 | previous day not claimed (defense-in-depth; shouldn't occur via the normal API) |
| `SESSION_REQUIRED` / `SESSION_INVALID` / `SESSION_TOO_EARLY` / `SESSION_EXPIRED` | 400 | CPA-session gating (only when `adVerification.required`) |
| `REWARD_NOT_CONFIGURED` | 500 | missing `StreakReward` doc for that day |
| `RATE_LIMITED` | 429 | too many requests |

### GET /daily-streak/history?page=1&limit=20
```json
{ "success": true, "page": 1, "limit": 20, "total": 7, "history": [ { "day": 1, "claimedAt": "...", "reward": {}, "transactionId": "TXN-..." } ] }
```

---

## Wallet

### GET /wallet
`200` → `{ success: true, balances: { "VES": 15, "INR": 3 } }`

### GET /wallet/transactions?page=1&limit=20
`200` → `{ success, page, limit, total, transactions: [ { transactionId, amount, currency, source, streakDay, fulfilmentStatus, createdAt, ... } ] }`

---

## Dev-only (disabled unless `ENABLE_DEV_TOOLS=true`, hard-off in production)

### POST /dev/time-travel `{ "hours": 25 }`
Advances the server's internal clock (does **not** touch the OS clock) — used to test the 24h timer and missed-day reset without waiting in real time.

### POST /dev/time-reset
Returns the server clock to real time.

---

## Error shape (always)
```json
{ "success": false, "code": "LOCKED", "message": "Your next reward is not available yet." }
```
Internal errors (`MongoServerError`, `CastError`, stack traces) are **never** sent to the client — only logged server-side.

---

## Insights endpoints (new)

All protected (Bearer JWT) and rate-limited. Optional query `tzOffset` (minutes) for local day bucketing.

| Method | Path | Returns |
|---|---|---|
| GET | `/api/insights/overview` | stats (current/longest streak, check-ins, VES), last-7-days week, recent activity |
| GET | `/api/insights/achievements` | achievement list with unlocked state |
| GET | `/api/insights/milestones` | milestone ladders (check-ins, VES, gift cards, streak) |
| GET | `/api/insights/activity` | paginated claim/transaction activity |
| GET | `/api/insights/leaderboard` | ranking by best streak then total check-ins |
