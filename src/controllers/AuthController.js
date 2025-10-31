import bcrypt from 'bcrypt';

import User from '../models/userModel.js';
import SendInvitation from '../utils/SendInvitation.js';
import TokenGenerator from '../utils/TokenGenerator.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import bcrypt from 'bcrypt';

const mailSender = new SendInvitation();
const tokenGenerator = new TokenGenerator();

export default class AuthController {
  signup = async (req, res, next) => {
    try {
      const email = req.body.email;
      const isUser = await User.findOne({ email });
      let newUser;

      if (isUser && isUser.isVerified) {
        res.status(400);

        throw new Error('User Already Exists');
      } else if (!isUser) {
        console.log('user created');
        newUser = new User(req.body);

        await newUser.save();
      }

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
      const verificationToken = req.params.token;
      const tokenData = jwt.verify(verificationToken, config.TOKEN_SECRET);
      const email = tokenData.email;
      const appUser = await User.findOne({ email });

      if (appUser.isVerified) {
        res.status(400);

        throw new Error('User already verified');
      }

      const user = await User.findOneAndUpdate(
        { email: email },
        {
          password: await bcrypt.hash(req.body.password, 10),
          name: req.body.name,
          isVerified: true,
        }
      );

      res.status(200).json({
        message: 'Registration Successful',
        success: true,
        user: user,
      });
    } catch (err) {
      if (err.message == 'jwt expired') {
        res.status(401).json({
          message: 'Link Expired',
          success: false,
        });
      }
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
