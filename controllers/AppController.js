import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(request, response) {
    const stats = { redis: redisClient.isAlive(), db: dbClient.isAlive() };

    response.json(stats);
  }

  static async getStats(request, response) {
    const stats = {
      users: await dbClient.nbUsers(),
      files: await dbClient.nbFiles(),
    };
    response.status = 200;
    response.json(stats);
  }
}

module.exports = AppController;
