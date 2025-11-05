import express from 'express';
import AuthController from '../controllers/AuthController.js';
import AuthValidation from '../validations/middlewares/AuthValidations.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const authController = new AuthController();
const authValidation = new AuthValidation();

const storage = multer.diskStorage({
  destination: 'uploads/user',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage, limits: { fileSize: 0.5 * 1024 * 1024 } });

router.post('/signup', authValidation.signupValidation, authController.signup); // send email
router.post('/signup/:token', authController.verify);
router.post('/signup/set-password/:token', authController.setPassword); // send name and password

router.post('/login', authValidation.loginValidation, authController.login); // email and password

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

router.patch(
  '/update-profile',
  upload.single('profile-img'),
  // authValidation.updateProfileValidation,
  authController.updateProfile
);

export default router;
