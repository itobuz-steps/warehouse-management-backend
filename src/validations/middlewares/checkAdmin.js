import User from '../../models/userModel.js';

export default async function isAdmin(req, res, next) {
  try {
    const userId = req.userId;

    const user = await User.findOne({
      $and: [{ _id: userId }, { isDeleted: false }],
    });

    if (user.role !== 'admin') {
      res.status(403); // Forbidden
      throw new Error('User is not an admin');
    }

    next();
  } catch (error) {
    if (error.message == 'jwt expired') {
      res.status(401);
    }
    next(error);
  }
}
