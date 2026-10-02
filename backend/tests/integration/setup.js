// Shared MongoDB Memory Replica Set bootstrap for integration tests.
// Requires internet access on first run (downloads a mongod binary) - this is
// normal for mongodb-memory-server and only happens once per machine (cached
// under ~/.cache/mongodb-binaries afterwards).
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-please-do-not-use-in-prod-xxxxxxxx';
process.env.ENABLE_DEV_TOOLS = 'true';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let replSet;

const start = async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  process.env.MONGO_URI = replSet.getUri('veloop_test');
  await mongoose.connect(process.env.MONGO_URI);
  const models = require('../../src/models');
  await Promise.all(Object.values(models).map((m) => m.init()));
};

const stop = async () => {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
};

const clearDb = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
};

module.exports = { start, stop, clearDb };
