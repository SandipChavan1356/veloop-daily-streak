const test = require('node:test');
const assert = require('node:assert/strict');
const clock = require('../../src/utils/clock');

test('clock.advance/reset shifts and restores server time', () => {
  clock.reset();
  const before = clock.now().getTime();
  clock.advance(1000 * 60 * 60); // +1h
  const after = clock.now().getTime();
  assert.ok(after - before >= 1000 * 60 * 60 - 50); // allow tiny scheduling drift
  clock.reset();
  assert.equal(clock.getOffsetMs(), 0);
});
