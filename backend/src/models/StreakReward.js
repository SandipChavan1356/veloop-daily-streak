const mongoose = require('mongoose');

const streakRewardSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, unique: true, min: 1 },
    rewardType: { type: String, required: true, enum: ['VES', 'GIFT_CARD'] },
    currency: { type: String, required: true, enum: ['VES', 'INR'] },
    amount: { type: Number, required: true, min: 0 },
    title: { type: String, required: true }, // "Daily Reward" / "Ultimate Reward"
    subtitle: { type: String }, // "10 VEs" / "Amazon Gift Card"
    description: { type: String },
    assetType: { type: String, enum: ['coin', 'gift-box', 'gift-card', 'crown'], required: true },
    badge: { type: String }, // "Gift Card" | "Coin" | "VIP" (the "Today" badge is dynamic)
    active: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakReward', streakRewardSchema);
