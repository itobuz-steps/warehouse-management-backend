import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import OTP from '../models/otpModel.js';

import SendInvitation from '../utils/SendEmail.js';
import TokenGenerator from '../utils/TokenGenerator.js';
import config from '../config/config.js';
import OtpGenerator from '../utils/OtpGenerator.js';

import type { AppRequest, AppResponse, AppNext } from '../types/express.js';

const mailSender = new SendInvitation();
const tokenGenerator = new TokenGenerator();
const genOtp = new OtpGenerator();

type InvitationTokenPayload = jwt.JwtPayload & {
  email: string;
};

export default class AuthController {
  signup = async (
    req: AppRequest<{}, { email: string }>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const email = req.body.email;
      const isUser = await User.findOne({ email });
      let newUser;

      if (isUser && isUser.isVerified) {
        res.status(400);

        throw new Error('User Already Exists');
      } else if (!isUser) {
        newUser = new User(req.body);

        await newUser.save();
      }

      const token = tokenGenerator.invitationToken(email);

      const link = `${req.protocol}://${config.FRONTEND_URL}/pages/signup.html?token=${token}`;

      mailSender.sendInvitationEmail(email, link, next);

      res.status(200).json({
        message: 'Invitation Link Sent Successfully.',
        success: true,
      });
    } catch (err) {
      next(err);
    }
  };

  verify = async (
    req: AppRequest<{ token: string }>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const tokenData = jwt.verify(
        req.params.token,
        config.TOKEN_SECRET
      ) as InvitationTokenPayload;

      res.status(200).json({
        message: 'token valid',
        success: true,
        data: tokenData,
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message == 'jwt expired') {
          res.status(401).json({
            message: 'Link Expired',
            success: false,
          });
        }
      }
      next(err);
    }
  };

  setPassword = async (
    req: AppRequest<{ token: string }, { password: string; name: string }>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const tokenData = jwt.verify(
        req.params.token,
        config.TOKEN_SECRET
      ) as InvitationTokenPayload;

      const user = await User.findOneAndUpdate(
        { email: tokenData.email, isVerified: false },
        {
          password: await bcrypt.hash(req.body.password, 10),
          name: req.body.name,
          isVerified: true,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!user) {
        res.status(400);
        throw new Error('User already verified');
      }

      res.status(200).json({
        message: 'Registration successful.',
        success: true,
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message == 'jwt expired') {
          res.status(401).json({
            message: 'Link Expired',
            success: false,
          });
        }
      }
      next(err);
    }
  };

  login = async (
    req: AppRequest<{}, { email: string; password: string }>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const user = await User.findOneAndUpdate(
        {
          email: req.body.email,
          isDeleted: false,
          isActive: true,
        },
        {
          lastLogin: Date.now(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!user) {
        res.status(401);
        throw new Error(`User doesn't Exists or Blocked`);
      }

      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!passwordMatch) {
        res.status(401);
        throw new Error('Invalid Password');
      }

      const tokens = tokenGenerator.generateToken(
        (user._id as string).toString()
      );

      res.status(200).json({
        message: 'User Login Successful',
        success: true,
        data: {
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (
    req: AppRequest<{}, { email: string; otp: string; password: string }>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const { email, otp, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404);
        throw new Error('User does not exist!');
      }

      if (otp.length !== 6) {
        res.status(400);
        throw new Error('OTP should be 6 digits!');
      }

      const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000);

      const otpDoc = await OTP.findOne(
        {
          email: email,
          updatedAt: { $gte: oneMinAgo },
          otp: { $exists: true, $ne: [] },
        },
        { _id: 0, email: 0, otp: { $slice: -1 } }
      );

      if (!otpDoc || otpDoc.otp[0].length != 6) {
        res.status(400);
        throw new Error('OTP expired or not found, please resend OTP!');
      }

      if (otpDoc.otp[0] !== otp) {
        res.status(401);
        return next(new Error('Invalid OTP'));
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  sendOtp = async (
    req: AppRequest<{}, { email: string }>,
    res: AppResponse,
    next: AppNext
  ): Promise<void> => {
    try {
      const email = req.body.email;
      const isUser = await User.findOne({ email });

      if (!isUser) {
        res.status(404);
        throw new Error('User does not exists');
      }

      const userOtpDoc = await OTP.findOne({ email });

      if (userOtpDoc) {
        const lastUpdated = new Date(userOtpDoc.updatedAt).getTime();
        const now = Date.now();

        if (now - lastUpdated < 1000 * 60) {
          res.status(425);
          throw new Error('Please wait 1 minute before requesting another OTP');
        }
      }

      genOtp.generateOtp(email, next);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: AppRequest, res: AppResponse, next: AppNext) => {
    try {
      if (!req.userId) {
        res.status(401);
        throw new Error('Unauthorized');
      }

      const tokens = tokenGenerator.generateToken(req.userId);

      res.status(200).json({
        message: 'Token Regenerated successfully',
        success: true,
        data: {
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
        },
      });
    } catch (err) {
      res.status(401);
      next(err);
    }
  };
}
