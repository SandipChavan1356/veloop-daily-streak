const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const clock = require('../utils/clock');
const audit = require('../utils/audit');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post(
  '/time-travel',
  protect,
  asyncHandler(async (req, res) => {
    const { hours = 0, minutes = 0 } = req.body || {};
    const ms = Number(hours) * 60 * 60 * 1000 + Number(minutes) * 60 * 1000;
    if (!Number.isFinite(ms) || ms <= 0) {
      throw new ApiError(400, 'Provide a positive hours/minutes offset.', 'INVALID_INPUT');
    }
    const offset = clock.advance(ms);
    await audit(req.user.id, 'DEV_TIME_TRAVEL', { advancedMs: ms, newOffsetMs: offset });
    res.json({ success: true, offsetMs: offset, serverTime: clock.now().toISOString() });
  })
);

router.post(
  '/time-reset',
  protect,
  asyncHandler(async (req, res) => {
    clock.reset();
    res.json({ success: true, offsetMs: 0, serverTime: clock.now().toISOString() });
  })
);

module.exports = router;
