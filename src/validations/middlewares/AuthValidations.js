import { signupSchema, loginSchema, forgotPasswordSchema, sendOtpSchema} from '../schema/authSchema.js';
import { ValidationError } from 'yup';

export default class AuthValidation {
  signupValidation = async (req, res, next) => {
    try {
      if (req.headers.role === 'admin') {
        req.body.role = req.headers.role;
      } else {
        req.body.role = 'manager';
      }

      await signupSchema.validate(req.body, {
        abortEarly: false, // return all validation errors
        stripUnknown: true, // remove unexpected fields
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        next(new Error(err.errors.join(', ')));
      }

      next(err);
    }
  };

  loginValidation = async (req, res, next) => {
    try {
      await loginSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        next(new Error(err.errors.join(', ')));
      }

      next(err);
    }
  };

  forgotPasswordValidation = async (req, res, next) => {
    try {
      await forgotPasswordSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        next(new Error(err.errors.join(', ')));
      }

      next(err);
    }
  };

  sendOtpValidation = async (req, res, next) => {
    try {
      await sendOtpSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400);
        next(new Error(err.errors.join(', ')));
      }

      next(err);
    }
  };
  
}
