const ApiError = require('../utils/ApiError');

// Defence-in-depth against NoSQL operator injection ({"email": {"$gt": ""}}).
const hasUnsafeKey = (value, depth = 0) => {
  if (depth > 6) return true;
  if (Array.isArray(value)) return value.some((v) => hasUnsafeKey(v, depth + 1));
  if (value && typeof value === 'object') {
    return Object.keys(value).some(
      (k) => k.startsWith('$') || k.includes('.') || hasUnsafeKey(value[k], depth + 1)
    );
  }
  return false;
};

const sanitizeInput = (req, res, next) => {
  if (hasUnsafeKey(req.body) || hasUnsafeKey(req.query)) {
    throw new ApiError(400, 'Invalid request.', 'INVALID_INPUT');
  }
  next();
};

module.exports = { sanitizeInput };
