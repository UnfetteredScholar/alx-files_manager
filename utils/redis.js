import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.isClientConnected = true;
    this.client = createClient();
    this.client.on('error', (err) => { console.log(err.message || err.toString()); this.isClientConnected = false; });

    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  isAlive() {
    return this.isClientConnected;
  }

  async get(key) {
    const redisGet = promisify(this.client.get).bind(this.client);

    const value = await redisGet(key);
    return value;
  }

  async set(key, value, exp) {
    const redisSetEx = promisify(this.client.setex).bind(this.client);
    await redisSetEx(key, exp, value);
  }

  async del(key) {
    const redisDel = promisify(this.client.del).bind(this.client);

    await redisDel(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
