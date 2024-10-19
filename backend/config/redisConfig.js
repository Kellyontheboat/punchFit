const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  db: parseInt(process.env.REDIS_DB, 10)
}

module.exports = redisConfig
