const express = require('express');
const { getDailyStreak, getStatus, initiateClaim, claim, getHistory } = require('../controllers/streak.controller');
const { protect } = require('../middleware/auth.middleware');
const { claimLimiter, readLimiter } = require('../middleware/rateLimiter.middleware');
const { validateClaimBody } = require('../validators/streak.validator');

const router = express.Router();

router.use(protect); // every daily-streak route requires a logged-in user

router.get('/', readLimiter, getDailyStreak);
router.get('/status', readLimiter, getStatus);
router.post('/claim/initiate', claimLimiter, validateClaimBody, initiateClaim);
router.post('/claim', claimLimiter, validateClaimBody, claim);
router.get('/history', readLimiter, getHistory);

module.exports = router;
