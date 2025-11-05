import tokenValidator from "../utils/verifyToken.js";

export default class ProfileController {
  updateProfile = async (req, res, next) => {
    try {
      const bearer_token = req.headers.authorization;
      const access_token = bearer_token.split(' ')[1];
      const user = await tokenValidator(access_token);

      if (!user) {
        res.status(401);
        throw new Error(`User doesn't Exists`);
      }

      const name = req.body.name || '';
      const profileImage = req.file ? req.file.filename : '';

      if (!profileImage) {
        user.name = name;
      } else {
        user.name = name;
        user.profileImage = profileImage;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully!',
      });
    } catch (err) {
      next(err);
    }
  };
}
