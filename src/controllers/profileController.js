import USER_TYPES from '../constants/userConstants.js';
import User from '../models/userModel.js';

export default class ProfileController {
  updateProfile = async (req, res, next) => {
    try {
      const user = req.user;
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

  getCurrentUser = async (req, res, next) => {
    try {
      const user = req.user;

      res.status(200).json({
        message: 'Data fetched successfully.',
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  };

  getUserDetails = async (req, res, next) => {
    try {
      const user = req.user;

      let verifiedManagers = [];
      let unverifiedManagers = [];

      if (user.role === USER_TYPES.ADMIN) {
        verifiedManagers = await User.find({
          role: USER_TYPES.MANAGER,
          isVerified: true,
          isDeleted: false,
        });
        unverifiedManagers = await User.find({
          role: USER_TYPES.MANAGER,
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
      const user = req.user;

      await User.findByIdAndUpdate(
        user._id,
        { isDeleted: true },
        { new: true }
      );

      res.status(200).json({
        message: 'User deleted Successfully!',
        success: true,
      });
    } catch (err) {
      next(err);
    }
  };

  changeStatus = async (req, res, next) => {
    try {
      const manager = await User.findOneAndUpdate(
        {
          _id: req.params.managerId,
          isVerified: true,
          isDeleted: false,
          role: USER_TYPES.MANAGER,
        },
        [{ $set: { isActive: { $not: '$isActive' } } }],
        { new: true }
      );

      if (!manager) {
        throw new Error('Manager does not exist');
      }

      res.status(200).json({
        message: manager.isActive
          ? 'Manager Unblocked Successfully'
          : 'Manager Blocked Successfully',
        success: true,
      });
    } catch (err) {
      next(err);
    }
  };
}
