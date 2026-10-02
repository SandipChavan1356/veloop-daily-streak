const test = require('node:test');
const assert = require('node:assert/strict');

// Re-implement the guard's shape check in isolation would duplicate logic, so
// instead we exercise the actual middleware function directly.
const { sanitizeInput } = require('../../src/middleware/sanitize.middleware');

const run = (body) => {
  let threw = null;
  const req = { body, query: {} };
  try {
    sanitizeInput(req, {}, () => {});
  } catch (e) {
    threw = e;
  }
  return threw;
};

test('rejects NoSQL operator injection like {"$gt": ""}', () => {
  const err = run({ email: { $gt: '' } });
  assert.ok(err, 'expected sanitizeInput to throw');
  assert.equal(err.code, 'INVALID_INPUT');
});

test('allows normal plain objects', () => {
  const err = run({ day: 2, sessionToken: 'abc' });
  assert.equal(err, null);
});
