const redis = require('redis');
const redisConfig = require('../config/redisConfig');

const redisClient = redis.createClient(redisConfig);

redisClient.on('error', (err) => {
  console.error(`Redis error: ${err}`);
});


async function testRedisConnection() {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");

    await redisClient.set('my_key', 'my_value');
    const value = await redisClient.get('my_key');
    console.log(value);
  } catch (error) {
    console.error(`Error: ${error}`);
  
  } finally {
    // Only call quit() when done
    redisClient.quit();
  }
}

module.exports = { testRedisConnection, redisClient };
