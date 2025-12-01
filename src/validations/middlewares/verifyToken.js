import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

export default function verifyToken(req, res, next) {
  try {
    if (!req.headers.authorization) {
      res.status(400);
      throw new Error('No Token Provided');
    }

    let payload;

    if (req.path.includes('refresh')) {
      const refresh_token = req.headers.authorization.split(' ')[1];

      payload = jwt.verify(refresh_token, config.REFRESH_SECRET_KEY);
    } else {
      const access_token = req.headers.authorization.split(' ')[1];

      payload = jwt.verify(access_token, config.ACCESS_SECRET_KEY);
    }

    req.userId = payload.id;

    if (req.body) {
      req.body.userId = payload.id;
    }

    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
}
