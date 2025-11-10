import User from '../models/userModel.js';

export default class ProfileController {
  updateProfile = async (req, res, next) => {
    try {
      const user = await User.findById({_id: req.userId});

      if (!user) {
        res.status(401);
        throw new Error(`User doesn't Exists`);
      }
 
      user.name = req.body.name || '';
      user.profileImage = req.file ? req.file.filename : '';

      await user.save();

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
      const user = await User.findById({_id: req.userId});

      if (!user) {
        res.status(401);
        throw new Error(`User doesn't Exists`);
      }

      let managers = [];

      if (user.role === 'admin') {
        managers = await User.find({ role: 'manager' });
        console.log(managers);
      }

      res.status(200).json({
        message: 'Data fetched successfully!',
        success: true,
        data: {
          user,
          managerData: managers || [],
        },
      });

    } catch (err) {
      next(err);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      const user = await User.findById({_id: req.userId});
    
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
