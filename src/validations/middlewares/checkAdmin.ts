import USER_TYPES from '../../constants/userConstants.js';
import User from '../../models/userModel.js';
import type { AppMiddleware } from '../../types/express.js';

const isAdmin: AppMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await User.findOne({
      $and: [{ _id: userId }, { isDeleted: false }],
    });

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (user.role !== USER_TYPES.ADMIN) {
      res.status(403); // Forbidden
      throw new Error('User is not an admin');
    }

    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'jwt expired') {
      res.status(401);
    }
    next(error);
  }
};

export default isAdmin;
