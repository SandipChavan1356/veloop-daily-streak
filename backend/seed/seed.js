require('dotenv').config();
const mongoose = require('mongoose');
const { User, Wallet, StreakConfig, StreakReward } = require('../src/models');

// Matches the supplied VELoop design exactly (doc section 19).
const rewards = [
  { day: 1, rewardType: 'VES', currency: 'VES', amount: 5, title: 'Daily Reward', subtitle: '5 VEs', assetType: 'coin' },
  { day: 2, rewardType: 'VES', currency: 'VES', amount: 10, title: 'Daily Reward', subtitle: '10 VEs', assetType: 'coin' },
  { day: 3, rewardType: 'VES', currency: 'VES', amount: 15, title: 'Daily Reward', subtitle: '15 VEs', assetType: 'coin' },
  {
    day: 4,
    rewardType: 'GIFT_CARD',
    currency: 'INR',
    amount: 1,
    title: 'Daily Reward',
    subtitle: 'Amazon Gift Card',
    assetType: 'gift-box',
    badge: 'Gift Card',
  },
  {
    day: 5,
    rewardType: 'GIFT_CARD',
    currency: 'INR',
    amount: 2,
    title: 'Daily Reward',
    subtitle: 'Amazon Gift Card',
    assetType: 'gift-card',
    badge: 'Gift Card',
  },
  { day: 6, rewardType: 'VES', currency: 'VES', amount: 30, title: 'Daily Reward', subtitle: '30 VEs', assetType: 'coin', badge: 'Coin' },
  {
    day: 7,
    rewardType: 'GIFT_CARD',
    currency: 'INR',
    amount: 5,
    title: 'Ultimate Reward',
    subtitle: 'Amazon Gift Card',
    assetType: 'crown',
    badge: 'VIP',
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await StreakConfig.findOneAndUpdate(
    { key: 'default' },
    {
      key: 'default',
      totalDays: 7,
      claimIntervalMinutes: 1440, // 24h
      claimWindowMinutes: 1440, // 24h grace window to claim before it's "missed"
      resetOnMiss: true,
      adVerification: { required: true, minSeconds: 3, ttlSeconds: 120 },
      active: true,
    },
    { upsert: true }
  );
  console.log('StreakConfig ready.');

  for (const r of rewards) {
    await StreakReward.findOneAndUpdate({ day: r.day }, r, { upsert: true });
  }
  console.log('7 StreakReward days ready.');

  const demoEmail = 'demo@veloop.test';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    demoUser = await User.create({ username: 'demo', email: demoEmail, password: 'Demo@1234' });
    await Wallet.create({ userId: demoUser._id, balances: { VES: 100, INR: 0 } });
    console.log('Demo user created -> demo@veloop.test / Demo@1234');
  } else {
    console.log('Demo user already exists, skipping.');
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
