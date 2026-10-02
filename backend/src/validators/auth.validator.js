const ApiError = require('../utils/ApiError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body || {};

  if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
    throw new ApiError(400, 'Username must be between 3 and 30 characters.', 'INVALID_INPUT');
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    throw new ApiError(400, 'A valid email is required.', 'INVALID_INPUT');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.', 'INVALID_INPUT');
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    throw new ApiError(400, 'Email and password are required.', 'INVALID_INPUT');
  }
  next();
};

module.exports = { validateRegister, validateLogin };
