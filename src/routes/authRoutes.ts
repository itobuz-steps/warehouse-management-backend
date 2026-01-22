import express from 'express';
import AuthController from '../controllers/AuthController.js';
import AuthValidation from '../validations/middlewares/AuthValidations.js';
import { validate } from '../validations/middlewares/validator.js';
import verifyToken from '../validations/middlewares/verifyToken.js';
import {
  forgotPasswordSchema,
  loginSchema,
  sendOtpSchema,
  signupUserSchema,
} from '../validations/schema/authSchema.js';

const router = express.Router();
const authController = new AuthController();
const authValidation = new AuthValidation();

router.post('/signup', authValidation.signupValidation, authController.signup); // send email
router.post('/signup/:token', authController.verify);
router.post(
  '/signup/set-password/:token',
  validate(signupUserSchema),
  authController.setPassword
); // send name and password

router.post('/login', validate(loginSchema), authController.login); // email and password

router.post('/refresh', verifyToken, authController.refresh);

router.post('/send-otp/', validate(sendOtpSchema), authController.sendOtp);

router.post(
  '/forgot-password/:email',
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

export default router;
