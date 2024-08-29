require('dotenv').config() // Load environment variables from .env file

const redis = require('redis')

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10), // Ensure port is converted to int
  db: parseInt(process.env.REDIS_DB, 10) // Ensure DB number is converted to int
}

console.log('Redis Configuration:')
console.log(redisConfig)

const redisClient = redis.createClient(redisConfig)

redisClient.on('error', (err) => {
  console.error(`Redis error: ${err}`)
})

module.exports = redisClient
