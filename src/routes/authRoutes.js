import express from 'express';
import AuthController from '../controllers/AuthController.js';
import AuthValidation from '../validations/middlewares/AuthValidations.js';

const router = express.Router();
const authController = new AuthController();
const authValidation = new AuthValidation();

console.log('check');

router.post('/signup', authValidation.signupValidation, authController.signup);
router.get('/signup/:token', authController.verify);

router.post('/login', authValidation.loginValidation, authController.login);

export default router;
