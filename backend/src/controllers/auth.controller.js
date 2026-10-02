const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const { User, Wallet } = require('../models');

const register = asyncHandler(async (req, res) => {
  const username = req.body.username.trim();
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError(409, 'An account with that username or email already exists.', 'USER_EXISTS');
  }

  const user = await User.create({ username, email, password });
  await Wallet.create({ userId: user._id, balances: { VES: 0, INR: 0 } });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
});

const login = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const isMatch = user ? await user.comparePassword(password) : false;

  if (!user || !isMatch) {
    // Same message whether the email or the password was wrong - don't leak which.
    throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  }
  if (!user.isActive) {
    throw new ApiError(401, 'This account has been disabled.', 'ACCOUNT_DISABLED');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user: { id: user._id, username: user.username, email: user.email } });
});

module.exports = { register, login, me };
