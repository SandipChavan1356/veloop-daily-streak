const mongoose = require('mongoose');

const streakClaimSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakCycle', required: true },
    cycleNumber: { type: Number },
    day: { type: Number, required: true, min: 1 },
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakReward', required: true },
   
    rewardSnapshot: {
      type: { type: String },
      currency: { type: String },
      amount: { type: Number },
      title: { type: String },
      subtitle: { type: String },
      assetType: { type: String },
    },
    status: { type: String, enum: ['CLAIMED'], default: 'CLAIMED' },
    claimedAt: { type: Date, required: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WalletTransaction' },
    referenceId: { type: String },
  },
  { timestamps: true }
);

streakClaimSchema.index({ userId: 1, cycleId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('StreakClaim', streakClaimSchema);
