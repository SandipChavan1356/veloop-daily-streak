const mongoose = require('mongoose');
const crypto = require('crypto');
const { StreakConfig, StreakCycle, StreakClaim, ClaimSession, AuditLog } = require('../models');
const rewardService = require('./reward.service');
const walletService = require('./wallet.service');
const transactionService = require('./transaction.service');
const ApiError = require('../utils/ApiError');
const audit = require('../utils/audit');
const clock = require('../utils/clock');

const msFromMinutes = (minutes) => minutes * 60 * 1000;

const getConfig = async () => {
  let config = await StreakConfig.findOne({ key: 'default' });
  if (!config) config = await StreakConfig.create({ key: 'default' });
  return config;
};

// ---------------------------------------------------------------------------
// Eligibility & missed-day logic
//
// Two SEPARATE timestamps drive this, which is the fix for the earlier
// "next claim time" / "claim window" conflation:
//   nextClaimAt   -> the day is LOCKED until this moment (the 24h cooldown).
//   claimDeadline -> once unlocked, the user has until this moment to claim
//                    before the streak is considered MISSED.
// Both are only set once a claim actually happens - a fresh Day 1 has neither,
// so a user can never be "missed" before they've even started (doc section 51).
// ---------------------------------------------------------------------------

const isEligibleNow = (cycle, now = clock.now()) => {
  if (!cycle.nextClaimAt) return true;
  return now >= cycle.nextClaimAt;
};

const isCycleMissed = (cycle, now = clock.now()) => {
  if (!cycle.claimDeadline) return false; // nothing to miss yet
  return now > cycle.claimDeadline;
};

// ---------------------------------------------------------------------------
// Active cycle resolution - the single source of truth for "what day is the
// user actually on". Nothing here ever reads from the client. Handles the
// race where two simultaneous requests both try to create/reset a cycle by
// relying on the unique "one active cycle per user" index and retrying once
// on a duplicate-key error.
// ---------------------------------------------------------------------------

const createFreshCycle = async (userId, cycleNumber) =>
  StreakCycle.create({ userId, cycleNumber, currentDay: 1, currentStreak: 0 });

const getOrCreateActiveCycle = async (userId, { retried = false } = {}) => {
  const config = await getConfig();
  const now = clock.now();

  let cycle = await StreakCycle.findOne({ userId, status: 'ACTIVE' }).sort({ cycleNumber: -1 });

  if (!cycle) {
    const lastCycle = await StreakCycle.findOne({ userId }).sort({ cycleNumber: -1 });
    const nextNumber = lastCycle ? lastCycle.cycleNumber + 1 : 1;
    try {
      cycle = await createFreshCycle(userId, nextNumber);
      return { cycle, config, wasReset: false };
    } catch (err) {
      if (err.code === 11000 && !retried) return getOrCreateActiveCycle(userId, { retried: true });
      throw err;
    }
  }

  if (isCycleMissed(cycle, now)) {
    const missedDay = cycle.currentDay;
    const previousStreak = cycle.currentStreak;

    cycle.status = 'RESET';
    cycle.resetAt = now;
    await cycle.save();

    await audit(userId, 'STREAK_RESET', { previousCycleId: cycle._id, missedDay, previousStreak });

    try {
      const freshCycle = await StreakCycle.create({
        userId,
        cycleNumber: cycle.cycleNumber + 1,
        currentDay: 1,
        currentStreak: 0, // a missed window zeroes the streak entirely (doc section 15-16, 50)
        nextClaimAt: null, // immediately claimable again from Day 1
        claimDeadline: null,
        resetInfo: { previousCycleId: cycle._id, previousStreak, missedDay, resetAt: now },
      });
      return { cycle: freshCycle, config, wasReset: true };
    } catch (err) {
      if (err.code === 11000 && !retried) return getOrCreateActiveCycle(userId, { retried: true });
      throw err;
    }
  }

  return { cycle, config, wasReset: false };
};

// ---------------------------------------------------------------------------
// Status payloads
// ---------------------------------------------------------------------------

