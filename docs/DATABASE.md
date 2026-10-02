# Database Schema — VELoop Daily Streak

All collections live in one MongoDB database (Atlas recommended — a **replica set** is required because claims use multi-document transactions).

## Collections

### User
| Field | Type | Notes |
|---|---|---|
| username | String, unique | 3–30 chars |
| email | String, unique, lowercase | |
| password | String, hashed (bcrypt), `select:false` | never returned by default |
| isActive | Boolean | disabled accounts can't log in |
| lastLoginAt | Date | |

### Wallet
One per user. `balances` is a Map: `{ VES: Number, INR: Number }`.
- `VES` = spendable in-app gems.
- `INR` = cumulative gift-card value earned (fulfilled manually by the team).

### StreakConfig
Singleton document (`key: "default"`). **Every business rule lives here, not in code:**
`totalDays`, `claimIntervalMinutes` (lock duration), `claimWindowMinutes` (grace period before a miss), `resetOnMiss`, `adVerification { required, minSeconds, ttlSeconds }`, `active`.

### StreakReward
One document per day (1–7). `day` (unique), `rewardType` (`VES`|`GIFT_CARD`), `currency` (`VES`|`INR`), `amount`, `title`, `subtitle`, `assetType` (`coin`|`gift-box`|`gift-card`|`crown`), `badge`, `active`, `metadata`.
Changing these values changes what the API returns immediately — **no frontend code change needed** (doc section 66).

### StreakCycle
The live state machine for one user's 7-day streak.
| Field | Notes |
|---|---|
| userId | |
| cycleNumber | increments every time a cycle starts (fresh, completed, or reset) |
| status | `ACTIVE` \| `COMPLETED` \| `RESET` |
| currentDay | the ONLY source of truth for "what day is the user on" |
| currentStreak | grows on every successful claim, zeroed on a reset |
| nextClaimAt | null = claimable now; a timestamp = locked until then |
| claimDeadline | `nextClaimAt + claimWindowMinutes` — pass this without claiming and the streak is missed |
| resetInfo | snapshot of the miss that caused this cycle to start fresh (for the "Streak Reset" UI toast) |

**Indexes:**
- `{ userId, cycleNumber }` unique — a cycle number can never be created twice for a user (race-safe).
- `{ userId }` unique, **partial** on `status: "ACTIVE"` — a user can never have two active cycles at once, even under concurrent requests.

### StreakClaim
One document per successful claim. `rewardSnapshot` freezes exactly what was granted (amount/type/currency/title) so history stays accurate even if `StreakReward` config changes later.

**Index:** `{ userId, cycleId, day }` unique — **this is the actual mechanism** that makes duplicate and concurrent claims impossible, not application code (doc section 40–42, 62).

### ClaimSession
Backing store for the CPA/ad-demo step (doc section 7, 68). Created by `POST /claim/initiate`, consumed by `POST /claim`. Stores only a **hash** of the session token. Auto-expires from MongoDB 24h after creation (TTL index).

### WalletTransaction
The ledger. `transactionId` (human-readable, e.g. `TXN-A1B2C3D4`), `claimId` (unique, sparse — a second attempt to record the same claim's transaction fails at the DB level), `referenceId` (`STREAK-<claimId>`), `balanceBefore`/`balanceAfter`, `fulfilmentStatus` (`NOT_REQUIRED` for VES, `PENDING`→`FULFILLED` for gift cards).

### AuditLog
Append-only. Events: `STREAK_CLAIM_INITIATED`, `STREAK_CLAIM_REQUEST`, `STREAK_CLAIM_SUCCESS`, `STREAK_CLAIM_REJECTED`, `STREAK_RESET`, `DUPLICATE_CLAIM`, `INVALID_CLAIM`, `DEV_TIME_TRAVEL`.

## Traceable relationship (doc section 104)

```
StreakClaim (day, rewardSnapshot)
   → transactionId → WalletTransaction (balanceBefore/After, referenceId)
        → Wallet.balances (current balance)
```
Given a `StreakClaim._id`, every downstream effect can be looked up in Mongo.

## Why a replica set is required

`claimReward` wraps claim-creation, wallet-credit, transaction-recording and cycle-advancement in a single Mongo **session transaction** (`session.withTransaction`). Standalone `mongod` does not support multi-document transactions — use MongoDB Atlas (free tier is already a replica set) or run `mongod --replSet rs0` locally.
