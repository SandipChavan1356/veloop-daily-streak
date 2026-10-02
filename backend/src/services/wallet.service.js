const { Wallet } = require('../models');

const getOrCreateWallet = async (userId, session) => {
  let wallet = await Wallet.findOne({ userId }).session(session || null);
  if (!wallet) {
    const created = await Wallet.create([{ userId, balances: { VES: 0, INR: 0 } }], { session });
    wallet = created[0];
  }
  return wallet;
};

// Credits `amount` of `currency` to the wallet and returns the before/after balances.
// VES = spendable gems, credited immediately and usable in-app.
// INR = gift-card value earned; still recorded here so "balance" is always truthful,
// but the actual gift card is fulfilled manually by the VELoop team (see WalletTransaction.fulfilmentStatus).
const creditWallet = async (userId, currency, amount, session) => {
  const wallet = await getOrCreateWallet(userId, session);
  const balanceBefore = wallet.balances.get(currency) || 0;
  const balanceAfter = balanceBefore + amount;

  wallet.balances.set(currency, balanceAfter);
  await wallet.save({ session });

  return { balanceBefore, balanceAfter };
};

module.exports = { getOrCreateWallet, creditWallet };
