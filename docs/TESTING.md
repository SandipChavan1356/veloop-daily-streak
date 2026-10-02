# Testing — VELoop Daily Streak

## Unit tests (no database needed)
```bash
cd backend
npm run test:unit
```
Covers pure eligibility/miss-window date math (`isEligibleNow`, `isCycleMissed`), `ApiError`, the server clock helper, and the NoSQL-injection sanitizer. **12/12 passing** — these run with `node --test`, no external services.

## Integration tests (require a MongoDB replica set)
```bash
npm run test:integration
```
Uses `mongodb-memory-server` to spin up a real one-node replica set (transactions require a replica set — a standalone `mongod` will not work). **First run downloads a `mongod` binary and needs internet access once**; it's cached afterwards under `~/.cache/mongodb-binaries`. If your environment blocks that download, run these tests on a machine with normal internet access, or point `MONGO_URI` at your own replica set / Atlas cluster and adapt `tests/integration/setup.js` to skip the in-memory bootstrap.

Covers, end-to-end over real HTTP (via `supertest`) against the real API:

| # | Scenario | Doc section |
|---|---|---|
| 1 | Unauthenticated request rejected | 43 |
| 2 | New user starts Day 1, AVAILABLE | 6 |
| 3 | Claiming Day 1 grants the reward, advances to Day 2 locked | 8–9 |
| 4 | Cannot claim while locked | 12 |
| 5 | Day-jump cheat (`{ day: 7 }` while on Day 1) rejected | 14, 99 |
| 6 | Fake reward/currency/streak fields ignored | 18, 36, 98 |
| 7 | Duplicate claim is idempotent (no double reward) | 40–41, 101 |
| 8 | Concurrent simultaneous claims — only one succeeds | 42, 102 |
| 9 | Cross-user attack — `userId` in body ignored | 44–45, 100 |
| 10 | Device-clock manipulation has no effect; only server time unlocks | 46–47, 97 |
| 11 | Missed streak resets to Day 1 / streak 0 | 15–16, 49–50, 103 |
| 12 | Previous-day validation rejects an out-of-sequence claim | 13 |
| 13 | CPA session gating: claim rejected without a completed session, accepted after | 7, 68 |

## Manual test checklist (matches doc section 122)

- [ ] Correct claim
- [ ] Duplicate claim (click twice fast)
- [ ] Concurrent claim (curl the same claim twice in parallel with `&`)
- [ ] Locked day
- [ ] Fake day / fake reward / fake streak / fake user (see Postman "Negative tests" folder)
- [ ] Timer manipulation (change your OS clock — should have zero effect; use `/dev/time-travel` instead)
- [ ] Missed day → reset
- [ ] Refresh state (reload the page after claiming — state must survive)
- [ ] Multiple tabs (claim in tab A, tab B must not also succeed)

## Quick manual concurrency check with curl
```bash
TOKEN="<jwt>"
curl -s -X POST http://localhost:5000/api/daily-streak/claim -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}' &
curl -s -X POST http://localhost:5000/api/daily-streak/claim -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}' &
wait
```
Expect exactly one `200` and one `423 LOCKED` (or one `success:true` + one `alreadyClaimed:true`) — never two full rewards.

## Simulating a missed day without waiting 48 hours
1. Set `ENABLE_DEV_TOOLS=true` in `.env` (dev only — hard-disabled when `NODE_ENV=production`).
2. Claim Day 1.
3. `POST /api/dev/time-travel { "hours": 49 }` (past `claimIntervalMinutes + claimWindowMinutes` = 48h with the seeded config).
4. `GET /api/daily-streak` → `currentDay: 1`, `currentStreak: 0`, `wasReset: true`.
5. `POST /api/dev/time-reset` to return to real time.

## Insights unit tests
`node --test tests/unit/insights.test.js` — 10 tests for the pure calc module (stats, week, achievements, milestones, activity).