const buildStatusResponse = async (userId) => {
  const { cycle, config, wasReset } = await getOrCreateActiveCycle(userId);
  const rewards = await rewardService.getAllActiveRewards();
  const totalRewards = rewards.length || config.totalDays;
  const now = clock.now();

  const checkedIn = await StreakClaim.countDocuments({ userId, cycleId: cycle._id });
  const nextRewardConfig = rewards.find((r) => r.day === cycle.currentDay);

  const rewardCards = rewards.map((r) => {
    let status;
    if (r.day < cycle.currentDay) status = 'CLAIMED';
    else if (r.day === cycle.currentDay) status = isEligibleNow(cycle, now) ? 'AVAILABLE' : 'LOCKED';
    else status = 'LOCKED';

    return {
      day: r.day,
      status,
      isToday: r.day === cycle.currentDay,
      nextClaimAt: r.day === cycle.currentDay && status === 'LOCKED' ? cycle.nextClaimAt : undefined,
      reward: {
        type: r.rewardType,
        currency: r.currency,
        amount: r.amount,
        title: r.title,
        subtitle: r.subtitle,
        assetType: r.assetType,
        badge: r.badge,
      },
    };
  });

  return {
    success: true,
    serverTime: now.toISOString(),
    streak: {
      currentStreak: cycle.currentStreak,
      currentDay: cycle.currentDay,
      checkedIn,
      totalRewards,
      status: cycle.status,
      wasReset,
      resetInfo: wasReset ? cycle.resetInfo : undefined,
      eligibleNow: isEligibleNow(cycle, now),
      nextClaimAt: cycle.nextClaimAt,
      claimDeadline: cycle.claimDeadline,
      nextReward: nextRewardConfig
        ? { amount: nextRewardConfig.amount, currency: nextRewardConfig.currency, type: nextRewardConfig.rewardType }
        : null,
      adVerification: { required: config.adVerification.required, minSeconds: config.adVerification.minSeconds },
    },
    rewards: rewardCards,
  };
};

// Lightweight poll used when the frontend's visual countdown hits zero
// (doc section 48: never assume timer=0 means claimable, ask the backend).
const buildLightStatus = async (userId) => {
  const { cycle } = await getOrCreateActiveCycle(userId);
  const now = clock.now();
  return {
    success: true,
    serverTime: now.toISOString(),
    currentDay: cycle.currentDay,
    status: isEligibleNow(cycle, now) ? 'AVAILABLE' : 'LOCKED',
    nextClaimAt: cycle.nextClaimAt,
  };
};

// ---------------------------------------------------------------------------
// Previous-day validation (explicit, defense-in-depth)
//
// Architecturally this can't normally be violated - cycle.currentDay only
// advances after day N-1's claim succeeds - but we verify it explicitly at
// claim time anyway so a bug elsewhere can never silently grant an
// out-of-sequence reward (doc section 13-14, 99).
// ---------------------------------------------------------------------------

const assertPreviousDayClaimed = async (userId, cycle) => {
  if (cycle.currentDay <= 1) return;
  const previousClaimed = await StreakClaim.exists({
    userId,
    cycleId: cycle._id,
    day: cycle.currentDay - 1,
  });
  if (!previousClaimed) {
    throw new ApiError(409, 'Previous day has not been claimed yet.', 'SEQUENCE_ERROR');
  }
};

// Validates everything EXCEPT actually granting the reward. Shared by both
// initiateClaim (before the CPA demo) and claimReward (after it), so the same
// rules gate the ad step and the payout step.
const validateEligibility = async (userId, requestedDay, cycle) => {
  const actualDay = cycle.currentDay;

  if (requestedDay !== undefined && requestedDay !== actualDay) {
    await audit(userId, 'INVALID_CLAIM', { reason: 'DAY_MISMATCH', requestedDay, actualDay });
    throw new ApiError(400, 'Your streak day is out of sync. Please refresh and try again.', 'DAY_MISMATCH', {
      actualDay,
    });
  }

  if (!isEligibleNow(cycle)) {
    await audit(userId, 'STREAK_CLAIM_REJECTED', { reason: 'LOCKED', actualDay });
    throw new ApiError(423, 'Your next reward is not available yet.', 'LOCKED', {
      nextClaimAt: cycle.nextClaimAt,
    });
  }

  await assertPreviousDayClaimed(userId, cycle);

  const alreadyClaimed = await StreakClaim.exists({ userId, cycleId: cycle._id, day: actualDay });
  if (alreadyClaimed) {
    await audit(userId, 'STREAK_CLAIM_REJECTED', { reason: 'ALREADY_CLAIMED', actualDay });
    throw new ApiError(409, 'This reward has already been claimed.', 'ALREADY_CLAIMED');
  }

  return actualDay;
};

