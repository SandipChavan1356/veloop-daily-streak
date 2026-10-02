const asyncHandler = require('../utils/asyncHandler');
const walletService = require('../services/wallet.service');
const { WalletTransaction } = require('../models');

const getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getOrCreateWallet(req.user.id);
  res.json({ success: true, balances: Object.fromEntries(wallet.balances) });
});

const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    WalletTransaction.countDocuments({ userId: req.user.id }),
  ]);

  res.json({ success: true, page, limit, total, transactions });
});

module.exports = { getWallet, getTransactions };
