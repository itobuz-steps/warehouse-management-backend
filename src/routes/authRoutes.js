import express from 'express';
import AuthController from '../controllers/AuthController.js';
import AuthValidation from '../validations/middlewares/AuthValidations.js';

const router = express.Router();
const authController = new AuthController();
const authValidation = new AuthValidation();

router.post('/signup', authValidation.signupValidation, authController.signup); // send email
router.get('/signup/:token', authController.verify); // send name and password

router.post('/login', authValidation.loginValidation, authController.login);

router.post(
  '/send-otp/',
  authValidation.sendOtpValidation,
  authController.sendOtp
);

router.post(
  '/forgot-password/:email',
  authValidation.forgotPasswordValidation,
  authController.forgotPassword
);

export default router;
