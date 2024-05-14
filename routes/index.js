// import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const injectRoutes = (api) => {
  api.get('/status', (req, res) => { AppController.getStatus(req, res); });
  api.get('/stats', async (req, res) => { await AppController.getStats(req, res); });

  api.post('/users', async (req, res) => { await UsersController.postNew(req, res); });
};

export default injectRoutes;
