// import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import { basicAuthenticate, xTokenAuthenticate } from '../middleware/auth';

const injectRoutes = (api) => {
  api.get('/status', (req, res) => { AppController.getStatus(req, res); });
  api.get('/stats', async (req, res) => { await AppController.getStats(req, res); });

  api.post('/users', async (req, res) => { await UsersController.postNew(req, res); });
  api.get('/users/me', xTokenAuthenticate, UsersController.getMe);

  api.get('/connect', basicAuthenticate, AuthController.getConnect);
  api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);

  api.post('/files', xTokenAuthenticate, FilesController.postUpload);
  api.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
  api.get('/files', xTokenAuthenticate, FilesController.getIndex);
};

export default injectRoutes;
