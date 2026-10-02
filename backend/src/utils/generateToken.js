const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const generateToken = (userId) =>
  jwt.sign({ id: userId.toString() }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: env.jwtExpiresIn,
  });

module.exports = generateToken;
