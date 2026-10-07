const { WalletTransaction } = require('../models');


const recordClaimTransaction = async ({ userId, reward, streakDay, claimId, balanceBefore, balanceAfter, session }) => {
  const referenceId = `STREAK-${claimId.toString().slice(-8).toUpperCase()}`;

  const [transaction] = await WalletTransaction.create(
    [
      {
        userId,
        type: 'CREDIT',
        rewardType: reward.rewardType,
        amount: reward.amount,
        currency: reward.currency,
        source: 'DAILY_STREAK',
        streakDay,
        claimId,
        referenceId,
        balanceBefore,
        balanceAfter,
        fulfilmentStatus: reward.rewardType === 'GIFT_CARD' ? 'PENDING' : 'NOT_REQUIRED',
        status: 'SUCCESS',
      },
    ],
    { session }
  );

  return transaction;
};

module.exports = { recordClaimTransaction };
