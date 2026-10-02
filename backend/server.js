require('dotenv').config();
const { validateEnv, env } = require('./src/config/env');

validateEnv();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const start = async () => {
  await connectDB();
  const server = app.listen(env.port, () => {
    console.log(`VELoop Daily Streak API running on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
