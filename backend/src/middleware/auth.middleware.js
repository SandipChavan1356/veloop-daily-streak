const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { env } = require('../config/env');
const { User } = require('../models');

const NOT_AUTH = 'Please log in to continue.';

// Identity comes from the JWT only. Any userId in body/query/params is never used.
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, NOT_AUTH, 'NOT_AUTHENTICATED');
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], env.jwtSecret, { algorithms: ['HS256'] });
  } catch (err) {
    throw new ApiError(401, NOT_AUTH, 'INVALID_TOKEN');
  }

  if (!decoded || !mongoose.isValidObjectId(decoded.id)) {
    throw new ApiError(401, NOT_AUTH, 'INVALID_TOKEN');
  }

  const user = await User.findById(decoded.id).select('_id username isActive');
  if (!user || !user.isActive) {
    throw new ApiError(401, NOT_AUTH, 'USER_NOT_FOUND');
  }

  req.user = { id: user._id.toString(), username: user.username };
  next();
});

module.exports = { protect };
