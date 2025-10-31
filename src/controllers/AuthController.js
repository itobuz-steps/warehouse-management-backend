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
      console.log('Check');
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
      const verificationToken = req.params.token;
      const tokenData = jwt.verify(verificationToken, config.TOKEN_SECRET);
      const email = tokenData.email;
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
      next(err);
    }
  };
}
