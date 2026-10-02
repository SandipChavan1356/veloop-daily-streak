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
    // ACTIVE = in progress. COMPLETED = all days claimed (kept until the next cycle starts).
    // RESET = abandoned because a claim window was missed.
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'RESET'], default: 'ACTIVE' },
    currentDay: { type: Number, required: true, default: 1 },
    currentStreak: { type: Number, required: true, default: 0 },
    startedAt: { type: Date, default: Date.now },
    lastClaimedAt: { type: Date, default: null },
    // null = claimable right now. A timestamp = locked until then.
    nextClaimAt: { type: Date, default: null },
    // nextClaimAt + claimWindow. Past this moment without a claim = streak missed.
    claimDeadline: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    resetAt: { type: Date, default: null },
    // Set on the cycle that STARTS after a miss, so the UI can show the reset notice.
    resetInfo: { type: resetInfoSchema, default: null },
  },
  { timestamps: true }
);

// Race-safe cycle creation: two simultaneous requests can never create the same cycle...
streakCycleSchema.index({ userId: 1, cycleNumber: 1 }, { unique: true });
// ...and a user can never have two ACTIVE cycles.
streakCycleSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' }, name: 'one_active_cycle_per_user' }
);

module.exports = mongoose.model('StreakCycle', streakCycleSchema);
