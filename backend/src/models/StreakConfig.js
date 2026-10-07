const mongoose = require('mongoose');

const streakConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    totalDays: { type: Number, required: true, default: 7, min: 1 },
    claimIntervalMinutes: { type: Number, required: true, default: 1440, min: 0 },
    claimWindowMinutes: { type: Number, required: true, default: 1440, min: 1 },
    resetOnMiss: { type: Boolean, default: true },
    adVerification: {
      required: { type: Boolean, default: false },
      minSeconds: { type: Number, default: 3, min: 0 },
      ttlSeconds: { type: Number, default: 120, min: 10 },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StreakConfig', streakConfigSchema);
