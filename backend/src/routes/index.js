const express = require('express');
const { env } = require('../config/env');
const authRoutes = require('./auth.routes');
const streakRoutes = require('./streak.routes');
const walletRoutes = require('./wallet.routes');
const insightsRoutes = require('./insights.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/daily-streak', streakRoutes);
router.use('/wallet', walletRoutes);
router.use('/insights', insightsRoutes);

if (env.enableDevTools) {
  router.use('/dev', require('./dev.routes'));
}

module.exports = router;
