const { Wallet } = require('../models');

const getOrCreateWallet = async (userId, session) => {
  let wallet = await Wallet.findOne({ userId }).session(session || null);
  if (!wallet) {
    const created = await Wallet.create([{ userId, balances: { VES: 0, INR: 0 } }], { session });
    wallet = created[0];
  }
  return wallet;
};


const creditWallet = async (userId, currency, amount, session) => {
  const wallet = await getOrCreateWallet(userId, session);
  const balanceBefore = wallet.balances.get(currency) || 0;
  const balanceAfter = balanceBefore + amount;

  wallet.balances.set(currency, balanceAfter);
  await wallet.save({ session });

  return { balanceBefore, balanceAfter };
};

module.exports = { getOrCreateWallet, creditWallet };
