const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // VES = spendable gems. INR = gift-card value earned (fulfilled manually by the VELoop team).
    balances: { type: Map, of: Number, default: () => ({ VES: 0, INR: 0 }) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);
