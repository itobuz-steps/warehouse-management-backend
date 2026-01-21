import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config/config.js';
import User from '../../models/userModel.js';
import type { AppMiddleware } from '../../types/express.js';

type TokenPayload = JwtPayload & {
  id: string;
};

const isTokenPayload = (payload: unknown): payload is TokenPayload => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'id' in payload &&
    typeof (payload as any).id === 'string'
  );
};

const getSecret = (key: string | undefined, name: string): string => {
  if (!key) {
    throw new Error(`${name} is not defined`);
  }
  return key;
};

export const verifyToken: AppMiddleware = async (req, res, next) => {
  try {
    if (req.path.includes('qr')) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(400);
      throw new Error('No Token Provided');
    }

    const token = authHeader.split(' ')[1];

    const secret = req.path.includes('refresh')
      ? getSecret(config.REFRESH_SECRET_KEY, 'REFRESH_SECRET_KEY')
      : getSecret(config.ACCESS_SECRET_KEY, 'ACCESS_SECRET_KEY');

    const decoded = jwt.verify(token, secret);

    if (!isTokenPayload(decoded)) {
      res.status(401);
      throw new Error('Invalid token payload');
    }

    const user = await User.findOne({
      _id: decoded.id,
      isDeleted: false,
    }).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found!');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('User has been blocked!');
    }

    req.userId = decoded.id;
    req.user = user;

    return next();
  } catch (error) {
    res.status(401);
    return next(error);
  }
};
