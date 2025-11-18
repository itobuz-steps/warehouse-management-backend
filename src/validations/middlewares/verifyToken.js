import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

export default function verifyToken(req, res, next) {
  try {
    if (!req.headers.authorization) {
      res.status(400);
      throw new Error('No Token Provided');
    }

    const access_token = req.headers.authorization.split(' ')[1];

    const payload = jwt.verify(access_token, config.ACCESS_SECRET_KEY);

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
