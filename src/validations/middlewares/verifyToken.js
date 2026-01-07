import jwt from 'jsonwebtoken';
import config from '../../config/config.js';
import User from '../../models/userModel.js';

export default async function verifyToken(req, res, next) {
  try {
    if (!req.path.includes('qr')) {
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

      const user = await User.findOne({
        $and: [{ _id: payload.id }, { isDeleted: false }],
      }).select('-password');

      if (!user) {
        res.status(404);
        throw new Error('User not found!');
      }

      if (!user.isActive) {
        res.status(404);
        throw new Error('User has been blocked!');
      }

      req.userId = payload.id;
      req.user = user;

      // if (req.body) {
      //   req.body.userId = payload.id;
      //   req.body.user = user;
      // }
    }

    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
}
