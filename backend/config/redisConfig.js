require('dotenv').config({ path: __dirname + '/../../.env' });

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  db: parseInt(process.env.REDIS_DB, 10)
};

module.exports = redisConfig;
