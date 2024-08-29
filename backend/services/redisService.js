const redis = require('redis')
const redisConfig = require('../config/redisConfig')

const redisClient = redis.createClient({
  url: `redis://${redisConfig.host}:${redisConfig.port}`,
  database: redisConfig.db
})

redisClient.on('error', (err) => {
  console.error(`Redis error: ${err}`)
})

// Connect to Redis when the application starts
async function connectRedis () {
  try {
    await redisClient.connect()
    console.log('Connected to Redis')
  } catch (error) {
    console.error(`Error connecting to Redis: ${error}`)
  }
}

async function testRedisConnection () {
  try {
    await connectRedis() // Connect to Redis

    await redisClient.set('my_key', 'my_value')
    const value = await redisClient.get('my_key')
    console.log(value) // Should output 'my_value'
  } catch (error) {
    console.error(`Error: ${error}`)
  } finally {
    redisClient.quit() // Disconnect after all operations are done
  }
}
// Ensure to connect Redis when your application starts
connectRedis()
module.exports = { testRedisConnection, redisClient, connectRedis }
