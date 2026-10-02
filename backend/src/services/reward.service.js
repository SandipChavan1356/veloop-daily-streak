const { StreakReward } = require('../models');

const getRewardForDay = (day) => StreakReward.findOne({ day, active: true });

const getAllActiveRewards = () => StreakReward.find({ active: true }).sort({ day: 1 });

// Snapshot of exactly what was granted, frozen onto the StreakClaim record.
// If an admin later changes Day 2 from 10 VEs to 15 VEs, past history stays truthful.
const snapshotReward = (reward) => ({
  type: reward.rewardType,
  currency: reward.currency,
  amount: reward.amount,
  title: reward.title,
  subtitle: reward.subtitle,
  assetType: reward.assetType,
});

module.exports = { getRewardForDay, getAllActiveRewards, snapshotReward };
