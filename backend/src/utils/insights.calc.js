// Pure, dependency-free calculations behind the /api/insights endpoints.
//
// Everything the dashboard shows (longest streak, weekly chart, achievements,
// milestones) is derived HERE, from claim/transaction history in MongoDB —
// the frontend only renders it. Keeping this file free of mongoose/express
// makes it trivially unit-testable (tests/unit/insights.test.js).

const MS_PER_MINUTE = 60 * 1000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Clamp the client-provided timezone offset (minutes ahead of UTC, e.g. IST = 330).
// It only decides which calendar day a claim is bucketed into for the weekly chart —
// it can never influence a reward, streak or claim decision.
const normalizeTzOffset = (value) => {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(-840, Math.min(840, n));
};

const dayKey = (date, tzOffsetMin = 0) =>
  new Date(new Date(date).getTime() + tzOffsetMin * MS_PER_MINUTE).toISOString().slice(0, 10);

const weekdayLabel = (key) => WEEKDAYS[new Date(`${key}T00:00:00Z`).getUTCDay()];

const isCredit = (t) => t.status !== 'FAILED' && (t.type || 'CREDIT') === 'CREDIT';

/**
 * @param {object} input
 * @param {Array}  input.claims  StreakClaim docs (lean)
 * @param {Array}  input.cycles  StreakCycle docs (lean)
 * @param {Array}  input.txns    WalletTransaction docs (lean)
 * @param {Date}   input.now     trusted server time
 */
const computeStats = ({ claims = [], cycles = [], txns = [], now = new Date() }) => {
  // A streak inside a cycle == number of claims in that cycle (cycles reset on a miss).
  const perCycle = new Map();
  for (const c of claims) {
    const k = String(c.cycleId);
    perCycle.set(k, (perCycle.get(k) || 0) + 1);
  }
  const longestStreak = perCycle.size ? Math.max(...perCycle.values()) : 0;

  const active = cycles.find((c) => c.status === 'ACTIVE');
  let currentStreak = active ? active.currentStreak || 0 : 0;
  // An unclaimed, expired window means the streak is already broken even if the
  // reset hasn't been persisted yet (it is persisted on the next /daily-streak read).
  if (active && active.claimDeadline && new Date(now) > new Date(active.claimDeadline)) currentStreak = 0;

  const credits = txns.filter(isCredit);
  const vesEarned = credits.filter((t) => t.currency === 'VES').reduce((s, t) => s + t.amount, 0);
  const giftCards = credits.filter((t) => t.currency === 'INR');
  const giftCardInr = giftCards.reduce((s, t) => s + t.amount, 0);
  const pendingGiftCards = giftCards.filter((t) => t.fulfilmentStatus === 'PENDING').length;

  return {
    totalCheckIns: claims.length,
    currentStreak,
    longestStreak,
    cyclesCompleted: cycles.filter((c) => c.status === 'COMPLETED').length,
    hasReset: cycles.some((c) => c.status === 'RESET'),
    vesEarned,
    giftCardInr,
    giftCardCount: giftCards.length,
    pendingGiftCards,
  };
};

/** Last 7 local calendar days ending today (oldest first). */
const buildWeek = ({ claims = [], txns = [], now = new Date(), tzOffsetMin = 0 }) => {
  const todayKey = dayKey(now, tzOffsetMin);
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const key = dayKey(new Date(new Date(now).getTime() - i * 24 * 60 * MS_PER_MINUTE), tzOffsetMin);
    days.push({ date: key, label: weekdayLabel(key), isToday: key === todayKey, claimed: false, vesEarned: 0 });
  }
  const byKey = new Map(days.map((d) => [d.date, d]));

  for (const c of claims) {
    const d = byKey.get(dayKey(c.claimedAt, tzOffsetMin));
    if (d) d.claimed = true;
  }
  for (const t of txns.filter(isCredit)) {
    if (t.currency !== 'VES') continue;
    const d = byKey.get(dayKey(t.createdAt, tzOffsetMin));
    if (d) d.vesEarned += t.amount;
  }
  return days;
};

