const test = require('node:test');
const assert = require('node:assert/strict');
const ApiError = require('../../src/utils/ApiError');

test('ApiError carries statusCode, code and optional data', () => {
  const err = new ApiError(423, 'locked', 'LOCKED', { nextClaimAt: 'x' });
  assert.equal(err.statusCode, 423);
  assert.equal(err.code, 'LOCKED');
  assert.equal(err.message, 'locked');
  assert.deepEqual(err.data, { nextClaimAt: 'x' });
});

test('ApiError defaults code to ERROR', () => {
  const err = new ApiError(500, 'oops');
  assert.equal(err.code, 'ERROR');
});
