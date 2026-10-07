const { AuditLog } = require('../models');

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