// ---------------------------------------------------------------------------
// CPA / ad-verification demo step
//
// This is a placeholder for the real ad network (doc section 7, 68). It is
// intentionally a NO-OP with respect to granting rewards: /claim independently
// re-validates everything and is what actually pays out. The session only
// proves "the user waited through the demo state" when adVerification.required
// is turned on in StreakConfig.
// ---------------------------------------------------------------------------

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const initiateClaim = async (userId, requestedDay) => {
  const { cycle, config } = await getOrCreateActiveCycle(userId);
  const actualDay = await validateEligibility(userId, requestedDay, cycle);

  const rawToken = crypto.randomBytes(24).toString('hex');
  const now = clock.now();

  await ClaimSession.create({
    tokenHash: hashToken(rawToken),
    userId,
    cycleId: cycle._id,
    day: actualDay,
    minCompleteAt: new Date(now.getTime() + config.adVerification.minSeconds * 1000),
    expiresAt: new Date(now.getTime() + config.adVerification.ttlSeconds * 1000),
  });

  await audit(userId, 'STREAK_CLAIM_INITIATED', { day: actualDay });

  return {
    success: true,
    day: actualDay,
    sessionToken: rawToken,
    minWaitSeconds: config.adVerification.minSeconds,
    expiresInSeconds: config.adVerification.ttlSeconds,
    message: 'Preparing your reward... Advertisement / Reward Verification. Please wait...',
  };
};

const consumeSession = async (userId, cycle, actualDay, sessionToken, config, dbSession) => {
  if (!config.adVerification.required) return; // ad-gating disabled - claim proceeds directly

  if (!sessionToken) {
    throw new ApiError(400, 'Please start the reward verification step first.', 'SESSION_REQUIRED');
  }

  const claimSession = await ClaimSession.findOne({ tokenHash: hashToken(sessionToken) }).session(dbSession);
  const now = clock.now();

  if (
    !claimSession ||
    claimSession.status !== 'PENDING' ||
    claimSession.userId.toString() !== userId.toString() ||
    claimSession.cycleId.toString() !== cycle._id.toString() ||
    claimSession.day !== actualDay
  ) {
    throw new ApiError(400, 'Your reward verification session is invalid. Please try again.', 'SESSION_INVALID');
  }

  if (now < claimSession.minCompleteAt) {
    throw new ApiError(400, 'Please wait for the verification step to finish.', 'SESSION_TOO_EARLY');
  }

  if (now > claimSession.expiresAt) {
    claimSession.status = 'EXPIRED';
    await claimSession.save({ session: dbSession });
    throw new ApiError(400, 'Your reward verification session expired. Please try again.', 'SESSION_EXPIRED');
  }

  claimSession.status = 'CONSUMED';
  claimSession.consumedAt = now;
  await claimSession.save({ session: dbSession });
};

// ---------------------------------------------------------------------------
// The claim flow itself
// ---------------------------------------------------------------------------

