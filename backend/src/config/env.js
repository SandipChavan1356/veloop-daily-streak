// Lazy getters so values are read AFTER dotenv / test setup has populated process.env.
const toOrigins = (v) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const env = {
  get nodeEnv() {
    return process.env.NODE_ENV || 'development';
  },
  get isProduction() {
    return this.nodeEnv === 'production';
  },
  get port() {
    return parseInt(process.env.PORT, 10) || 5000;
  },
  get mongoUri() {
    return process.env.MONGO_URI;
  },
  get jwtSecret() {
    return process.env.JWT_SECRET;
  },
  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '7d';
  },
  get corsOrigins() {
    return toOrigins(process.env.CORS_ORIGIN);
  },
  get trustProxy() {
    const v = process.env.TRUST_PROXY;
    if (!v || v === '0' || v === 'false') return false;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? true : n;
  },
  // Dev tools can never be enabled in production, even by mistake.
  get enableDevTools() {
    return process.env.ENABLE_DEV_TOOLS === 'true' && !this.isProduction;
  },
};

const validateEnv = () => {
  const missing = ['MONGO_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET is too short (use at least 32 random characters).');
  }
  if (env.isProduction && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }
};

module.exports = { env, validateEnv };
