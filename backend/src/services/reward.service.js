const { StreakReward } = require('../models');

const getRewardForDay = (day) => StreakReward.findOne({ day, active: true });

const getAllActiveRewards = () => StreakReward.find({ active: true }).sort({ day: 1 });

const snapshotReward = (reward) => ({
  type: reward.rewardType,
  currency: reward.currency,
  amount: reward.amount,
  title: reward.title,
  subtitle: reward.subtitle,
  assetType: reward.assetType,
});

module.exports = { getRewardForDay, getAllActiveRewards, snapshotReward };
