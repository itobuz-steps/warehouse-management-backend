import bcrypt from 'bcrypt';

import User from '../models/userModel.js';
import SendInvitation from '../utils/SendInvitation.js';
import TokenGenerator from '../utils/TokenGenerator.js';

const mailSender = new SendInvitation();
const tokenGenerator = new TokenGenerator();

export default class AuthController {
  signup = async (req, res, next) => {
    try {
      const email = req.body.email;
      const isUser = await User.findOne({ email });

      if (isUser) {
        res.status(400);

        throw new Error('User Already Exists');
      }

      const newUser = new User(req.body);
      await newUser.save();

      const token = tokenGenerator.invitationToken(email);

      const link = `${req.protocol}://${req.get('host')}/signup/${token}`;
      mailSender.sendInvitationEmail(email, link);

      res.status(200).json({
        message: 'Invitation Link Sent Successfully.',
        success: true,
        user: newUser,
      });
    } catch (err) {
      next(err);
    }
  };

  verify = async (req, res, next) => {
    try {
      console.log('verify token');
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const user = await User.findOne({ email });

      if (!user) {
        res.status(401);
        throw new Error(`User doesn't Exists`);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        res.status(401);
        throw new Error('Invalid Password');
      }

      const tokenGenerator = new TokenGenerator();

      const accessToken = tokenGenerator.accessToken(user._id);
      const refreshToken = tokenGenerator.refreshToken(user._id);

      res.status(200).json({
        message: 'User Login Successful',
        success: true,
        accessToken,
        refreshToken,
        user,
      });
    } catch (err) {
      next(err);
    }
  };
}
