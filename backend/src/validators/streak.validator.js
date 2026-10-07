const ApiError = require('../utils/ApiError');

const validateClaimBody = (req, res, next) => {
  const { day, sessionToken } = req.body || {};

  if (day !== undefined && (typeof day !== 'number' || !Number.isInteger(day) || day < 1 || day > 365)) {
    throw new ApiError(400, 'Invalid request.', 'INVALID_INPUT');
  }
  if (sessionToken !== undefined && (typeof sessionToken !== 'string' || sessionToken.length > 256)) {
    throw new ApiError(400, 'Invalid request.', 'INVALID_INPUT');
  }

  next();
};

module.exports = { validateClaimBody };
