import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import OTP from '../models/otpModel.js';
import SendInvitation from '../utils/SendEmail.js';
import TokenGenerator from '../utils/TokenGenerator.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import OtpGenerator from '../utils/OtpGenerator.js';

const mailSender = new SendInvitation();
const tokenGenerator = new TokenGenerator();
const genOtp = new OtpGenerator();

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

      const link = `${req.protocol}://${config.FRONTEND_URL}/pages/signup.html?token=${token}`;

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

      res.status(200).json({
        message: 'token valid',
        success: true,
        tokenData,
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

  setPassword = async (req, res, next) => {
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
        message: 'Registration successful.',
        success: true,
        user,
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

      const tokens = tokenGenerator.generateToken(user._id);
      const accessToken = tokens.access;
      const refreshToken = tokens.refresh;

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

  forgotPassword = async (req, res, next) => {
    try {
      const prevEmail = req.params.email;

      const { email, otp, password } = req.body;

      if (prevEmail !== email) {
        res.status(404);
        throw new Error(
          'Email mismatch: please use the same email address that received the OTP.'
        );
      }

      const user = await User.findOne({ email });

      if (!user) {
        res.status(404);
        throw new Error(`User does not exist!`);
      }

      if (otp.length !== 6) {
        res.status(400);
        throw new Error(`OTP should be 6 digits!`);
      }

      const otpDoc = await OTP.findOne({ email });

      const otpArrLength = otpDoc.otp.length;

      if (!otpDoc || otpArrLength === 0) {
        res.status(400);
        throw new Error(`Please resend OTP!`);
      }

      const latestOtp = otpDoc.otp[otpArrLength - 1];
      const otpCreated = new Date(otpDoc.updatedAt).getTime();

      if (Date.now() - otpCreated > 60 * 5000) {
        res.status(403);
        throw new Error(`OTP expired, please request a new one`);
      }

      if (latestOtp !== otp) {
        res.status(401);
        return next(new Error(`Wrong OTP`));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  sendOtp = async (req, res, next) => {
    try {
      const email = req.body.email;
      const isUser = await User.findOne({ email });

      if (!isUser) {
        res.status(404);
        throw new Error('User does not exists');
      }

      const userOtpDoc = await OTP.findOne({ email });
      console.log(userOtpDoc);

      if (userOtpDoc) {
        const lastUpdated = new Date(userOtpDoc.updatedAt).getTime();
        const now = Date.now();

        if (now - lastUpdated < 1000 * 60) {
          res.status(425);
          throw new Error('Please wait 1 minute before requesting another OTP');
        }
      }

      genOtp.generateOtp(email);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        email,
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const refresh_token = req.headers.authorization.split(' ')[1];
      const refresh_secret = config.REFRESH_SECRET_KEY;

      const decoded = jwt.verify(refresh_token, refresh_secret);

      const tokens = tokenGenerator.generateToken(decoded.id);
      const accessToken = tokens.access;
      const refreshToken = tokens.refresh;

      res.status(200).json({
        message: 'Token Regenerated successfully',
        success: true,
        accessToken,
        refreshToken,
      });
    } catch (err) {
      res.status(401);
      next(err);
    }
  };
}