const ACHIEVEMENTS = [
  { key: 'first_step', title: 'First Step', description: 'Claim your very first daily reward.', icon: 'flame', tier: 'bronze', target: 1, metric: (s) => s.totalCheckIns },
  { key: 'warming_up', title: 'Warming Up', description: 'Reach a 3-day streak.', icon: 'zap', tier: 'bronze', target: 3, metric: (s) => s.longestStreak },
  { key: 'gift_getter', title: 'Gift Getter', description: 'Earn your first Amazon gift card reward.', icon: 'gift', tier: 'silver', target: 1, metric: (s) => s.giftCardCount },
  { key: 'full_cycle', title: 'Full Cycle', description: 'Complete all 7 days of a streak.', icon: 'crown', tier: 'gold', target: 1, metric: (s) => s.cyclesCompleted },
  { key: 'century', title: 'Century', description: 'Earn 100 VEs in total.', icon: 'coins', tier: 'silver', target: 100, metric: (s) => s.vesEarned },
  { key: 'habit', title: 'Habit Formed', description: 'Check in 14 times overall.', icon: 'calendar', tier: 'silver', target: 14, metric: (s) => s.totalCheckIns },
  { key: 'ves_vault', title: 'VES Vault', description: 'Earn 500 VEs in total.', icon: 'gem', tier: 'gold', target: 500, metric: (s) => s.vesEarned },
  { key: 'comeback', title: 'Comeback Kid', description: 'Lose a streak, then rebuild a 3-day one.', icon: 'medal', tier: 'violet', target: 3, metric: (s) => (s.hasReset ? Math.max(s.currentStreak, s.longestStreak) : 0) },
];

const buildAchievements = (stats) =>
  ACHIEVEMENTS.map(({ metric, target, ...meta }) => {
    const value = metric(stats);
    return { ...meta, target, progress: Math.min(value, target), unlocked: value >= target };
  });

const LADDERS = [
  { key: 'checkins', title: 'Total check-ins', unit: 'check-ins', icon: 'calendar', steps: [1, 3, 7, 14, 30, 60], metric: (s) => s.totalCheckIns },
  { key: 'ves', title: 'VEs earned', unit: 'VEs', icon: 'coins', steps: [50, 100, 250, 500, 1000], metric: (s) => s.vesEarned },
  { key: 'giftcards', title: 'Gift card value', unit: '₹', icon: 'gift', steps: [1, 5, 10, 25, 50], metric: (s) => s.giftCardInr },
  { key: 'streak', title: 'Best streak', unit: 'days', icon: 'flame', steps: [1, 3, 5, 7], metric: (s) => s.longestStreak },
];

const buildMilestones = (stats) =>
  LADDERS.map(({ metric, steps, ...meta }) => {
    const current = metric(stats);
    const nextTarget = steps.find((t) => current < t) ?? null;
    const prevTarget = [...steps].reverse().find((t) => current >= t) ?? 0;
    const percentToNext =
      nextTarget === null ? 100 : Math.round(((current - prevTarget) / (nextTarget - prevTarget)) * 100);
    return {
      ...meta,
      current,
      steps: steps.map((target) => ({ target, reached: current >= target })),
      next: nextTarget === null ? null : { target: nextTarget, remaining: nextTarget - current },
      percentToNext,
    };
  });

/** Newest-first activity feed built from wallet transactions. */
const buildActivity = (txns = [], limit = 10) =>
  txns
    .filter(isCredit)
    .slice(0, limit)
    .map((t) => ({
      transactionId: t.transactionId,
      day: t.streakDay,
      amount: t.amount,
      currency: t.currency,
      source: t.source,
      fulfilmentStatus: t.fulfilmentStatus,
      balanceAfter: t.balanceAfter,
      at: t.createdAt,
    }));

module.exports = {
  normalizeTzOffset,
  dayKey,
  computeStats,
  buildWeek,
  buildAchievements,
  buildMilestones,
  buildActivity,
};