const claimReward = async (userId, requestedDay, sessionToken) => {
  const { cycle, config } = await getOrCreateActiveCycle(userId);

  await audit(userId, 'STREAK_CLAIM_REQUEST', { requestedDay, actualDay: cycle.currentDay });

  const actualDay = await validateEligibility(userId, requestedDay, cycle);

  const reward = await rewardService.getRewardForDay(actualDay);
  if (!reward) {
    throw new ApiError(500, 'Unable to process your reward. Please try again.', 'REWARD_NOT_CONFIGURED');
  }

  const dbSession = await mongoose.startSession();

  try {
    let result;

    await dbSession.withTransaction(async () => {
      await consumeSession(userId, cycle, actualDay, sessionToken, config, dbSession);

      // The unique (userId, cycleId, day) index is what actually stops duplicate/
      // concurrent claims (doc section 40-42) - this create() either succeeds
      // exactly once or throws E11000, regardless of how many requests race here.
      const rewardSnapshot = rewardService.snapshotReward(reward);
      const now = clock.now();

      const [claim] = await StreakClaim.create(
        [
          {
            userId,
            cycleId: cycle._id,
            cycleNumber: cycle.cycleNumber,
            day: actualDay,
            rewardId: reward._id,
            rewardSnapshot,
            claimedAt: now,
          },
        ],
        { session: dbSession }
      );

      // VES credits the spendable balance directly. Gift cards still credit the
      // INR balance (so "balance" always reflects earned value) and are flagged
      // PENDING for manual fulfilment by the VELoop team (doc section 21, 38).
      const { balanceBefore, balanceAfter } = await walletService.creditWallet(
        userId,
        reward.currency,
        reward.amount,
        dbSession
      );

      const transaction = await transactionService.recordClaimTransaction({
        userId,
        reward,
        streakDay: actualDay,
        claimId: claim._id,
        balanceBefore,
        balanceAfter,
        session: dbSession,
      });

      claim.transactionId = transaction._id;
      claim.referenceId = transaction.referenceId;
      await claim.save({ session: dbSession });

      const isLastDay = actualDay >= config.totalDays;

      if (isLastDay) {
        cycle.status = 'COMPLETED';
        cycle.completedAt = now;
        cycle.lastClaimedAt = now;
        await cycle.save({ session: dbSession });

        // The next cycle starts immediately but still respects the cooldown from
        // this final claim - completing Day 7 can't be chained straight into Day 1.
        const nextClaimAt = new Date(now.getTime() + msFromMinutes(config.claimIntervalMinutes));
        const claimDeadline = new Date(nextClaimAt.getTime() + msFromMinutes(config.claimWindowMinutes));

        await StreakCycle.create(
          [
            {
              userId,
              cycleNumber: cycle.cycleNumber + 1,
              currentDay: 1,
              currentStreak: cycle.currentStreak + 1, // completing a cycle keeps the streak growing
              lastClaimedAt: null,
              nextClaimAt,
              claimDeadline,
            },
          ],
          { session: dbSession }
        );
      } else {
        const nextClaimAt = new Date(now.getTime() + msFromMinutes(config.claimIntervalMinutes));
        cycle.currentDay += 1;
        cycle.currentStreak += 1;
        cycle.lastClaimedAt = now;
        cycle.nextClaimAt = nextClaimAt;
        cycle.claimDeadline = new Date(nextClaimAt.getTime() + msFromMinutes(config.claimWindowMinutes));
        await cycle.save({ session: dbSession });
      }

      result = { claim, transaction, reward: rewardSnapshot };
    });

    await audit(userId, 'STREAK_CLAIM_SUCCESS', { day: actualDay, transactionId: result.transaction.transactionId });

    return {
      success: true,
      message: 'Reward claimed successfully.',
      day: actualDay,
      reward: { type: result.reward.type, amount: result.reward.amount, currency: result.reward.currency },
      transactionId: result.transaction.transactionId,
      streak: await buildStatusResponse(userId).then((r) => r.streak),
    };
  } catch (err) {
    if (err.code === 11000) {
      // Someone else's request (a duplicate click, a second tab, or a genuine
      // race) won first. Return the already-claimed result instead of erroring
      // - this IS the idempotent behaviour doc section 40-42 asks for.
      const existingClaim = await StreakClaim.findOne({ userId, cycleId: cycle._id, day: actualDay }).populate(
        'transactionId'
      );

      await audit(userId, 'DUPLICATE_CLAIM', { day: actualDay });

      return {
        success: true,
        alreadyClaimed: true,
        message: 'This reward has already been claimed.',
        day: actualDay,
        reward: existingClaim
          ? {
              type: existingClaim.rewardSnapshot.type,
              amount: existingClaim.rewardSnapshot.amount,
              currency: existingClaim.rewardSnapshot.currency,
            }
          : undefined,
        transactionId: existingClaim?.transactionId?.transactionId,
      };
    }

    throw err;
  } finally {
    await dbSession.endSession();
  }
};

const getHistory = async (userId, { page = 1, limit = 20 } = {}) => {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);

  const [claims, total] = await Promise.all([
    StreakClaim.find({ userId })
      .populate('transactionId')
      .sort({ claimedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    StreakClaim.countDocuments({ userId }),
  ]);

  return {
    success: true,
    page: safePage,
    limit: safeLimit,
    total,
    history: claims.map((c) => ({
      day: c.day,
      cycleNumber: c.cycleNumber,
      claimedAt: c.claimedAt,
      reward: c.rewardSnapshot,
      referenceId: c.referenceId,
      transactionId: c.transactionId ? c.transactionId.transactionId : null,
    })),
  };
};

module.exports = {
  getConfig,
  getOrCreateActiveCycle,
  isEligibleNow,
  isCycleMissed,
  buildStatusResponse,
  buildLightStatus,
  initiateClaim,
  claimReward,
  getHistory,
};
