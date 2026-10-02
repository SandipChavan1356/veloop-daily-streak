const mongoose = require("mongoose");
const { env } = require("./env");
const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  const conn = await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${conn.connection.host}`);

  try {
    const hello = await conn.connection.db.admin().command({ hello: 1 });
    const supportsTx = Boolean(hello.setName) || hello.msg === "isdbgrid";
    if (!supportsTx) {
      console.warn(
        "[WARN] MongoDB is running standalone. Reward claims need transactions -> use MongoDB Atlas " +
          "or start mongod with --replSet.",
      );
    }
  } catch (err) {
    console.warn("[WARN] Could not verify MongoDB topology:", err.message);
  }

  const models = require("../models");
  await Promise.all(Object.values(models).map((m) => m.init()));
  return conn;
};

module.exports = connectDB;
