const rateLimit = require('express-rate-limit');

const build = ({ windowMs, limit, message, perUser = false }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (perUser && req.user ? `u:${req.user.id}` : req.ip),
    message: { success: false, code: 'RATE_LIMITED', message },
  });

// Login/register brute-force protection (per IP)
const authLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: 'Too many attempts. Please try again later.',
});

// Claim + initiate: the real backend guard behind the frontend's disabled button (per user)
const claimLimiter = build({
  windowMs: 60 * 1000,
  limit: 10,
  perUser: true,
  message: 'Too many requests. Please slow down and try again.',
});

// General read limiter for status/history/wallet (per user)
const readLimiter = build({
  windowMs: 60 * 1000,
  limit: 120,
  perUser: true,
  message: 'Too many requests. Please slow down and try again.',
});

module.exports = { authLimiter, claimLimiter, readLimiter };
