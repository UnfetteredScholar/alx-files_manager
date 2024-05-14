import { Express } from 'express';
import AppController from '../controllers/AppController';

const injectRoutes = (api) => {
  api.get('/status', (req, res) => { AppController.getStatus(req, res); });
  api.get('/stats', async (req, res) => { await AppController.getStats(req, res); });
};

export default injectRoutes;
