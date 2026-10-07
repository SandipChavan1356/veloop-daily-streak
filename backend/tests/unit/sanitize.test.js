const test = require('node:test');
const assert = require('node:assert/strict');


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
