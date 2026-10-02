const express = require('express');
const { overview, achievements, milestones, activity, leaderboard } = require('../controllers/insights.controller');
const { protect } = require('../middleware/auth.middleware');
const { readLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(protect);
router.get('/overview', readLimiter, overview);
router.get('/achievements', readLimiter, achievements);
router.get('/milestones', readLimiter, milestones);
router.get('/activity', readLimiter, activity);
router.get('/leaderboard', readLimiter, leaderboard);

module.exports = router;
