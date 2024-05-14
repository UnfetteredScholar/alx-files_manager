import { getUserFromXToken, getAuthorizationUser } from '../utils/auth';

export async function basicAuthenticate(req, res, next) {
  const user = await getAuthorizationUser(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
}

export async function xTokenAuthenticate(req, res, next) {
  const user = await getUserFromXToken(req);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
}
