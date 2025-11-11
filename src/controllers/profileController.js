import User from '../models/userModel.js';

export default class ProfileController {
  updateProfile = async (req, res, next) => {
    try {
      const user = await User.findById({ _id: req.userId, isDeleted: false });

      if (!user) {
        res.status(401);
        throw new Error(`User doesn't Exists`);
      }

      const profile = req.file ? req.file.filename : '';

      user.name = req.body.name || '';
      ((user.profileImage = `${req.protocol}://${req.get('host')}/uploads/user/${profile}`),
        await user.save());

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully!',
      });
    } catch (err) {
      next(err);
    }
  };

  getUserDetails = async (req, res, next) => {
    try {
      const user = await User.findOne({ _id: req.userId, isDeleted: false });

      if (!user) {
        res.status(401);
        throw new Error(`User doesn't Exists`);
      }

      let verifiedManagers = [];
      let unverifiedManagers = [];

      if (user.role === 'admin') {
        verifiedManagers = await User.find({
          role: 'manager',
          isVerified: true,
          isDeleted: false,
        });
        unverifiedManagers = await User.find({
          role: 'manager',
          isVerified: false,
          isDeleted: false,
        });
      }

      res.status(200).json({
        message: 'Data fetched successfully!',
        success: true,
        data: { user, verifiedManagers, unverifiedManagers },
      });
    } catch (err) {
      next(err);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      const user = await User.findById({ _id: req.userId, isDeleted: false });

      if (!user) {
        res.status(404);
        throw new Error(`User doesn't Exists`);
      }
      console.log(user);

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { isDeleted: true },
        { new: true }
      );

      console.log(updatedUser);

      res.status(200).json({
        message: 'User deleted Successfully!',
        success: true,
      });
    } catch (err) {
      next(err);
    }
  };
}
