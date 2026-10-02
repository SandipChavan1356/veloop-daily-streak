const express = require('express');
const { getWallet, getTransactions } = require('../controllers/wallet.controller');
const { protect } = require('../middleware/auth.middleware');
const { readLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(protect);
router.get('/', readLimiter, getWallet);
router.get('/transactions', readLimiter, getTransactions);

module.exports = router;
