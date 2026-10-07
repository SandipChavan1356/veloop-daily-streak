const { User, StreakClaim, StreakCycle, WalletTransaction } = require('../models');
const ApiError = require('../utils/ApiError');
const clock = require('../utils/clock');
const calc = require('../utils/insights.calc');

const loadHistory = async (userId) => {
  const [claims, cycles, txns] = await Promise.all([
    StreakClaim.find({ userId }).select('cycleId day claimedAt').lean(),
    StreakCycle.find({ userId }).select('status currentStreak claimDeadline cycleNumber').lean(),
    WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .select('transactionId type status currency amount source streakDay fulfilmentStatus balanceAfter createdAt')
      .lean(),
  ]);
  return { claims, cycles, txns };
};

const getOverview = async (userId, { tzOffset } = {}) => {
  const now = clock.now();
  const tzOffsetMin = calc.normalizeTzOffset(tzOffset);

  const [user, history] = await Promise.all([User.findById(userId).select('username email createdAt').lean(), loadHistory(userId)]);
  if (!user) throw new ApiError(404, 'User not found.', 'NOT_FOUND');

  const stats = calc.computeStats({ ...history, now });
  const week = calc.buildWeek({ claims: history.claims, txns: history.txns, now, tzOffsetMin });

  return {
    success: true,
    serverTime: now.toISOString(),
    profile: { username: user.username, email: user.email, memberSince: user.createdAt },
    streak: {
      current: stats.currentStreak,
      longest: stats.longestStreak,
      totalCheckIns: stats.totalCheckIns,
      cyclesCompleted: stats.cyclesCompleted,
    },
    rewards: {
      vesEarned: stats.vesEarned,
      vesEarnedThisWeek: week.reduce((s, d) => s + d.vesEarned, 0),
      giftCardInr: stats.giftCardInr,
      giftCardCount: stats.giftCardCount,
      pendingGiftCards: stats.pendingGiftCards,
    },
    week,
    weekClaimedCount: week.filter((d) => d.claimed).length,
    recentActivity: calc.buildActivity(history.txns, 5),
  };
};

const getAchievements = async (userId) => {
  const now = clock.now();
  const stats = calc.computeStats({ ...(await loadHistory(userId)), now });
  const achievements = calc.buildAchievements(stats);
  return {
    success: true,
    serverTime: now.toISOString(),
    unlocked: achievements.filter((a) => a.unlocked).length,
    total: achievements.length,
    achievements,
  };
};

const getMilestones = async (userId) => {
  const now = clock.now();
  const stats = calc.computeStats({ ...(await loadHistory(userId)), now });
  return { success: true, serverTime: now.toISOString(), milestones: calc.buildMilestones(stats) };
};

const getActivity = async (userId, { page = 1, limit = 20 } = {}) => {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const filter = { userId, status: { $ne: 'FAILED' } };
  const [txns, total] = await Promise.all([
    WalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .select('transactionId type status currency amount source streakDay fulfilmentStatus balanceAfter createdAt')
      .lean(),
    WalletTransaction.countDocuments(filter),
  ]);
  return { success: true, page: p, limit: l, total, activity: calc.buildActivity(txns, l) };
};

const getLeaderboard = async (userId, { limit = 10 } = {}) => {
  const top = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const rows = await StreakClaim.aggregate([
    { $group: { _id: { userId: '$userId', cycleId: '$cycleId' }, days: { $sum: 1 }, last: { $max: '$claimedAt' } } },
    {
      $group: {
        _id: '$_id.userId',
        best: { $max: '$days' },
        totalCheckIns: { $sum: '$days' },
        last: { $max: '$last' },
      },
    },
    { $sort: { best: -1, totalCheckIns: -1, last: 1 } },
    { $limit: 1000 },
  ]);

  const ids = rows.slice(0, top).map((r) => r._id);
  const users = await User.find({ _id: { $in: ids } }).select('username').lean();
  const nameById = new Map(users.map((u) => [String(u._id), u.username]));

  const board = rows.slice(0, top).map((r, i) => ({
    rank: i + 1,
    username: nameById.get(String(r._id)) || 'Player',
    bestStreak: r.best,
    totalCheckIns: r.totalCheckIns,
    isYou: String(r._id) === String(userId),
  }));

  const myIndex = rows.findIndex((r) => String(r._id) === String(userId));
  const me =
    myIndex === -1
      ? null
      : { rank: myIndex + 1, bestStreak: rows[myIndex].best, totalCheckIns: rows[myIndex].totalCheckIns };

  return { success: true, totalPlayers: rows.length, leaderboard: board, me };
};

module.exports = { getOverview, getAchievements, getMilestones, getActivity, getLeaderboard };
