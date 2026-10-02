const mongoose = require('mongoose');

// Singleton document (key = "default"). Every streak rule lives here, not in code.
const streakConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'default' },
    totalDays: { type: Number, required: true, default: 7, min: 1 },
    // Minutes between one claim and the next becoming claimable (1440 = 24h).
    claimIntervalMinutes: { type: Number, required: true, default: 1440, min: 0 },
    // How long the user has to claim once it unlocks before the streak is considered missed.
    claimWindowMinutes: { type: Number, required: true, default: 1440, min: 1 },
    resetOnMiss: { type: Boolean, default: true },
    // Placeholder hook for the real CPA/ad integration (see ClaimSession).
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
