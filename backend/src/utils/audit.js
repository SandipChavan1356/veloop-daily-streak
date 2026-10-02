const { AuditLog } = require('../models');

// Audit logging must never break a user request. Failures are logged and swallowed.
const audit = async (userId, event, details = {}, meta = {}) => {
  try {
    await AuditLog.create({
      userId: userId || null,
      event,
      details,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  } catch (err) {
    console.error('[audit] failed to write log:', err.message);
  }
};

module.exports = audit;
