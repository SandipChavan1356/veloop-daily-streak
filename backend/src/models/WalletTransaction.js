const mongoose = require('mongoose');
const crypto = require('crypto');

const walletTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      default: () => `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], default: 'CREDIT' },
    rewardType: { type: String, enum: ['VES', 'GIFT_CARD'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['VES', 'INR'], required: true },
    source: { type: String, default: 'DAILY_STREAK' },
    streakDay: { type: Number },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakClaim' },
    referenceId: { type: String, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    fulfilmentStatus: { type: String, enum: ['NOT_REQUIRED', 'PENDING', 'FULFILLED'], default: 'NOT_REQUIRED' },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ claimId: 1 }, { unique: true, sparse: true });
walletTransactionSchema.index({ source: 1, referenceId: 1 }, { unique: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
