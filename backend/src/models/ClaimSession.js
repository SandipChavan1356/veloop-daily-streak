const mongoose = require('mongoose');

// Server-side record of "the user started a claim and is watching the CPA/ad step".
// The reward is only granted by POST /claim, which consumes this session atomically.
// The real CPA integration later plugs in between initiate and claim.
const claimSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakCycle', required: true },
    day: { type: Number, required: true },
    status: { type: String, enum: ['PENDING', 'CONSUMED', 'EXPIRED'], default: 'PENDING' },
    minCompleteAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Housekeeping: Mongo deletes sessions a day after creation.
claimSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

module.exports = mongoose.model('ClaimSession', claimSessionSchema);
