import USER_TYPES from '../../constants/userConstants.js';
import type { AppMiddleware } from '../../types/express.js';
import { signupSchema } from '../schema/authSchema.js';
import { ValidationError } from 'yup';

type SignupBody = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

export default class AuthValidation {
  signupValidation: AppMiddleware<{}, SignupBody> = async (
    req,
    res,
    next
  ): Promise<void> => {
    try {
      if (req.headers.role === USER_TYPES.ADMIN) {
        req.body.role = req.headers.role;
      } else {
        req.body.role = USER_TYPES.MANAGER;
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
}
