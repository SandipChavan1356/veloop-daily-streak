const test = require('node:test');
const assert = require('node:assert/strict');
const { isEligibleNow, isCycleMissed } = require('../../src/services/streak.service');

test('Day 1 with no nextClaimAt is immediately eligible', () => {
  const cycle = { nextClaimAt: null, claimDeadline: null };
  assert.equal(isEligibleNow(cycle, new Date()), true);
});

test('Day 1 with no claimDeadline can never be "missed" (doc edge case 51)', () => {
  const cycle = { nextClaimAt: null, claimDeadline: null };
  const farFuture = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  assert.equal(isCycleMissed(cycle, farFuture), false);
});

test('locked day is not eligible before nextClaimAt', () => {
  const now = new Date('2026-01-02T12:00:00Z');
  const cycle = { nextClaimAt: new Date('2026-01-02T18:00:00Z'), claimDeadline: null };
  assert.equal(isEligibleNow(cycle, now), false);
});

test('unlocks exactly at nextClaimAt (inclusive)', () => {
  const t = new Date('2026-01-02T18:00:00Z');
  const cycle = { nextClaimAt: t, claimDeadline: null };
  assert.equal(isEligibleNow(cycle, t), true);
});

test('within the claim window after unlock: not missed', () => {
  const nextClaimAt = new Date('2026-01-02T18:00:00Z');
  const claimDeadline = new Date('2026-01-03T18:00:00Z');
  const now = new Date('2026-01-03T00:00:00Z');
  assert.equal(isCycleMissed({ nextClaimAt, claimDeadline }, now), false);
});

test('past the claim deadline: missed', () => {
  const nextClaimAt = new Date('2026-01-02T18:00:00Z');
  const claimDeadline = new Date('2026-01-03T18:00:00Z');
  const now = new Date('2026-01-03T18:00:01Z');
  assert.equal(isCycleMissed({ nextClaimAt, claimDeadline }, now), true);
});

test('changing device clock cannot fool eligibility (server-time inputs only)', () => {
  // The function only ever trusts the `now` value the SERVER computed
  // (clock.now()), never anything from the client - this test documents that
  // contract: passing a "device time" here would be a bug at the call site,
  // not something isEligibleNow itself can be tricked by, since it never reads req.body.
  const cycle = { nextClaimAt: new Date('2026-01-02T18:00:00Z'), claimDeadline: null };
  const fakeUserClock = new Date('2026-01-02T17:59:59Z'); // user set clock forward, still not real time
  assert.equal(isEligibleNow(cycle, fakeUserClock), false);
});
