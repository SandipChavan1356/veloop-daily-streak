const mongoose = require('mongoose');

const resetInfoSchema = new mongoose.Schema(
  {
    previousCycleId: { type: mongoose.Schema.Types.ObjectId, ref: 'StreakCycle' },
    previousStreak: { type: Number, default: 0 },
    missedDay: { type: Number, default: 1 },
    resetAt: { type: Date },
  },
  { _id: false }
);

const streakCycleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cycleNumber: { type: Number, required: true, default: 1 },
    
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'RESET'], default: 'ACTIVE' },
    currentDay: { type: Number, required: true, default: 1 },
    currentStreak: { type: Number, required: true, default: 0 },
    startedAt: { type: Date, default: Date.now },
    lastClaimedAt: { type: Date, default: null },
    nextClaimAt: { type: Date, default: null },
    claimDeadline: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    resetAt: { type: Date, default: null },
    resetInfo: { type: resetInfoSchema, default: null },
  },
  { timestamps: true }
);

streakCycleSchema.index({ userId: 1, cycleNumber: 1 }, { unique: true });
streakCycleSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' }, name: 'one_active_cycle_per_user' }
);

module.exports = mongoose.model('StreakCycle', streakCycleSchema);
