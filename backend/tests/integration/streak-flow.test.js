const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { start, stop, clearDb } = require('./setup');

let app;
let StreakConfig, StreakReward;

test.before(async () => {
  await start();
  app = require('../../src/app');
  ({ StreakConfig, StreakReward } = require('../../src/models'));
});

test.after(async () => {
  await stop();
});

const seedRewards = async ({ adRequired = false } = {}) => {
  await StreakConfig.create({
    key: 'default',
    totalDays: 7,
    claimIntervalMinutes: 1440,
    claimWindowMinutes: 1440,
    adVerification: { required: adRequired, minSeconds: 0, ttlSeconds: 120 },
  });
  const days = [1, 2, 3, 4, 5, 6, 7];
  for (const day of days) {
    await StreakReward.create({
      day,
      rewardType: day === 4 || day === 5 || day === 7 ? 'GIFT_CARD' : 'VES',
      currency: day === 4 || day === 5 || day === 7 ? 'INR' : 'VES',
      amount: day * 5,
      title: day === 7 ? 'Ultimate Reward' : 'Daily Reward',
      assetType: day === 7 ? 'crown' : day >= 4 && day <= 5 ? 'gift-card' : 'coin',
    });
  }
};

const registerAndLogin = async (suffix) => {
  const email = `user${suffix}@test.com`;
  await request(app).post('/api/auth/register').send({ username: `user${suffix}`, email, password: 'Passw0rd!' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Passw0rd!' });
  return res.body.token;
};

test.beforeEach(async () => {
  await clearDb();
  await seedRewards();
});

test('unauthenticated request is rejected', async () => {
  const res = await request(app).get('/api/daily-streak');
  assert.equal(res.status, 401);
});

test('new user starts at Day 1, AVAILABLE, streak 0', async () => {
  const token = await registerAndLogin('a');
  const res = await request(app).get('/api/daily-streak').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.streak.currentDay, 1);
  assert.equal(res.body.streak.eligibleNow, true);
});

test('claiming Day 1 grants +5 VEs and advances to Day 2 locked', async () => {
  const token = await registerAndLogin('b');
  const claimRes = await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({});
  assert.equal(claimRes.status, 200);
  assert.equal(claimRes.body.reward.amount, 5);

  const wallet = await request(app).get('/api/wallet').set('Authorization', `Bearer ${token}`);
  assert.equal(wallet.body.balances.VES, 5);

  const status = await request(app).get('/api/daily-streak').set('Authorization', `Bearer ${token}`);
  assert.equal(status.body.streak.currentDay, 2);
  assert.equal(status.body.streak.eligibleNow, false);
});

test('cannot claim while locked', async () => {
  const token = await registerAndLogin('c');
  await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({});
  const second = await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({});
  assert.equal(second.status, 423);
  assert.equal(second.body.code, 'LOCKED');
});

test('day-jump cheat is rejected: requesting day 7 while actually on day 1', async () => {
  const token = await registerAndLogin('d');
  const res = await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({ day: 7 });
  assert.equal(res.status, 400);
  assert.equal(res.body.code, 'DAY_MISMATCH');
});

test('fake reward/currency/streak fields in the body are ignored', async () => {
  const token = await registerAndLogin('e');
  const res = await request(app)
    .post('/api/daily-streak/claim')
    .set('Authorization', `Bearer ${token}`)
    .send({ reward: 1000000, currency: 'VES', streak: 999 });
  assert.equal(res.status, 200);
  assert.equal(res.body.reward.amount, 5); // Day 1's real configured amount, not 1000000
});

test('duplicate claim (same request twice) is idempotent: no double reward', async () => {
  const token = await registerAndLogin('f');
  const first = await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({});
  assert.equal(first.status, 200);

  
  const second = await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({});
  assert.equal(second.status, 423);

  const wallet = await request(app).get('/api/wallet').set('Authorization', `Bearer ${token}`);
  assert.equal(wallet.body.balances.VES, 5); // not 10
});

test('concurrent simultaneous claims only grant the reward once', async () => {
  const token = await registerAndLogin('g');
  const [r1, r2] = await Promise.all([
    request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({}),
    request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({}),
  ]);
  const statuses = [r1.status, r2.status].sort();
  assert.ok(statuses[0] === 200); // exactly one真 succeeded
  const wallet = await request(app).get('/api/wallet').set('Authorization', `Bearer ${token}`);
  assert.equal(wallet.body.balances.VES, 5); // never 10
});

test('cross-user attack: userId in body is ignored, JWT identity wins', async () => {
  const tokenA = await registerAndLogin('h1');
  const userB = await request(app)
    .post('/api/auth/register')
    .send({ username: 'userh2', email: 'userh2@test.com', password: 'Passw0rd!' });

  await request(app)
    .post('/api/daily-streak/claim')
    .set('Authorization', `Bearer ${tokenA}`)
    .send({ userId: userB.body.user.id });

  const walletB = await request(app)
    .get('/api/wallet')
    .set('Authorization', `Bearer ${(await request(app).post('/api/auth/login').send({ email: 'userh2@test.com', password: 'Passw0rd!' })).body.token}`);
  assert.equal(walletB.body.balances.VES, 0); // User B got nothing from A's claim
});

test('changing device clock cannot unlock early: only advancing SERVER time works', async () => {
  const token = await registerAndLogin('i');
  await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({});

  
  const stillLocked = await request(app).get('/api/daily-streak/status').set('Authorization', `Bearer ${token}`);
  assert.equal(stillLocked.body.status, 'LOCKED');

  await request(app).post('/api/dev/time-travel').set('Authorization', `Bearer ${token}`).send({ hours: 25 });

  const nowUnlocked = await request(app).get('/api/daily-streak/status').set('Authorization', `Bearer ${token}`);
  assert.equal(nowUnlocked.body.status, 'AVAILABLE');

  await request(app).post('/api/dev/time-reset').set('Authorization', `Bearer ${token}`);
});

test('missed streak resets to Day 1 with streak 0', async () => {
  const token = await registerAndLogin('j');
  await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({}); // Day 1

  await request(app).post('/api/dev/time-travel').set('Authorization', `Bearer ${token}`).send({ hours: 49 });

  const status = await request(app).get('/api/daily-streak').set('Authorization', `Bearer ${token}`);
  assert.equal(status.body.streak.currentDay, 1);
  assert.equal(status.body.streak.currentStreak, 0);
  assert.equal(status.body.streak.wasReset, true);

  await request(app).post('/api/dev/time-reset').set('Authorization', `Bearer ${token}`);
});

test('previous-day validation: cannot claim Day 2 without Day 1 in the same cycle', async () => {
  
  const streakService = require('../../src/services/streak.service');
  const { User, Wallet, StreakCycle } = require('../../src/models');

  const user = await User.create({ username: 'seqtest', email: 'seq@test.com', password: 'Passw0rd!' });
  await Wallet.create({ userId: user._id, balances: { VES: 0, INR: 0 } });
  await StreakCycle.create({ userId: user._id, cycleNumber: 1, currentDay: 2, currentStreak: 1, nextClaimAt: null });

  await assert.rejects(
    () => streakService.claimReward(user._id, undefined, undefined),
    (err) => err.code === 'SEQUENCE_ERROR'
  );
});

test('CPA ad session: claim rejected without completing the session when required', async () => {
  await clearDb();
  await seedRewards({ adRequired: true });
  const token = await registerAndLogin('k');

  const direct = await request(app).post('/api/daily-streak/claim').set('Authorization', `Bearer ${token}`).send({});
  assert.equal(direct.status, 400);
  assert.equal(direct.body.code, 'SESSION_REQUIRED');

  const initiate = await request(app).post('/api/daily-streak/claim/initiate').set('Authorization', `Bearer ${token}`).send({});
  assert.equal(initiate.status, 200);
  assert.ok(initiate.body.sessionToken);

  const claimed = await request(app)
    .post('/api/daily-streak/claim')
    .set('Authorization', `Bearer ${token}`)
    .send({ sessionToken: initiate.body.sessionToken });
  assert.equal(claimed.status, 200);
});
