const test = require('node:test');
const assert = require('node:assert/strict');
const calc = require('../../src/utils/insights.calc');

const NOW = new Date('2026-09-30T10:00:00.000Z');
const hoursAgo = (h) => new Date(NOW.getTime() - h * 3600 * 1000);

const claim = (cycleId, day, at) => ({ cycleId, day, claimedAt: at });
const txn = (over) => ({
  transactionId: `TXN-${Math.random()}`,
  type: 'CREDIT',
  status: 'SUCCESS',
  currency: 'VES',
  amount: 5,
  fulfilmentStatus: 'NOT_REQUIRED',
  createdAt: NOW,
  ...over,
});

test('normalizeTzOffset clamps and defaults', () => {
  assert.equal(calc.normalizeTzOffset('330'), 330);
  assert.equal(calc.normalizeTzOffset('99999'), 840);
  assert.equal(calc.normalizeTzOffset('-99999'), -840);
  assert.equal(calc.normalizeTzOffset('abc'), 0);
  assert.equal(calc.normalizeTzOffset(undefined), 0);
});

test('dayKey buckets a claim into the caller\'s local day', () => {
  // 20:00 UTC is already the next day in IST (+5:30)
  const at = new Date('2026-09-30T20:00:00.000Z');
  assert.equal(calc.dayKey(at, 0), '2026-09-30');
  assert.equal(calc.dayKey(at, 330), '2026-10-01');
});

test('computeStats: empty history is all zeros', () => {
  const s = calc.computeStats({ now: NOW });
  assert.deepEqual(
    [s.totalCheckIns, s.currentStreak, s.longestStreak, s.vesEarned, s.giftCardInr, s.cyclesCompleted],
    [0, 0, 0, 0, 0, 0]
  );
});

test('computeStats: longest streak is the biggest claim count in one cycle', () => {
  const claims = [
    claim('A', 1, hoursAgo(200)), claim('A', 2, hoursAgo(176)), claim('A', 3, hoursAgo(152)), // reset after day 3
    claim('B', 1, hoursAgo(50)), claim('B', 2, hoursAgo(26)),
  ];
  const cycles = [
    { _id: 'A', status: 'RESET', currentStreak: 3 },
    { _id: 'B', status: 'ACTIVE', currentStreak: 2, claimDeadline: new Date(NOW.getTime() + 3600e3) },
  ];
  const s = calc.computeStats({ claims, cycles, now: NOW });
  assert.equal(s.longestStreak, 3);
  assert.equal(s.currentStreak, 2);
  assert.equal(s.totalCheckIns, 5);
  assert.equal(s.hasReset, true);
});

test('computeStats: an expired claim window reads as a broken streak even before the reset is persisted', () => {
  const cycles = [{ _id: 'A', status: 'ACTIVE', currentStreak: 4, claimDeadline: hoursAgo(1) }];
  assert.equal(calc.computeStats({ cycles, now: NOW }).currentStreak, 0);
});

test('computeStats: sums VES and gift-card INR separately, ignores FAILED and DEBIT', () => {
  const txns = [
    txn({ amount: 5 }),
    txn({ amount: 10 }),
    txn({ amount: 999, status: 'FAILED' }),
    txn({ amount: 50, type: 'DEBIT' }),
    txn({ currency: 'INR', amount: 1, fulfilmentStatus: 'PENDING' }),
    txn({ currency: 'INR', amount: 2, fulfilmentStatus: 'FULFILLED' }),
  ];
  const s = calc.computeStats({ txns, now: NOW });
  assert.equal(s.vesEarned, 15);
  assert.equal(s.giftCardInr, 3);
  assert.equal(s.giftCardCount, 2);
  assert.equal(s.pendingGiftCards, 1);
});

test('buildWeek returns 7 local days ending today with claims and VES bucketed correctly', () => {
  const claims = [claim('A', 1, hoursAgo(2)), claim('A', 2, hoursAgo(50))];
  const txns = [txn({ amount: 5, createdAt: hoursAgo(2) }), txn({ amount: 10, createdAt: hoursAgo(50) })];
  const week = calc.buildWeek({ claims, txns, now: NOW, tzOffsetMin: 0 });
  assert.equal(week.length, 7);
  assert.equal(week[6].isToday, true);
  assert.equal(week[6].date, '2026-09-30');
  assert.equal(week[6].label, 'Wed');
  assert.equal(week[6].claimed, true);
  assert.equal(week[6].vesEarned, 5);
  assert.equal(week[4].date, '2026-09-28');
  assert.equal(week[4].claimed, true);
  assert.equal(week[4].vesEarned, 10);
  assert.equal(week.filter((d) => d.claimed).length, 2);
});

test('buildAchievements unlocks by metric and caps progress at target', () => {
  const stats = { totalCheckIns: 20, currentStreak: 2, longestStreak: 7, cyclesCompleted: 1, hasReset: false, vesEarned: 120, giftCardInr: 0, giftCardCount: 0, pendingGiftCards: 0 };
  const list = calc.buildAchievements(stats);
  const by = Object.fromEntries(list.map((a) => [a.key, a]));
  assert.equal(by.first_step.unlocked, true);
  assert.equal(by.warming_up.unlocked, true);
  assert.equal(by.full_cycle.unlocked, true);
  assert.equal(by.century.unlocked, true);
  assert.equal(by.habit.unlocked, true);
  assert.equal(by.gift_getter.unlocked, false);
  assert.equal(by.ves_vault.unlocked, false);
  assert.equal(by.ves_vault.progress, 120);
  assert.equal(by.century.progress, 100); // capped at target
  assert.equal(by.comeback.unlocked, false); // never reset
});

test('buildMilestones reports next step, remaining and percent-to-next', () => {
  const stats = { totalCheckIns: 5, longestStreak: 5, vesEarned: 75, giftCardInr: 0 };
  const m = Object.fromEntries(calc.buildMilestones(stats).map((x) => [x.key, x]));
  assert.deepEqual(m.checkins.next, { target: 7, remaining: 2 });
  assert.equal(m.checkins.percentToNext, 50); // 3 -> 7, at 5
  assert.equal(m.ves.next.target, 100);
  assert.equal(m.ves.percentToNext, 50); // 50 -> 100, at 75
  assert.equal(m.giftcards.next.target, 1);
  assert.equal(m.giftcards.percentToNext, 0);
  const maxed = calc.buildMilestones({ totalCheckIns: 500, longestStreak: 7, vesEarned: 9999, giftCardInr: 999 });
  assert.ok(maxed.every((x) => x.next === null && x.percentToNext === 100));
});

test('buildActivity is newest-first, skips failed/debit, and honours the limit', () => {
  const txns = [txn({ amount: 1 }), txn({ amount: 2, status: 'FAILED' }), txn({ amount: 3 }), txn({ amount: 4 })];
  const feed = calc.buildActivity(txns, 2);
  assert.deepEqual(feed.map((f) => f.amount), [1, 3]);
});
