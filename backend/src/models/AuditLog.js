const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    event: {
      type: String,
      required: true,
      enum: [
        'STREAK_CLAIM_INITIATED',
        'STREAK_CLAIM_REQUEST',
        'STREAK_CLAIM_SUCCESS',
        'STREAK_CLAIM_REJECTED',
        'STREAK_RESET',
        'DUPLICATE_CLAIM',
        'INVALID_CLAIM',
        'DEV_TIME_TRAVEL',
      ],
    },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ event: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
